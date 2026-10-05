import { create } from 'zustand';
import type { HSKLevel, ToneNumber } from '@/types/chinese';

interface ChineseStudyState {
  currentLevel: HSKLevel;
  pinyinActiveTab: 'chart' | 'tones' | 'rules' | 'quiz';
  masteredInitials: string[];
  masteredFinals: string[];
  masteredTones: ToneNumber[];
  showPinyinAnnotation: boolean;
  speechRate: number;
  quizScore: { correct: number; total: number };

  setCurrentLevel: (level: HSKLevel) => void;
  setPinyinActiveTab: (tab: 'chart' | 'tones' | 'rules' | 'quiz') => void;
  toggleInitialMastered: (symbol: string) => void;
  toggleFinalMastered: (symbol: string) => void;
  toggleToneMastered: (tone: ToneNumber) => void;
  setShowPinyinAnnotation: (show: boolean) => void;
  setSpeechRate: (rate: number) => void;
  recordQuizResult: (isCorrect: boolean) => void;
  resetQuizScore: () => void;
}

const STORAGE_KEY = 'ep_chinese_study_progress';

function loadStoredProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return {
    masteredInitials: ['b', 'p', 'm', 'f'],
    masteredFinals: ['a', 'o', 'e'],
    masteredTones: [1],
  };
}

function saveProgress(data: { masteredInitials: string[]; masteredFinals: string[]; masteredTones: ToneNumber[] }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

const initialData = typeof window !== 'undefined' ? loadStoredProgress() : {
  masteredInitials: ['b', 'p', 'm', 'f'],
  masteredFinals: ['a', 'o', 'e'],
  masteredTones: [1],
};

export const useChineseStudyStore = create<ChineseStudyState>((set, get) => ({
  currentLevel: 'hsk0',
  pinyinActiveTab: 'chart',
  masteredInitials: initialData.masteredInitials,
  masteredFinals: initialData.masteredFinals,
  masteredTones: initialData.masteredTones,
  showPinyinAnnotation: true,
  speechRate: 0.85,
  quizScore: { correct: 0, total: 0 },

  setCurrentLevel: (level) => set({ currentLevel: level }),
  setPinyinActiveTab: (tab) => set({ pinyinActiveTab: tab }),

  toggleInitialMastered: (symbol) => {
    const { masteredInitials, masteredFinals, masteredTones } = get();
    const next = masteredInitials.includes(symbol)
      ? masteredInitials.filter((s) => s !== symbol)
      : [...masteredInitials, symbol];
    set({ masteredInitials: next });
    saveProgress({ masteredInitials: next, masteredFinals, masteredTones });
  },

  toggleFinalMastered: (symbol) => {
    const { masteredInitials, masteredFinals, masteredTones } = get();
    const next = masteredFinals.includes(symbol)
      ? masteredFinals.filter((s) => s !== symbol)
      : [...masteredFinals, symbol];
    set({ masteredFinals: next });
    saveProgress({ masteredInitials, masteredFinals: next, masteredTones });
  },

  toggleToneMastered: (tone) => {
    const { masteredInitials, masteredFinals, masteredTones } = get();
    const next = masteredTones.includes(tone)
      ? masteredTones.filter((t) => t !== tone)
      : [...masteredTones, tone];
    set({ masteredTones: next });
    saveProgress({ masteredInitials, masteredFinals, masteredTones: next });
  },

  setShowPinyinAnnotation: (show) => set({ showPinyinAnnotation: show }),
  setSpeechRate: (rate) => set({ speechRate: rate }),

  recordQuizResult: (isCorrect) => {
    const { quizScore } = get();
    set({
      quizScore: {
        correct: quizScore.correct + (isCorrect ? 1 : 0),
        total: quizScore.total + 1,
      },
    });
  },

  resetQuizScore: () => set({ quizScore: { correct: 0, total: 0 } }),
}));
