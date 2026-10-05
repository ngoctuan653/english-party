/**
 * Speech utility for Chinese (Mandarin zh-CN) learning.
 * Supports Web Speech API (zh-CN) and fallback mechanisms.
 */

export interface SpeakChineseOptions {
  rate?: number; // 0.7 for pinyin training, 0.95 for normal speech
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

let activeChineseAudio: HTMLAudioElement | null = null;
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

export function getChineseVoice(): SpeechSynthesisVoice | null {
  const allVoices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  // Prioritize mainland standard Mandarin (zh-CN)
  const zhCnVoices = allVoices.filter(
    (v) => v.lang && (v.lang.toLowerCase() === 'zh-cn' || v.lang.toLowerCase() === 'cmn-cn')
  );
  if (zhCnVoices.length > 0) {
    const naturalVoice = zhCnVoices.find(
      (v) =>
        v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('google') ||
        v.name.toLowerCase().includes('xiaoxiao') ||
        v.name.toLowerCase().includes('huihui')
    );
    return naturalVoice || zhCnVoices[0];
  }

  // Any Chinese voice
  const anyZhVoices = allVoices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('zh'));
  return anyZhVoices[0] || null;
}

export function speakChineseText(text: string, options: SpeakChineseOptions = {}): void {
  stopChineseSpeech();

  const textToSpeak = text.trim();
  if (!textToSpeak) {
    options.onEnd?.();
    return;
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const voice = getChineseVoice();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = voice?.lang || 'zh-CN';
    utterance.rate = options.rate ?? 0.85; // slightly slower for optimal clarity
    utterance.pitch = options.pitch ?? 1.0;

    if (voice) {
      utterance.voice = voice;
    }

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Chinese speech error:', err);
    options.onError?.(err);
  }
}

export function stopChineseSpeech(): void {
  if (activeChineseAudio) {
    try {
      activeChineseAudio.pause();
      activeChineseAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeChineseAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
