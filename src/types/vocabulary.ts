import { Timestamp } from 'firebase/firestore';

export interface VocabWord {
  id: string;
  exam: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  definitionNative?: string;
  example: string;
  exampleTranslation?: string;
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
