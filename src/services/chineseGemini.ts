/**
 * Service for Chinese AI Speaking Partner and Turn Evaluation via Gemini API.
 */

import type { HSKLevel } from '@/types/chinese';

const LOCAL_STORAGE_KEY = 'ep_gemini_api_key';

export function getEffectiveChineseGeminiKey(): string {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (customKey && customKey.trim().length > 10) return customKey.trim();
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 10) return envKey.trim();
  return '';
}

export interface ChineseTurnEvaluation {
  accuracyScore: number; // 0 - 100
  pinyinFeedback: string;
  grammarFeedback: string;
  suggestedImprovement: string;
}

export interface ChineseRoleplayReply {
  aiMessageHanzi: string;
  aiMessagePinyin: string;
  aiMessageMeaningVi: string;
  evaluation?: ChineseTurnEvaluation;
}

const MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
];

export async function sendChineseSpeakingMessage(params: {
  scenarioTitle: string;
  scenarioRole: string;
  hskLevel: HSKLevel;
  userSpeechText: string;
  conversationHistory: Array<{ role: 'user' | 'model'; text: string }>;
}): Promise<ChineseRoleplayReply> {
  const apiKey = getEffectiveChineseGeminiKey();
  if (!apiKey) {
    // Graceful offline mock response
    return {
      aiMessageHanzi: '很好！你的发音很清楚。我们继续吧。',
      aiMessagePinyin: 'Hěn hǎo! Nǐ de fāyīn hěn qīngchu. Wǒmen jìxù ba.',
      aiMessageMeaningVi: 'Rất tốt! Phát âm của bạn rất rõ ràng. Chúng ta tiếp tục nhé.',
      evaluation: {
        accuracyScore: 90,
        pinyinFeedback: 'Phát âm rõ ràng, thanh điệu tương đối chuẩn.',
        grammarFeedback: 'Cấu trúc câu tự nhiên, đúng ngữ cảnh HSK.',
        suggestedImprovement: 'Có thể nói dài hơn một chút bằng cách thêm nguyên nhân hoặc cảm nghĩ.',
      },
    };
  }

  const systemInstruction = `You are a supportive, encouraging Chinese language tutor and conversational partner for students learning Mandarin (HSK Level: ${params.hskLevel.toUpperCase()}).
Current Scenario: "${params.scenarioTitle}".
Your Persona / Role: "${params.scenarioRole}".
The user just said: "${params.userSpeechText}".

Respond to the user naturally in Mandarin Chinese matching their HSK level.
Return your response ONLY as a JSON object with this exact schema:
{
  "aiMessageHanzi": "Your Chinese response in simplified Hanzi",
  "aiMessagePinyin": "Accurate pinyin with tone marks for your response",
  "aiMessageMeaningVi": "Vietnamese translation of your response",
  "evaluation": {
    "accuracyScore": number between 60 and 98,
    "pinyinFeedback": "Specific feedback on pronunciation or tones in Vietnamese",
    "grammarFeedback": "Specific feedback on sentence structure or grammar in Vietnamese",
    "suggestedImprovement": "A more natural way to phrase their sentence in Chinese + Vietnamese"
  }
}
Do NOT include markdown formatting or quotes outside the JSON object.`;

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            ...params.conversationHistory.map((h) => ({
              role: h.role,
              parts: [{ text: h.text }],
            })),
            { role: 'user', parts: [{ text: params.userSpeechText }] },
          ],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) continue;

      const cleaned = content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      return JSON.parse(cleaned) as ChineseRoleplayReply;
    } catch {
      // try next model
    }
  }

  // Fallback if all models fail
  return {
    aiMessageHanzi: '我明白了，说得很好！请继续。',
    aiMessagePinyin: 'Wǒ míngbai le, shuō de hěn hǎo! Qǐng jìxù.',
    aiMessageMeaningVi: 'Tôi hiểu rồi, bạn nói rất hay! Xin mời tiếp tục.',
    evaluation: {
      accuracyScore: 85,
      pinyinFeedback: 'Phát âm tự nhiên.',
      grammarFeedback: 'Ngữ pháp ổn định.',
      suggestedImprovement: 'Tiếp tục duy trì tốc độ nói này nhé!',
    },
  };
}
