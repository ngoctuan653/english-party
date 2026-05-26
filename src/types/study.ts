import type { Timestamp } from 'firebase/firestore';
import type { QuestionAnswer } from './question';

export type SessionType = 'quiz' | 'vocabulary' | 'listening' | 'mission';

export interface StudySession {
  id: string;
  userId: string;
  exam: string;
  type: SessionType;
  questionsAttempted: number;
  questionsCorrect: number;
  accuracy: number;
  xpEarned: number;
  startedAt: Timestamp;
  endedAt: Timestamp | null;
  activeSeconds: number;
  totalSeconds: number;
  tabSwitches: number;
  idleIntervals: number;
  interactionCount: number;
  isValid: boolean;
  answers: QuestionAnswer[];
  createdAt: Timestamp;
}

export interface StudyState {
  isActive: boolean;
  currentSession: StudySession | null;
  currentQuestionIndex: number;
  questions: any[];
  selectedAnswer: number | null;
  showExplanation: boolean;
  sessionResults: SessionResults | null;
}

export interface SessionResults {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  xpEarned: number;
  streakBonus: number;
  timeSpent: number;
  isValid: boolean;
}
