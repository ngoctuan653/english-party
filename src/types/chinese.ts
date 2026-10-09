export type HSKLevel = 'hsk0' | 'hsk1' | 'hsk2' | 'hsk3' | 'hsk4';

export type ToneNumber = 1 | 2 | 3 | 4 | 5; // 5 is neutral tone (thanh nhẹ)

export interface PinyinInitial {
  id: string;
  symbol: string; // e.g. "b", "p", "zh", "ch"
  ipa: string; // e.g. "[p]", "[pʰ]"
  vietnameseEquivalent: string; // e.g. "gần giống 'p' hoặc 'b' mềm trong tiếng Việt"
  description: string;
  mouthShape: string;
  audioSample: string; // e.g. "bo"
  group: 'labial' | 'dental' | 'velar' | 'palatal' | 'retroflex' | 'alveolar';
  groupNameVi: string;
  examples: Array<{
    pinyin: string;
    hanzi: string;
    meaningVi: string;
  }>;
}

export interface PinyinFinal {
  id: string;
  symbol: string; // e.g. "a", "ai", "ang", "ü"
  ipa: string;
  vietnameseEquivalent: string;
  description: string;
  category: 'simple' | 'compound' | 'nasal' | 'special';
  categoryNameVi: string;
  audioSample: string;
  examples: Array<{
    pinyin: string;
    hanzi: string;
    meaningVi: string;
  }>;
}

export interface PinyinSyllable {
  initial: string;
  final: string;
  pinyin: string; // base without tone, e.g. "ma"
  tones: {
    1: string; // mā
    2: string; // má
    3: string; // mǎ
    4: string; // mà
    5?: string; // ma
  };
  sampleHanzi?: {
    1?: { hanzi: string; meaningVi: string };
    2?: { hanzi: string; meaningVi: string };
    3?: { hanzi: string; meaningVi: string };
    4?: { hanzi: string; meaningVi: string };
  };
}

export interface ToneInfo {
  tone: ToneNumber;
  name: string; // e.g. "Thanh 1 (Âm Bình)"
  chineseName: string; // e.g. "第一声 (阴平)"
  symbol: string; // e.g. "¯"
  pitch: string; // e.g. "55"
  contourDescription: string;
  descriptionVi: string;
  vietnameseComparison: string; // e.g. "Cao, đều, giống như đọc không dấu kéo dài âm vực cao"
  color: string; // e.g. "#EF4444" (Red)
  bgLight: string;
  examples: Array<{
    pinyin: string;
    hanzi: string;
    meaningVi: string;
  }>;
}

export interface ToneSandhiRule {
  id: string;
  title: string;
  chineseTitle: string;
  rule: string;
  explanationVi: string;
  examples: Array<{
    originalPinyin: string;
    spokenPinyin: string;
    hanzi: string;
    meaningVi: string;
    note?: string;
  }>;
}

export interface ToneExercise {
  id: string;
  type: 'identify_tone' | 'minimal_pair' | 'tone_sandhi' | 'listen_select';
  question: string;
  audioPromptText: string;
  audioRate?: number;
  options: Array<{
    id: string;
    text: string;
    pinyin?: string;
    isCorrect: boolean;
  }>;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ChineseVocabWord {
  id: string;
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  sinoVietnamese?: string;
  meaningEn: string;
  hskLevel: HSKLevel;
  partOfSpeech: string; // 'noun' | 'verb' | 'adjective' | 'pronoun' | etc.
  strokeCount?: number;
  radicals?: string[];
  measureWord?: string;
  examples: Array<{
    hanzi: string;
    pinyin: string;
    meaningVi: string;
  }>;
  synonyms?: string[];
  antonyms?: string[];
  audioText?: string;
}

export interface ChineseGrammarPattern {
  id: string;
  hskLevel: HSKLevel;
  title: string;
  pattern: string; // e.g. "S + 是 + N"
  explanationVi: string;
  structure: string[];
  vietnameseEquivalent: string;
  examples: Array<{
    hanzi: string;
    pinyin: string;
    meaningVi: string;
    breakdown?: string;
  }>;
  exercises?: Array<{
    type: 'reorder' | 'multiple_choice' | 'fill_blank';
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanationVi: string;
  }>;
}

export interface ChineseProgress {
  userId: string;
  pinyinMasteredCount: number;
  tonesMasteredCount: number;
  hskProgress: Record<HSKLevel, {
    learnedWords: number;
    masteredWords: number;
    totalWords: number;
    grammarMastered: number;
    totalGrammar: number;
  }>;
  streakDays: number;
  lastStudyDate: string;
  totalXp: number;
}

export type { HskMockExam, HskMockQuestion } from '@/data/chinese/mock-exams';
