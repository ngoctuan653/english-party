/**
 * Text-to-Speech helper for Speaking Studio & Listening
 * Supports Gemini Expressive AI Voices (Aoede / Puck) & Browser Natural Voices
 */

import { generateGeminiSpeechAudio, hasGeminiApiKey, type GeminiVoiceName } from '@/services/gemini';

export type VoiceEngine = 'gemini' | 'browser';
export type VoiceGender = 'random' | 'male' | 'female';

export interface SpeakEnglishOptions {
  engine?: VoiceEngine;
  gender?: VoiceGender;
  geminiVoice?: GeminiVoiceName;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

// Global reference to currently playing Audio element
let activeAudio: HTMLAudioElement | null = null;

// Well-known Male Voice Keywords across OS & Browsers
const MALE_VOICE_KEYWORDS = [
  'male',
  'david',
  'guy',
  'ryan',
  'george',
  'mark',
  'daniel',
  'alex',
  'fred',
  'tom',
  'oliver',
  'aaron',
  'arthur',
  'james',
  'john',
  'brian',
  'christopher',
  'eric',
  'paul',
  'richard',
  'steffan',
];

// Well-known Female Voice Keywords across OS & Browsers
const FEMALE_VOICE_KEYWORDS = [
  'female',
  'samantha',
  'zira',
  'jenny',
  'aria',
  'hazel',
  'susan',
  'victoria',
  'karen',
  'moira',
  'tessa',
  'fiona',
  'ava',
  'emma',
  'sonia',
  'neerja',
  'catherine',
  'linda',
  'sarah',
  'stephanie',
  'allison',
];

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

function classifyVoiceGender(voice: SpeechSynthesisVoice): 'male' | 'female' | 'unknown' {
  const name = voice.name.toLowerCase();
  if (MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw))) {
    return 'male';
  }
  if (FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw))) {
    return 'female';
  }
  return 'unknown';
}

export function pickVoiceForGender(targetGender: 'male' | 'female'): {
  voice: SpeechSynthesisVoice | null;
  defaultPitch: number;
  defaultRate: number;
} {
  const allVoices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  const englishVoices = allVoices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));

  if (targetGender === 'male') {
    const maleVoices = englishVoices.filter((v) => classifyVoiceGender(v) === 'male');
    const preferred = maleVoices.filter((v) => v.name.includes('Natural') || v.lang === 'en-US' || v.lang === 'en-GB');
    const pool = preferred.length > 0 ? preferred : maleVoices;
    const selectedVoice = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;

    return {
      voice: selectedVoice || englishVoices.find((v) => v.lang === 'en-US') || englishVoices[0] || null,
      defaultPitch: selectedVoice ? 0.92 : 0.84,
      defaultRate: 0.96,
    };
  } else {
    const femaleVoices = englishVoices.filter((v) => classifyVoiceGender(v) === 'female');
    const preferred = femaleVoices.filter((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.lang === 'en-US');
    const pool = preferred.length > 0 ? preferred : femaleVoices;
    const selectedVoice = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;

    return {
      voice: selectedVoice || englishVoices.find((v) => v.lang === 'en-US') || englishVoices[0] || null,
      defaultPitch: selectedVoice ? 1.06 : 1.15,
      defaultRate: 0.98,
    };
  }
}

/**
 * Fallback SpeechSynthesis player
 */
function speakWithBrowser(
  text: string,
  targetGender: 'male' | 'female',
  options: SpeakEnglishOptions
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const { voice, defaultPitch, defaultRate } = pickVoiceForGender(targetGender);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice?.lang || 'en-US';
  utterance.rate = options.rate ?? defaultRate;
  utterance.pitch = options.pitch ?? defaultPitch;

  if (voice) {
    utterance.voice = voice;
  }

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
}

/**
 * Main speech synthesis dispatcher.
 * Prioritizes Gemini Expressive AI Voices (Aoede / Puck) with seamless browser fallback.
 */
export async function speakEnglishText(
  text: string,
  options: SpeakEnglishOptions = {}
): Promise<void> {
  stopSpeaking();

  const textToSpeak = text.trim();
  if (!textToSpeak) {
    options.onEnd?.();
    return;
  }

  // Resolve target gender
  const targetGender: 'male' | 'female' =
    options.gender === 'male'
      ? 'male'
      : options.gender === 'female'
      ? 'female'
      : Math.random() < 0.5
      ? 'male'
      : 'female';

  const engine = options.engine ?? (hasGeminiApiKey() ? 'gemini' : 'browser');

  if (engine === 'gemini' && hasGeminiApiKey()) {
    const voiceName: GeminiVoiceName =
      options.geminiVoice || (targetGender === 'male' ? 'Puck' : 'Aoede');

    try {
      const audioUrl = await generateGeminiSpeechAudio(textToSpeak, voiceName);

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        activeAudio = audio;

        audio.onplay = () => {
          options.onStart?.();
        };

        audio.onended = () => {
          if (activeAudio === audio) activeAudio = null;
          options.onEnd?.();
        };

        audio.onerror = (e) => {
          if (activeAudio === audio) activeAudio = null;
          // Fallback to browser TTS if audio playback errors
          speakWithBrowser(textToSpeak, targetGender, options);
        };

        await audio.play();
        return;
      }
    } catch {
      // Fall through to browser speech synthesis
    }
  }

  // Browser speech synthesis fallback
  speakWithBrowser(textToSpeak, targetGender, options);
}

export function stopSpeaking(): void {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
