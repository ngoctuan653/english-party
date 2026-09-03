import { Timestamp } from 'firebase/firestore';
import type { CefrLevel } from './cefr';

export type CefrSkill = 'grammar' | 'use-of-english' | 'reading' | 'listening';
export type QuestionType = 'mcq' | 'fill' | 'listening' | 'reading';
export type DifficultyLevel = 500 | 600 | 650 | 700 | 800 | 900;
export type AnswerConfidence = 'low' | 'medium' | 'high';

export interface Question {
  id: string;
  exam: string;
  cefrLevel?: CefrLevel;
  skill?: CefrSkill;
  part?: number;
  type: QuestionType;
  topic: string;
  difficulty: number;
  question: string;
  context?: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
  audioUrl?: string;
  transcript?: string;
  tags: string[];
  isActive: boolean;
  timesAnswered: number;
  timesCorrect: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface QuestionAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  confidence?: AnswerConfidence;
}
