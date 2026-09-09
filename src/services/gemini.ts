import type { CefrLevel } from '@/types/cefr';
import type {
  ConversationTurn,
  ExamSpeakingCategory,
  RoleplaySessionReport,
  RoleplayTurnEvaluation,
  SpeakingExamQuestion,
  SpeakingExamResult,
  SpeakingScenario,
  TurnFeedback,
} from '@/types/speaking';

const LOCAL_STORAGE_KEY = 'ep_gemini_api_key';
// Priority models for real-time natural dialogue (< 1s latency)
const FAST_ROLEPLAY_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
];

// Fallback models for heavy analytical tasks (session evaluation, exam grading)
const STANDARD_GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
];

export type GeminiVoiceName = 'Aoede' | 'Puck' | 'Fenrir' | 'Kore';

// In-memory cache for generated WAV Blob URLs
const speechAudioUrlCache = new Map<string, string>();

/**
 * Convert 16-bit PCM bytes (24000Hz mono) to a standard WAV Blob
 */
export function pcmToWavBlob(
  pcmBytes: Uint8Array,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Blob {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBytes.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  for (let i = 0; i < 4; i++) view.setUint8(i, 'RIFF'.charCodeAt(i));
  view.setUint32(4, 36 + dataSize, true);
  for (let i = 0; i < 4; i++) view.setUint8(8 + i, 'WAVE'.charCodeAt(i));

  // fmt sub-chunk
  for (let i = 0; i < 4; i++) view.setUint8(12 + i, 'fmt '.charCodeAt(i));
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  for (let i = 0; i < 4; i++) view.setUint8(36 + i, 'data'.charCodeAt(i));
  view.setUint32(40, dataSize, true);

  // Copy PCM audio payload
  new Uint8Array(buffer, 44).set(pcmBytes);

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Generate expressive AI voice audio using Gemini TTS (Aoede = Female, Puck = Male)
 * Returns a playable WAV Blob URL, or null if failed/offline.
 */
export async function generateGeminiSpeechAudio(
  text: string,
  voiceName: GeminiVoiceName = 'Aoede'
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const cacheKey = `${voiceName}:${trimmed}`;
  if (speechAudioUrlCache.has(cacheKey)) {
    return speechAudioUrlCache.get(cacheKey)!;
  }

  const ttsModels = [
    'gemini-3.1-flash-tts-preview',
    'gemini-2.5-flash-preview-tts',
  ];

  for (const model of ttsModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: trimmed }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName,
              },
            },
          },
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4500),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const base64Data = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Data) continue;

      // Decode base64 to binary
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const wavBlob = pcmToWavBlob(bytes, 24000, 1, 16);
      const audioUrl = URL.createObjectURL(wavBlob);
      speechAudioUrlCache.set(cacheKey, audioUrl);
      return audioUrl;
    } catch {
      continue;
    }
  }

  return null;
}

export function getGeminiApiKey(): string {
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();
  if (envKey) return envKey;
  return (localStorage.getItem(LOCAL_STORAGE_KEY) || '').trim();
}

export function setGeminiApiKey(key: string): void {
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem(LOCAL_STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

export function hasGeminiApiKey(): boolean {
  return Boolean(getGeminiApiKey());
}

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string; thought?: boolean }>;
    };
    finishReason?: string;
  }>;
  error?: {
    message?: string;
    code?: number;
    status?: string;
  };
}

interface GeminiCallOptions {
  models?: string[];
  maxOutputTokens?: number;
  timeoutMs?: number;
  temperature?: number;
}

async function callGeminiApi(
  systemPrompt: string,
  userPrompt: string,
  options?: GeminiCallOptions
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('MISSING_KEY: Gemini API Key is not set.');
  }

  const models = options?.models || STANDARD_GEMINI_MODELS;
  const timeoutMs = options?.timeoutMs || 8000;
  const maxOutputTokens = options?.maxOutputTokens || 2048;
  const temperature = options?.temperature ?? 0.7;

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nUser Request:\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature,
          topP: 0.95,
          maxOutputTokens,
          responseMimeType: 'application/json',
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = (errorData as GeminiApiResponse)?.error?.message || `HTTP ${res.status}`;
        throw new Error(message);
      }

      const data: GeminiApiResponse = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const textPart = parts.find((p: any) => p.text && !p.thought);
      const rawText = textPart?.text || parts[0]?.text;
      if (!rawText) {
        throw new Error('Gemini returned an empty response.');
      }

      return rawText;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API] ${model} failed (${err.name === 'TimeoutError' ? 'Timeout' : err.message}), switching...`);
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini.');
}

/**
 * Clean JSON output from LLM in case of Markdown code fences
 */
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  }
  return cleaned.trim();
}

/**
 * 1. Ultra-Fast Roleplay Turn (< 1s Latency)
 * Designed for real-time spoken dialogue. Employs flash-lite models, natural conversational prompt, and rapid fallback.
 */
export async function sendRoleplayMessage(
  scenario: SpeakingScenario,
  history: ConversationTurn[],
  userMessage: string
): Promise<{ aiReply: string; isFinished: boolean; feedback?: TurnFeedback }> {
  // If no API key configured, use intelligent mock response
  if (!hasGeminiApiKey()) {
    return generateMockFastRoleplayResponse(scenario, userMessage);
  }

  const systemPrompt = `You are an authentic, engaging English conversation partner roleplaying as: ${scenario.aiPersona}.
