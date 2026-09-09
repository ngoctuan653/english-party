import type { CefrLevel } from './cefr';

export type SpeakingMode = 'roleplay' | 'exam';

export interface GrammarCorrection {
  original: string;
  correction: string;
  explanation: string;
}

export interface CriterionScores {
  grammar: number;      // 1-10
  vocabulary: number;   // 1-10
  coherence: number;    // 1-10
  pronunciation?: number; // 1-10
}

export interface TurnFeedback {
  // Overall score
  score: number; // 1-10 (standard)
  overall_score?: number; // 1-10

  // 4 standard criteria scores
  scores?: CriterionScores;

  // Specific grammar corrections with error highlight & explanation
  grammar_corrections?: GrammarCorrection[];

  // Native phrasing / better alternatives
  better_alternatives?: string[];

  // General evaluation feedback (2-3 sentences in Vietnamese)
  feedback?: string;

  // Legacy / fallback fields
  grammarIssues: string[];
  betterAlternative: string;
  vocabularyNote?: string;
  pronunciationTips?: string;

  isFinished?: boolean;
}

export interface ConversationTurn {
  id: string;
  role: 'ai' | 'user';
  text: string;
  timestamp: number;
  feedback?: TurnFeedback;
}

export interface RoleplayTurnEvaluation {
  turn_index: number;
  user_said: string;
  score: number;
  correction: string;
  explanation: string;
  better_alternative: string;
}

export interface RoleplaySessionReport {
  overall_score: number;
  scores: CriterionScores;
  summary_feedback: string;
  detailed_turns: RoleplayTurnEvaluation[];
  xpEarned: number;
  turnsCount: number;
  durationSeconds: number;
}

export type ExamSpeakingCategory = 'IELTS' | 'VSTEP' | 'TOEIC' | 'all';

export interface SpeakingHistoryItem {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  scenarioIcon: string;
  level: CefrLevel;
  date: string; // ISO string
  timestamp: number;
  durationSeconds: number;
  turnsCount: number;
  overallScore: number;
  xpEarned: number;
  report: RoleplaySessionReport;
}

export interface SpeakingScenario {
  id: string;
  title: string;
  viTitle: string;
  description: string;
  icon: string;
  level: CefrLevel;
  category: 'daily' | 'business' | 'travel' | 'academic';
  starterPrompt: string;
  aiPersona: string;
  suggestedPhrases: string[];
}

export interface SpeakingExamQuestion {
  id: string;
  part: 1 | 2 | 3;
  topic: string;
  viTopic: string;
  question: string;
  prepTimeSeconds: number;
  speakingTimeSeconds: number;
  cuePoints?: string[];
  level: CefrLevel;
}

export interface SpeakingExamResult {
  question: SpeakingExamQuestion;
  userTranscript: string;
  durationSeconds: number;
  scores: {
    fluency: number; // 1-9
    lexical: number;
    grammar: number;
    pronunciation: number;
    overall: number;
  };
  cefrEquivalent: CefrLevel;
  detailedFeedback: {
    strengths: string[];
    improvements: string[];
    grammarCorrections: Array<{ original: string; corrected: string; explanation: string }>;
    advancedVocabularySuggestions: string[];
  };
  sampleBand9Answer: string;
  xpEarned: number;
}
