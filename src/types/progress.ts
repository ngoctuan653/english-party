import { Timestamp } from 'firebase/firestore';

// ============================================
// Progress State Types
// ============================================

export type ProgressState = 'new' | 'learning' | 'review' | 'mastered';

// ============================================
// Question Progress (per-user, per-question)
// Stored at: users/{uid}/questionProgress/{questionId}
// ============================================

export interface QuestionProgress {
  questionId: string;
  correctCount: number;
  wrongCount: number;
  lastSeenAt: Timestamp;
  mastery: number; // 0-100
  state: ProgressState;
}

// ============================================
// Vocab Progress (per-user, per-word)
// Stored at: users/{uid}/vocabProgress/{wordId}
// ============================================

export interface VocabProgressRecord {
  wordId: string;
  correctCount: number;
  wrongCount: number;
  lastSeenAt: Timestamp;
  mastery: number; // 0-100
  state: ProgressState;
}

// ============================================
// Mastery Thresholds
// ============================================

/** Mastery ranges that map to ProgressState */
export const MASTERY_THRESHOLDS = {
  /** mastery >= 1 → 'learning' */
  LEARNING: 1,
  /** mastery >= 40 → 'review' */
  REVIEW: 40,
  /** mastery >= 75 → 'mastered' */
  MASTERED: 75,
} as const;

// ============================================
// Session Composition Ratios
// ============================================

/** How a smart session is composed from different pools */
export const SESSION_RATIO = {
  /** % of session from never-seen items */
  NEW: 0.6,
  /** % of session from weak items (low mastery / wrong) */
  WEAK: 0.25,
  /** % of session from old review items (high mastery, not recently seen) */
  REVIEW: 0.15,
} as const;

// ============================================
// Cooldown Durations (milliseconds)
// ============================================

/** Cooldown after correct answer, mastery >= REVIEW threshold */
export const COOLDOWN_HIGH_MASTERY_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Cooldown after correct answer, mastery < REVIEW threshold */
export const COOLDOWN_LOW_MASTERY_MS = 4 * 60 * 60 * 1000; // 4 hours

/** No cooldown for wrong answers — they can reappear immediately */

// ============================================
// Recently Seen Cache Size
// ============================================

/** Max number of recently-seen item IDs to keep in memory */
export const RECENTLY_SEEN_CACHE_SIZE = 20;