Scenario: "${scenario.title}" (${scenario.level} level).

=== CONVERSATIONAL RULES (CRITICAL) ===
1. Sound 100% human, lively, and warm. Use natural spoken expressions (e.g. "Sure thing!", "Sounds awesome!", "Oh, totally!", "No worries at all!").
2. React genuinely and specifically to what the learner said, acknowledging their point before moving forward.
3. Keep your turn to 1-3 natural spoken sentences (around 20-35 words). Avoid robotic, repetitive, or one-word replies.
4. Do NOT lecture, explain grammar, or break character during the dialogue.
5. If the learner indicates they want to stop or conclude (e.g. "stop here", "let's end here", "goodbye", "that's all for today"), give a warm farewell and set "isFinished": true. Otherwise set "isFinished": false.

Output strict JSON only: {"aiReply": "string", "isFinished": boolean}`;

  const conversationHistoryText = history
    .slice(-4)
    .map((turn) => `${turn.role === 'ai' ? 'Partner' : 'Learner'}: "${turn.text}"`)
    .join('\n');

  const userPrompt = `History:
${conversationHistoryText || '(Start of conversation)'}

Learner: "${userMessage}"

Respond in character in JSON:`;

  try {
    const raw = await callGeminiApi(systemPrompt, userPrompt, {
      models: FAST_ROLEPLAY_MODELS,
      timeoutMs: 3200, // 3.2s responsive timeout before model switch
      maxOutputTokens: 80, // Allow 1-3 natural sentences without truncation
      temperature: 0.75, // Natural conversational variety
    });
    const parsed = JSON.parse(cleanJsonOutput(raw));
    return {
      aiReply: parsed.aiReply || 'That sounds great! What else would you like to share?',
      isFinished: Boolean(parsed.isFinished),
    };
  } catch (error: any) {
    console.warn('[Gemini API Fast Fallback] Switching to instant persona reply:', error);
    return generateMockFastRoleplayResponse(scenario, userMessage);
  }
}

/**
 * 2. Comprehensive End-of-Session Speaking Evaluation
 * Evaluates the entire transcript at once, dissecting every turn in detail according to CEFR/IELTS standards.
 */
export async function evaluateRoleplaySession(
  scenario: SpeakingScenario,
  turns: ConversationTurn[],
  durationSeconds: number
): Promise<RoleplaySessionReport> {
  const userTurns = turns.filter((t) => t.role === 'user' && t.text.trim());

  if (!hasGeminiApiKey() || userTurns.length === 0) {
    return generateMockSessionReport(scenario, userTurns, durationSeconds);
  }

  const systemPrompt = `You are a certified senior IELTS & CEFR Speaking Examiner and language coach.
You are evaluating a completed English speaking practice session.
Scenario: "${scenario.title}" (Target CEFR: ${scenario.level}).
Candidate spoken duration: ${durationSeconds} seconds (${userTurns.length} spoken turns).

Evaluation Criteria (Standard 1-10 scale):
- grammar (1-10): Grammatical range & accuracy, verb tenses, clause structure, error frequency.
- vocabulary (1-10): Lexical precision, collocations, idiomatic phrasing.
- coherence (1-10): Communicative flow, relevance, and natural conversation.
- pronunciation (1-10): Estimated cadence, clarity, rhythm, and phonetics.

Tasks:
1. Score overall (1-10) and each of the 4 criteria.
2. Provide a constructive summary feedback in Vietnamese (3-4 sentences) highlighting overall strengths and key areas to improve.
3. For EVERY single user utterance in the session, dissect it:
   - "turn_index": index starting from 1
   - "user_said": exact text user said
   - "score": score for this turn (1-10)
   - "correction": corrected natural sentence
   - "explanation": concise explanation of errors or phrasing in Vietnamese
   - "better_alternative": high-scoring, natural native-speaker phrasing

Output MUST be strict JSON matching this schema:
{
  "overall_score": 7.0,
  "scores": {
    "grammar": 6.5,
    "vocabulary": 7.5,
    "coherence": 7.0,
    "pronunciation": 7.0
  },
  "summary_feedback": "3-4 câu nhận xét tổng thể bằng tiếng Việt...",
  "detailed_turns": [
    {
      "turn_index": 1,
      "user_said": "exact text",
      "score": 6.0,
      "correction": "câu sửa đúng",
      "explanation": "giải thích ngắn gọn lỗi bằng tiếng Việt",
      "better_alternative": "câu mẫu bản xứ tự nhiên hơn"
    }
  ]
}`;

  const turnsText = userTurns
    .map((t, idx) => `[Turn ${idx + 1}]: "${t.text}"`)
    .join('\n');

  const userPrompt = `Candidate's spoken turns in this session:
${turnsText}

