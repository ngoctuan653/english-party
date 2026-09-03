import { Timestamp } from 'firebase/firestore';
import type { CefrLevel } from './cefr';

export interface VocabWord {
  id: string;
  exam: string;
  cefrLevel?: CefrLevel;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  definitionNative?: string;
  example: string;
  exampleTranslation?: string;
  collocations?: string[];
  phrasalVerbs?: string[];
  antonyms?: string[];
  topic: string;
  difficulty: number;
  audioUrl?: string;
  imageUrl?: string;
  synonyms: string[];
  tags: string[];
  isActive: boolean;
  createdAt: Timestamp;
}

export interface VocabProgress {
  wordId: string;
  masteryLevel: number; // 0-5
  timesReviewed: number;
  timesCorrect: number;
  lastReviewed: Timestamp | null;
  nextReview: Timestamp | null;
}