Evaluate the entire session thoroughly. Output strict JSON only.`;

  try {
    const raw = await callGeminiApi(systemPrompt, userPrompt);
    const parsed = JSON.parse(cleanJsonOutput(raw));

    const overallScore = typeof parsed.overall_score === 'number'
      ? Math.min(10, Math.max(1, parsed.overall_score))
      : 7.0;

    const scores = {
      grammar: typeof parsed.scores?.grammar === 'number' ? parsed.scores.grammar : overallScore,
      vocabulary: typeof parsed.scores?.vocabulary === 'number' ? parsed.scores.vocabulary : overallScore,
      coherence: typeof parsed.scores?.coherence === 'number' ? parsed.scores.coherence : overallScore,
      pronunciation: typeof parsed.scores?.pronunciation === 'number' ? parsed.scores.pronunciation : overallScore,
    };

    const detailedTurns: RoleplayTurnEvaluation[] = Array.isArray(parsed.detailed_turns)
      ? parsed.detailed_turns.map((dt: any, idx: number) => ({
          turn_index: typeof dt.turn_index === 'number' ? dt.turn_index : idx + 1,
          user_said: dt.user_said || userTurns[idx]?.text || '',
          score: typeof dt.score === 'number' ? dt.score : overallScore,
          correction: dt.correction || userTurns[idx]?.text || '',
          explanation: dt.explanation || 'Cách diễn đạt tốt, cần chú ý tính tự nhiên trong câu.',
          better_alternative: dt.better_alternative || dt.correction || userTurns[idx]?.text || '',
        }))
      : userTurns.map((t, idx) => ({
          turn_index: idx + 1,
          user_said: t.text,
          score: overallScore,
          correction: t.text,
          explanation: 'Diễn đạt mạch lạc, phản xạ tự nhiên.',
          better_alternative: t.text,
        }));

    const xpEarned = Math.min(200, Math.max(30, Math.round(overallScore * 10 + userTurns.length * 6)));

    return {
      overall_score: overallScore,
      scores,
      summary_feedback: typeof parsed.summary_feedback === 'string'
        ? parsed.summary_feedback
        : 'Bạn đã hoàn thành buổi nói chuyện tốt! Duy trì phản xạ nói hàng ngày để tự tin hơn.',
      detailed_turns: detailedTurns,
      xpEarned,
      turnsCount: userTurns.length,
      durationSeconds,
    };
  } catch (err) {
    console.warn('[Session Evaluation Error] Falling back to mock session report:', err);
    return generateMockSessionReport(scenario, userTurns, durationSeconds);
  }
}

/**
 * 2. Evaluate Speaking Exam (CEFR / IELTS Rubric)
 */
export async function evaluateSpeakingExam(
  question: SpeakingExamQuestion,
  userTranscript: string,
  durationSeconds: number
): Promise<SpeakingExamResult> {
  const words = userTranscript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (!hasGeminiApiKey() || wordCount < 3) {
    return generateMockExamResult(question, userTranscript, durationSeconds);
  }

  const systemPrompt = `You are a certified senior IELTS & CEFR Speaking Examiner.
You are evaluating a candidate's recorded response.
Exam Task:
- Part: ${question.part}
- Topic: ${question.topic}
- Question: "${question.question}"
- Target CEFR Level: ${question.level}

Evaluation Criteria:
1. Fluency & Coherence (1-9): Flow, hesitation, self-correction, logical connectors.
2. Lexical Resource (1-9): Range of vocabulary, collocations, idiomatic language, precision.
3. Grammatical Range & Accuracy (1-9): Sentence variety (simple vs complex), tenses, error density.
4. Pronunciation & Intonation (1-9): Estimated from transcript cadence, phonetic word choice, contractions.

Candidate spoken duration: ${durationSeconds} seconds (${wordCount} words spoken).

You must return a strict JSON object with this format:
{
  "scores": {
    "fluency": 6.5,
    "lexical": 7.0,
    "grammar": 6.0,
    "pronunciation": 6.5,
    "overall": 6.5
  },
  "cefrEquivalent": "B2", // "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  "detailedFeedback": {
    "strengths": ["string in Vietnamese", "string in Vietnamese"],
    "improvements": ["string in Vietnamese", "string in Vietnamese"],
    "grammarCorrections": [
      {
        "original": "exact phrase from transcript with error",
        "corrected": "corrected phrase",
        "explanation": "concise explanation in Vietnamese"
      }
    ],
    "advancedVocabularySuggestions": ["word/idiom 1", "word/idiom 2"]
  },
  "sampleBand9Answer": "A full, fluent, Band 9 / C2 exemplary response to the question (around 100-150 words)."
}`;

  const userPrompt = `Candidate's Transcribed Speech:
"${userTranscript}"

Duration: ${durationSeconds}s. Word count: ${wordCount}.
Evaluate thoroughly. Output strict JSON only.`;

  try {
    const raw = await callGeminiApi(systemPrompt, userPrompt);
    const parsed = JSON.parse(cleanJsonOutput(raw));

    const overall = parsed.scores?.overall || 6.5;
    const xp = Math.min(150, Math.max(40, Math.round(overall * 15)));

    return {
      question,
      userTranscript,
      durationSeconds,
      scores: {
        fluency: parsed.scores?.fluency || 6.5,
        lexical: parsed.scores?.lexical || 6.5,
        grammar: parsed.scores?.grammar || 6.5,
        pronunciation: parsed.scores?.pronunciation || 6.5,
        overall,
      },
      cefrEquivalent: parsed.cefrEquivalent || question.level,
      detailedFeedback: {
        strengths: Array.isArray(parsed.detailedFeedback?.strengths) ? parsed.detailedFeedback.strengths : ['Phát âm rõ ràng, tự tin khi truyền đạt ý chính.'],
        improvements: Array.isArray(parsed.detailedFeedback?.improvements) ? parsed.detailedFeedback.improvements : ['Cần sử dụng thêm các từ nối tự nhiên hơn như "Furthermore", "In addition".'],
        grammarCorrections: Array.isArray(parsed.detailedFeedback?.grammarCorrections) ? parsed.detailedFeedback.grammarCorrections : [],
        advancedVocabularySuggestions: Array.isArray(parsed.detailedFeedback?.advancedVocabularySuggestions) ? parsed.detailedFeedback.advancedVocabularySuggestions : ['broaden one\'s horizon', 'invaluable experience'],
      },
      sampleBand9Answer: parsed.sampleBand9Answer || 'Speaking from personal experience, I have always believed that continuous learning is paramount...',
      xpEarned: xp,
    };
  } catch (error) {
    console.warn('[Gemini Exam Eval Error] Falling back to smart mock result:', error);
    return generateMockExamResult(question, userTranscript, durationSeconds);
  }
}

/**
 * Intelligent Mock Fallbacks for testing without API Key or offline
 */
function generateMockFastRoleplayResponse(
  scenario: SpeakingScenario,
  userMessage: string
): { aiReply: string; isFinished: boolean } {
  const lower = userMessage.toLowerCase();

  // Check ending intent
  const endKeywords = ['end here', 'stop here', 'enough', 'goodbye', 'bye', 'that\'s all', 'thank you. let let', 'wrap up', 'see you'];
  if (endKeywords.some((kw) => lower.includes(kw))) {
    return {
      aiReply: "Thank you so much! It was truly a pleasure conversing with you today. Have a wonderful day ahead!",
      isFinished: true,
    };
  }

  // Cafe & Food scenarios
  if (scenario.id === 'cafe-order' || scenario.id === 'fast-food-order' || scenario.category === 'daily') {
    if (lower.includes('coffee') || lower.includes('latte') || lower.includes('cappuccino') || lower.includes('burger') || lower.includes('drink')) {
      return {
        aiReply: "That sounds delicious! Would you like a regular or large size for that, and do you have any preference on milk or sauces?",
        isFinished: false,
      };
    }
    if (lower.includes('oat') || lower.includes('milk') || lower.includes('size') || lower.includes('medium') || lower.includes('large') || lower.includes('combo')) {
      return {
        aiReply: "Got it! And would you like anything to go along with that, perhaps a warm pastry or a side of crispy fries?",
        isFinished: false,
      };
    }
    if (lower.includes('no') || lower.includes('that\'s all') || lower.includes('how much') || lower.includes('pay') || lower.includes('bill')) {
      return {
        aiReply: "Awesome, that brings your total to $5.20! Will you be paying with card or mobile payment today?",
        isFinished: false,
      };
    }
  }

  // Job Interview / Business
  if (scenario.id === 'job-interview' || scenario.category === 'business') {
    if (lower.includes('experience') || lower.includes('year') || lower.includes('developer') || lower.includes('work') || lower.includes('project')) {
      return {
        aiReply: "That's very impressive background! Could you walk me through a specific challenging problem you encountered and how your team resolved it?",
        isFinished: false,
      };
    }
    if (lower.includes('team') || lower.includes('solve') || lower.includes('lead') || lower.includes('bug') || lower.includes('build')) {
      return {
        aiReply: "That demonstrates great initiative. In this position, collaboration is essential—how do you usually handle differing technical opinions with your peers?",
        isFinished: false,
      };
    }
    if (lower.includes('salary') || lower.includes('budget') || lower.includes('cost') || lower.includes('price')) {
      return {
        aiReply: "We appreciate your transparency. We certainly want to find a mutually rewarding arrangement—what timeline or milestone structure do you envision?",
        isFinished: false,
      };
    }
  }

  // Travel / Hotel / Airport
  if (scenario.category === 'travel' || scenario.id.includes('hotel') || scenario.id.includes('airport')) {
    if (lower.includes('reservation') || lower.includes('check in') || lower.includes('book') || lower.includes('name')) {
      return {
        aiReply: "Welcome! I see your booking right here on our system. Let me prepare your room key—would you prefer a high floor with city views?",
        isFinished: false,
      };
    }
    if (lower.includes('luggage') || lower.includes('bag') || lower.includes('flight') || lower.includes('carousel')) {
      return {
        aiReply: "I completely understand how stressful that is. Let me record your claim tag number and file an immediate priority tracer for your luggage.",
        isFinished: false,
      };
    }
  }

  // Natural contextual fallback replies (rotating variations)
  const naturalVariations = [
    "That makes total sense! Could you share a bit more about your perspective on that?",
    "I appreciate you explaining that! How do you usually approach that in your daily routine?",
    "That sounds really fascinating! What made you decide on that particular approach?",
    "I hear you! If you had to choose an alternative, what direction would you take?",
  ];
  const picked = naturalVariations[Math.floor(Math.random() * naturalVariations.length)];

  return {
    aiReply: picked,
    isFinished: false,
  };
}

function generateMockSessionReport(
  scenario: SpeakingScenario,
  userTurns: ConversationTurn[],
  durationSeconds: number
): RoleplaySessionReport {
  const detailedTurns: RoleplayTurnEvaluation[] = userTurns.map((turn, idx) => {
    const text = turn.text;
    const lower = text.toLowerCase();
    let score = 7.0;
    let correction = text;
    let explanation = 'Câu diễn đạt tự nhiên và bám sát ngữ cảnh cuộc trò chuyện.';
    let betterAlternative = text;

    if (lower.includes('i am agree')) {
      score = 5.0;
      correction = text.replace(/i am agree/gi, 'I agree');
      explanation = 'Trong tiếng Anh "agree" là động từ, không dùng với to be "am".';
      betterAlternative = 'I completely agree with you on that.';
    } else if (text.trim().split(/\s+/).length <= 2) {
      score = 5.5;
      correction = `Could I please have ${text.toLowerCase().replace(/[.]+$/, '')}?`;
      explanation = 'Câu quá ngắn hoặc cộc lốc, nên dùng cấu trúc câu đề nghị lịch sự.';
      betterAlternative = `I would like to order ${text.toLowerCase().replace(/[.]+$/, '')}, please.`;
    } else if (lower.includes('let let') || lower.includes('and the conversation')) {
      score = 5.0;
      correction = "OK, thank you. Let's end the conversation here.";
      explanation = 'Lỗi lặp từ và cấu trúc kết thúc hội thoại chưa chuẩn xác.';
      betterAlternative = "Great, thank you! Let's wrap things up here.";
    }

    return {
      turn_index: idx + 1,
      user_said: text,
      score,
      correction,
      explanation,
      better_alternative: betterAlternative,
    };
  });

  const avgScore = detailedTurns.length
    ? detailedTurns.reduce((acc, t) => acc + t.score, 0) / detailedTurns.length
    : 7.0;
  const overall_score = Number(avgScore.toFixed(1));

  return {
    overall_score,
    scores: {
      grammar: overall_score,
      vocabulary: Math.min(10, overall_score + 0.5),
      coherence: overall_score,
      pronunciation: 7.5,
    },
    summary_feedback: 'Bạn đã hoàn thành tốt buổi thực hành giao tiếp. Phản xạ hội thoại nhanh và tự tin. Hãy chú ý cấu trúc câu hoàn chỉnh và dùng các câu đề nghị lịch sự để nâng cao band điểm!',
    detailed_turns: detailedTurns,
    xpEarned: Math.round(overall_score * 10 + userTurns.length * 5),
    turnsCount: userTurns.length,
    durationSeconds,
  };
}

function generateMockExamResult(
  question: SpeakingExamQuestion,
  userTranscript: string,
  durationSeconds: number
): SpeakingExamResult {
  const wordCount = userTranscript.trim().split(/\s+/).filter(Boolean).length;
  const calculatedScore = wordCount > 40 ? 7.0 : wordCount > 20 ? 6.0 : 5.5;

  return {
    question,
    userTranscript: userTranscript || '(Không thu âm được câu trả lời đầy đủ)',
    durationSeconds,
    scores: {
      fluency: calculatedScore,
      lexical: calculatedScore,
      grammar: calculatedScore,
      pronunciation: calculatedScore,
      overall: calculatedScore,
    },
    cefrEquivalent: calculatedScore >= 7.0 ? 'C1' : calculatedScore >= 6.0 ? 'B2' : 'B1',
    detailedFeedback: {
      strengths: [
        'Nội dung bám sát yêu cầu câu hỏi.',
        'Sử dụng các cấu trúc câu giao tiếp quen thuộc một cách trôi chảy.',
      ],
      improvements: [
        'Cần kéo dài câu trả lời bằng cách đưa thêm ví dụ cá nhân hoặc lý do cụ thể.',
        'Bổ sung các từ vựng học thuật B2-C1 để nâng cao band điểm từ vựng.',
      ],
      grammarCorrections: [
        {
          original: 'I very like',
          corrected: 'I really like / I am particularly fond of',
          explanation: 'Không dùng "very" trước động từ thường.',
        },
      ],
      advancedVocabularySuggestions: [
        'indispensable (không thể thiếu)',
        'broaden one\'s horizon (mở rộng tầm nhìn)',
        'play a crucial role in (đóng vai trò quan trọng)',
      ],
    },
    sampleBand9Answer:
      'Without a shadow of a doubt, this topic has consistently piqued my interest. In today\'s interconnected society, being able to articulate one\'s thoughts effectively is paramount. Reflecting upon my own experience, engaging in frequent spoken interaction has proven to be an indispensable asset.',
    xpEarned: Math.round(calculatedScore * 12),
  };
}

// ============================================
// 4. AI Random Topic Generator (IELTS / VSTEP / TOEIC)
// ============================================

export const FALLBACK_RANDOM_TOPICS: Record<'IELTS' | 'VSTEP' | 'TOEIC', SpeakingScenario[]> = {
  IELTS: [
    {
      id: 'fb-ielts-ai-future',
      title: 'IELTS Speaking Part 3: AI & the Future of Work',
      viTitle: 'IELTS Part 3: Trí tuệ nhân tạo & Tương lai việc làm',
      description: 'Discuss the profound impact of artificial intelligence and automation on employment, ethics, and career adaptability.',
      icon: '🤖',
      level: 'B2',
      category: 'academic',
      starterPrompt: "Good afternoon. Today in Part 3, let's discuss automation. Some people argue that artificial intelligence will render many traditional jobs obsolete, while others believe it will create brand-new industries. What is your perspective on this?",
      aiPersona: 'Inquisitive IELTS Examiner. You evaluate fluency and lexical resource, challenging arguments with probing "Why" and "How" follow-up questions.',
      suggestedPhrases: [
        'From my perspective, it is a double-edged sword...',
        'It is widely anticipated that automation will...',
        'Rather than replacing humans entirely, it will augment...',
        'There is no denying that adaptability is vital...',
      ],
    },
    {
      id: 'fb-ielts-environment',
      title: 'IELTS Speaking Part 3: Renewable Energy & Climate Action',
      viTitle: 'IELTS Part 3: Năng lượng tái tạo & Biến đổi khí hậu',
      description: 'Debate individual responsibility versus government intervention in combating global environmental crises.',
      icon: '🌱',
      level: 'B2',
      category: 'academic',
      starterPrompt: "Welcome to Part 3. Let's delve into environmental preservation. Do you believe individual lifestyle changes are sufficient to tackle climate change, or must the burden fall strictly upon governments and large corporations?",
      aiPersona: 'Formal and thought-provoking IELTS Examiner who encourages well-reasoned viewpoints and examples.',
      suggestedPhrases: [
        'While individual efforts certainly raise awareness...',
        'Top-down legislation plays an indispensable role...',
        'Holding multinational corporations accountable...',
        'A multi-faceted approach is urgently required...',
      ],
    },
    {
      id: 'fb-ielts-childhood',
      title: 'IELTS Speaking Part 1 & 2: Childhood Hobbies & Personal Growth',
      viTitle: 'IELTS Part 1 & 2: Sở thích tuổi thơ & Quá trình trưởng thành',
      description: 'Reflect on leisure activities from your upbringing and how they shaped your current skills and personality.',
      icon: '🎨',
      level: 'B1',
      category: 'daily',
      starterPrompt: "Hello! Let's talk about leisure and pastimes. When you were younger, what was your absolute favorite activity after school, and do you still find time for it nowadays?",
      aiPersona: 'Engaging and friendly IELTS Examiner setting a warm tone for Part 1/2 dialogue.',
      suggestedPhrases: [
        'Looking back on my formative years...',
        'I used to be thoroughly fascinated by...',
        'It offered a wonderful outlet to decompress...',
        'Even to this day, it holds a special place in my heart...',
      ],
    },
    {
      id: 'fb-ielts-culture-tourism',
      title: 'IELTS Speaking Part 3: Mass Tourism vs Cultural Heritage',
      viTitle: 'IELTS Part 3: Du lịch đại chúng & Di sản văn hóa',
      description: 'Analyze whether booming international tourism preserves local heritage or dilutes authentic traditions.',
      icon: '🏛️',
      level: 'C1',
      category: 'academic',
      starterPrompt: "Let us consider global travel. While tourism generates vital revenue for developing regions, critics point out it often causes cultural commodification and environmental wear. How should nations strike a sustainable balance?",
      aiPersona: 'Analytical IELTS examiner demanding nuanced synthesis and high-level vocabulary.',
      suggestedPhrases: [
        'It is undeniable that revenue from tourism revitalizes...',
        'However, uncontrolled commercialization poses an existential threat...',
        'Stricter visitor quotas and eco-tourism frameworks are pivotal...',
        'Preserving intangible cultural heritage should take precedence...',
      ],
    },
  ],
  VSTEP: [
    {
      id: 'fb-vstep-public-transport',
      title: 'VSTEP Speaking B2: Urban Public Transportation Solutions',
      viTitle: 'VSTEP B2: Giải pháp phát triển giao thông công cộng đô thị',
      description: 'Discuss causes of traffic congestion in metropolitan centers and evaluate viable public transit solutions.',
      icon: '🚆',
      level: 'B2',
      category: 'daily',
      starterPrompt: "Good day! In our speaking session today, we're focusing on urban lifestyle. Traffic jams are becoming increasingly severe in major cities. In your opinion, what is the most effective measure to encourage residents to switch to public transit?",
      aiPersona: 'Supportive VSTEP Examiner asking structured questions to assess communicative effectiveness and coherence.',
      suggestedPhrases: [
        'In my view, upgrading infrastructure should be top priority...',
        'Subsidizing commuter ticket fares would significantly attract...',
        'Unless public transit offers punctual and reliable routes...',
        'Raising public awareness plays an equally important role...',
      ],
    },
    {
      id: 'fb-vstep-social-media',
      title: 'VSTEP Speaking B2: Impact of Social Media on Teenagers',
      viTitle: 'VSTEP B2: Tác động của mạng xã hội lên giới trẻ',
      description: 'Analyze the psychological advantages and pitfalls of excessive social networking usage among high school students.',
      icon: '📱',
      level: 'B2',
      category: 'daily',
      starterPrompt: "Hello! Today we discuss technology and well-being. Many educators are concerned about teenagers spending hours on TikTok and Instagram. Do you think social media brings more merits or demerits to youngsters?",
      aiPersona: 'Attentive VSTEP Examiner who guides the discussion with balanced follow-up inquiries.',
      suggestedPhrases: [
        'It opens up unprecedented opportunities for global learning...',
        'On the flip side, cyberbullying and FOMO are severe risks...',
        'Parents and schools must collaborate to guide healthy digital habits...',
        'Striking a healthy digital balance is essential for their mental well-being...',
      ],
    },
    {
      id: 'fb-vstep-study-abroad',
      title: 'VSTEP Speaking B1-B2: Studying Abroad vs Domestic Education',
      viTitle: 'VSTEP B1-B2: Du học nước ngoài hay Học đại học trong nước',
      description: 'Compare financial investments, cultural exposure, and long-term career prospects of domestic vs overseas study.',
      icon: '🎓',
      level: 'B1',
      category: 'academic',
      starterPrompt: "Hi there! Let's talk about higher education choices. When graduating high school, many students face the dilemma of studying abroad versus staying at a local university. What factors do you consider most crucial?",
      aiPersona: 'Friendly university academic advisor roleplaying a VSTEP speaking test situation.',
      suggestedPhrases: [
        'Financially speaking, studying abroad entails a hefty investment...',
        'On the other hand, cultural immersion fosters independent maturity...',
        'High-quality domestic universities are closing the educational gap...',
        'Ultimately, it depends on individual career aspirations...',
      ],
    },
    {
      id: 'fb-vstep-healthy-lifestyle',
      title: 'VSTEP Speaking B1: Maintaining Work-Life Health in Modern Life',
      viTitle: 'VSTEP B1: Duy trì sức khỏe và cân bằng công việc hiện đại',
      description: 'Discuss how young professionals can combat sedentary habits and prioritize mental and physical wellness.',
      icon: '🥗',
      level: 'B1',
      category: 'daily',
      starterPrompt: "Welcome! Fast-paced modern routines often leave young adults with poor nutrition and lack of exercise. What simple daily routines would you recommend for someone looking to build a healthier lifestyle?",
      aiPersona: 'Encouraging health and lifestyle counselor in a VSTEP interview.',
      suggestedPhrases: [
        'First and foremost, incorporating thirty minutes of brisk walking...',
        'Meal prepping on weekends prevents reliance on greasy fast food...',
        'Getting adequate sleep is the cornerstone of physical vitality...',
        'Small consistent habits yield enormous long-term benefits...',
      ],
    },
  ],
  TOEIC: [
    {
      id: 'fb-toeic-client-delay',
      title: 'TOEIC Speaking: Addressing a Critical Shipment Delay',
      viTitle: 'TOEIC Speaking: Xử lý sự cố chậm trễ giao hàng cho khách',
      description: 'Apologize to an upset client, explain the supply chain bottleneck clearly, and propose an expedited solution.',
      icon: '📦',
      level: 'B1',
      category: 'business',
      starterPrompt: "Hello, this is Mr. Henderson from Zenith Corp. We were promised our component shipment by 9 AM today for our manufacturing line, but nothing has arrived yet. This delay is costing us thousands every hour! What happened and what is your plan to resolve this immediately?",
      aiPersona: 'Frustrated but professional key corporate client demanding concrete solutions and clear timelines.',
      suggestedPhrases: [
        'I sincerely apologize for the inconvenience this delay has caused...',
        'I have already contacted our logistics dispatcher to trace the cargo...',
        'We will expedite a replacement batch via emergency courier at zero extra charge...',
        'I will personally monitor the transit and update you within thirty minutes...',
      ],
    },
    {
      id: 'fb-toeic-conference-planning',
      title: 'TOEIC Speaking: Coordinating Corporate Conference Logistics',
      viTitle: 'TOEIC Speaking: Phối hợp chuẩn bị hội nghị đối tác công ty',
      description: 'Coordinate venue selection, audio-visual equipment, and catering adjustments for a major annual seminar.',
      icon: '📊',
      level: 'B2',
      category: 'business',
      starterPrompt: "Good morning! As you know, the regional quarterly partners summit is next Friday. We've just learned the keynote speaker needs specialized AV equipment and the guest count increased by 25 attendees. How should we adjust our arrangements?",
      aiPersona: 'Senior Operations Director collaborating on business event execution and contingencies.',
      suggestedPhrases: [
        'We should immediately contact the venue coordinator to expand the hall layout...',
        'I will liaise with the AV technician to ensure compatibility...',
        'Regarding catering, we can request an updated headcount quota...',
        'Let us establish a backup timetable to prevent any technical hiccups...',
      ],
    },
    {
      id: 'fb-toeic-customer-complaint',
      title: 'TOEIC Speaking: Retail Store Service Recovery',
      viTitle: 'TOEIC Speaking: Giải quyết khiếu nại khách hàng tại cửa hàng',
      description: 'Listen to a dissatisfied customer regarding an overcharge error and provide a courteous refund and discount voucher.',
      icon: '🛒',
      level: 'A2',
      category: 'daily',
      starterPrompt: "Excuse me! I just checked my receipt and realized your cashier charged me twice for the wireless headphones, and the promotional discount was not applied. I need this corrected right now!",
      aiPersona: 'Firm shopper seeking prompt financial correction and polite customer service.',
      suggestedPhrases: [
        'I am truly sorry for the billing discrepancy. Let me review your receipt...',
        'I will process an immediate full refund for the duplicate charge...',
        'As a token of our goodwill, please accept this 15% discount voucher...',
        'Thank you so much for your patience while we rectify this mistake...',
      ],
    },
    {
      id: 'fb-toeic-project-timeline',
      title: 'TOEIC Speaking: Negotiating Software Milestone Deadline',
      viTitle: 'TOEIC Speaking: Đàm phán lùi hạn chót tiến độ dự án',
      description: 'Explain unexpected technical hurdles to a stakeholder and propose a revised phase-by-phase delivery schedule.',
      icon: '💻',
      level: 'B2',
      category: 'business',
      starterPrompt: "Hi, thanks for hopping on this call. Our marketing campaign is scheduled to launch next Monday, but your latest status report mentions the mobile app beta might be delayed. What is the bottleneck, and how do we keep the launch on track?",
      aiPersona: 'Client Product Owner requiring transparent status reporting and practical compromise.',
      suggestedPhrases: [
        'We encountered unexpected API integration bugs during final QA testing...',
        'To protect system security, we propose delivering Phase 1 core features on Monday...',
        'The secondary module will roll out seamlessly by Thursday afternoon...',
        'This phased deployment guarantees stability without compromising your marketing launch...',
      ],
    },
  ],
};

function getRandomFallbackScenario(examType: ExamSpeakingCategory = 'all'): SpeakingScenario {
  let pool: SpeakingScenario[] = [];
  if (examType === 'IELTS') {
    pool = FALLBACK_RANDOM_TOPICS.IELTS;
  } else if (examType === 'VSTEP') {
    pool = FALLBACK_RANDOM_TOPICS.VSTEP;
  } else if (examType === 'TOEIC') {
    pool = FALLBACK_RANDOM_TOPICS.TOEIC;
  } else {
    pool = [
      ...FALLBACK_RANDOM_TOPICS.IELTS,
      ...FALLBACK_RANDOM_TOPICS.VSTEP,
      ...FALLBACK_RANDOM_TOPICS.TOEIC,
    ];
  }
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return {
    ...picked,
    id: `random_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  };
}

export async function generateRandomSpeakingTopic(
  examType: ExamSpeakingCategory = 'all'
): Promise<SpeakingScenario> {
  if (!hasGeminiApiKey()) {
    return getRandomFallbackScenario(examType);
  }

  const examLabel = examType === 'all' ? 'IELTS, VSTEP, or TOEIC Speaking' : `${examType} Speaking`;
  const systemPrompt = `You are a premier Cambridge IELTS, VSTEP (Vietnam Standardized Test of English Proficiency), and TOEIC Speaking exam test-maker.
Generate a creative, authentic, and engaging English speaking roleplay scenario specifically aligned with ${examLabel}.

Requirements:
- Target format: ${examLabel} (e.g., IELTS Part 3 in-depth discussion, VSTEP B1-B2-C1 social situational debate, or TOEIC Workplace/Business challenge).
- Provide a clear, natural English title and Vietnamese title.
- Provide a 1-2 sentence description in English describing the context and what the candidate needs to express.
- icon: 1 relevant emoji (e.g. 🤖, 🌍, ✈️, 🏢, 🏥, 📚, 🤝).
- level: One of 'A2', 'B1', 'B2', 'C1'.
- category: One of 'academic', 'business', 'daily', 'travel'.
- starterPrompt: An engaging, authentic 1-2 sentence opening question or prompt from the AI examiner or partner in English.
- aiPersona: Instructions for how the AI acts (e.g. "Supportive IELTS Examiner asking probing follow-up questions", "Corporate client requiring an explanation").
- suggestedPhrases: 3 to 4 high-scoring, natural English phrases or sentence starters for the candidate.

Output MUST be strict JSON only matching:
{
  "title": "Scenario Title in English",
  "viTitle": "Tiêu đề tiếng Việt ngắn gọn",
  "description": "Short description of context and objective in English",
  "icon": "🎓",
  "level": "B2",
  "category": "academic",
  "starterPrompt": "Opening line from AI in English...",
  "aiPersona": "Persona description...",
  "suggestedPhrases": [
    "phrase 1",
    "phrase 2",
    "phrase 3"
  ]
}`;

  const userPrompt = `Create 1 unique, fresh, high-quality speaking topic for ${examLabel}. Output strict JSON only.`;

  try {
    const raw = await callGeminiApi(systemPrompt, userPrompt);
    const parsed = JSON.parse(cleanJsonOutput(raw));

    const validLevels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const level: CefrLevel = validLevels.includes(parsed.level) ? parsed.level : 'B2';

    const validCategories = ['academic', 'business', 'daily', 'travel'] as const;
    const category = validCategories.includes(parsed.category) ? parsed.category : 'academic';

    return {
      id: `ai_random_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: parsed.title || 'AI Speaking Challenge',
      viTitle: parsed.viTitle || 'Chủ đề luyện nói AI ngẫu nhiên',
      description: parsed.description || 'Thực hành phản xạ tiếng Anh với chủ đề ngẫu nhiên từ AI.',
      icon: parsed.icon || '🎲',
      level,
      category,
      starterPrompt: parsed.starterPrompt || "Hello! Let's start our conversation today. What are your thoughts on this topic?",
      aiPersona: parsed.aiPersona || 'Engaging English conversation partner and examiner.',
      suggestedPhrases: Array.isArray(parsed.suggestedPhrases) && parsed.suggestedPhrases.length > 0
        ? parsed.suggestedPhrases
        : ['In my point of view...', 'On the other hand...', 'To illustrate this...'],
    };
  } catch (err) {
    console.warn('[generateRandomSpeakingTopic] AI generation failed, falling back to curated pool:', err);
    return getRandomFallbackScenario(examType);
  }
}
