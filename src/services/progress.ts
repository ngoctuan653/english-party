/**
 * Progress Service — Learning Progress System (Spaced Repetition Lite)
 *
 * Manages per-user mastery tracking for questions and vocabulary.
 * Provides smart session generation that prioritises new → weak → review items.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { Question } from '@/types/question';
import type { VocabWord } from '@/types/vocabulary';
import type {
  QuestionProgress,
  VocabProgressRecord,
  ProgressState,
} from '@/types/progress';
import {
  MASTERY_THRESHOLDS,
  SESSION_RATIO,
  COOLDOWN_HIGH_MASTERY_MS,
  COOLDOWN_LOW_MASTERY_MS,
  RECENTLY_SEEN_CACHE_SIZE,
} from '@/types/progress';

// ============================================
// In-memory recently-seen caches
// Reset on page reload — intentional
// ============================================

let recentlySeenQuestionIds: string[] = [];
let recentlySeenVocabIds: string[] = [];

function pushToRecentCache(cache: string[], ids: string[]): string[] {
  const updated = [...cache, ...ids];
  // Keep only the latest N items
  return updated.slice(-RECENTLY_SEEN_CACHE_SIZE);
}

// ============================================
// Mastery Helpers (pure functions)
// ============================================

/**
 * Calculate new mastery after an answer.
 * Correct: diminishing-return gain → mastery + (100 - mastery) * 0.25
 * Wrong:  flat penalty → mastery - 25, clamped to 0
 */
export function calculateNewMastery(
  currentMastery: number,
  isCorrect: boolean
): number {
  if (isCorrect) {
    return Math.min(100, currentMastery + (100 - currentMastery) * 0.25);
  }
  return Math.max(0, currentMastery - 25);
}

/** Map a numeric mastery value to its state label. */
export function getMasteryState(mastery: number): ProgressState {
  if (mastery >= MASTERY_THRESHOLDS.MASTERED) return 'mastered';
  if (mastery >= MASTERY_THRESHOLDS.REVIEW) return 'review';
  if (mastery >= MASTERY_THRESHOLDS.LEARNING) return 'learning';
  return 'new';
}

/** Check if an item is on cooldown and should NOT appear yet. */
export function isOnCooldown(
  progress: QuestionProgress | VocabProgressRecord,
  nowMs: number
): boolean {
  if (!progress.lastSeenAt) return false;

  const lastSeenMs = progress.lastSeenAt.toMillis();

  // Wrong answers → no cooldown
  if (progress.wrongCount > progress.correctCount) return false;

  // Determine cooldown duration based on mastery
  const cooldownMs =
    progress.mastery >= MASTERY_THRESHOLDS.REVIEW
      ? COOLDOWN_HIGH_MASTERY_MS
      : COOLDOWN_LOW_MASTERY_MS;

  return nowMs - lastSeenMs < cooldownMs;
}

// ============================================
// Firestore CRUD — Question Progress
// ============================================

/** Fetch all question progress records for a user. */
export async function getUserQuestionProgress(
  userId: string
): Promise<Map<string, QuestionProgress>> {
  const progressRef = collection(db, 'users', userId, 'questionProgress');
  const snap = await getDocs(progressRef);
  const map = new Map<string, QuestionProgress>();
  snap.forEach((d) => {
    const data = d.data() as QuestionProgress;
    map.set(d.id, data);
  });
  return map;
}

/** Update (or create) question progress after an answer. */
export async function updateQuestionProgress(
  userId: string,
  questionId: string,
  isCorrect: boolean
): Promise<void> {
  const progressRef = doc(
    db,
    'users',
    userId,
    'questionProgress',
    questionId
  );

  // Fetch the specific document to get the current progress.
  const docSnap = await getDoc(progressRef);
  const existing = docSnap.exists() ? docSnap.data() as QuestionProgress : null;

  const currentMastery = existing?.mastery ?? 0;
  const newMastery = calculateNewMastery(currentMastery, isCorrect);

  const updated: QuestionProgress = {
    questionId,
    correctCount: (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0),
    wrongCount: (existing?.wrongCount ?? 0) + (isCorrect ? 0 : 1),
    lastSeenAt: Timestamp.now(),
    mastery: Math.round(newMastery * 100) / 100,
    state: getMasteryState(newMastery),
  };

  await setDoc(progressRef, updated);
}

/**
 * Batch-update question progress for an entire session.
 * More efficient: fetches progress once, writes once per question.
 */
export async function batchUpdateQuestionProgress(
  userId: string,
  answers: { questionId: string; isCorrect: boolean }[]
): Promise<void> {
  // Fetch existing progress once
  const progressMap = await getUserQuestionProgress(userId);

  const writes = answers.map((ans) => {
    const existing = progressMap.get(ans.questionId);
    const currentMastery = existing?.mastery ?? 0;
    const newMastery = calculateNewMastery(currentMastery, ans.isCorrect);

    const updated: QuestionProgress = {
      questionId: ans.questionId,
      correctCount:
        (existing?.correctCount ?? 0) + (ans.isCorrect ? 1 : 0),
      wrongCount:
        (existing?.wrongCount ?? 0) + (ans.isCorrect ? 0 : 1),
      lastSeenAt: Timestamp.now(),
      mastery: Math.round(newMastery * 100) / 100,
      state: getMasteryState(newMastery),
    };

    const ref = doc(
      db,
      'users',
      userId,
      'questionProgress',
      ans.questionId
    );
    return setDoc(ref, updated);
  });

  await Promise.all(writes);
}

// ============================================
// Firestore CRUD — Vocab Progress
// ============================================

/** Fetch all vocab progress records for a user. */
export async function getUserVocabProgress(
  userId: string
): Promise<Map<string, VocabProgressRecord>> {
  const progressRef = collection(db, 'users', userId, 'vocabProgress');
  const snap = await getDocs(progressRef);
  const map = new Map<string, VocabProgressRecord>();
  snap.forEach((d) => {
    const data = d.data() as VocabProgressRecord;
    map.set(d.id, data);
  });
  return map;
}

/** Batch-update vocab progress after a session. */
export async function batchUpdateVocabProgress(
  userId: string,
  entries: { wordId: string; isCorrect: boolean; alreadyKnew?: boolean }[]
): Promise<void> {
  const progressMap = await getUserVocabProgress(userId);

  const writes = entries.map((entry) => {
    const existing = progressMap.get(entry.wordId);
    let newMastery = 0;

    if (entry.alreadyKnew) {
      newMastery = 100;
    } else {
      const currentMastery = existing?.mastery ?? 0;
      newMastery = calculateNewMastery(currentMastery, entry.isCorrect);
    }

    const updated: VocabProgressRecord = {
      wordId: entry.wordId,
      correctCount:
        (existing?.correctCount ?? 0) + (entry.isCorrect ? 1 : 0),
      wrongCount:
        (existing?.wrongCount ?? 0) + (entry.isCorrect ? 0 : 1),
      lastSeenAt: Timestamp.now(),
      mastery: Math.round(newMastery * 100) / 100,
      state: getMasteryState(newMastery),
    };

    const ref = doc(db, 'users', userId, 'vocabProgress', entry.wordId);
    return setDoc(ref, updated);
  });

  await Promise.all(writes);
}

// ============================================
// Smart Session Generators
// ============================================

/** Shuffle an array (Fisher-Yates). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate a smart quiz session.
 * Prioritises: new (60%) → weak (25%) → review (15%)
 * Applies cooldown + recently-seen filtering.
 */
export async function generateSmartQuizSession(
  userId: string,
  allQuestions: Question[],
  count: number
): Promise<Question[]> {
  const progressMap = await getUserQuestionProgress(userId);
  const now = Date.now();

  // Categorise questions
  const newPool: Question[] = [];
  const weakPool: { q: Question; mastery: number; lastSeen: number }[] = [];
  const reviewPool: { q: Question; mastery: number; lastSeen: number }[] = [];

  for (const q of allQuestions) {
    const prog = progressMap.get(q.id);

    // Skip recently seen (in-memory cache)
    if (recentlySeenQuestionIds.includes(q.id)) continue;

    if (!prog) {
      // Never seen → new pool
      newPool.push(q);
      continue;
    }

    // Skip if on cooldown
    if (isOnCooldown(prog, now)) continue;

    const lastSeen = prog.lastSeenAt?.toMillis?.() ?? 0;

    if (prog.mastery < MASTERY_THRESHOLDS.REVIEW) {
      // mastery 0-39 → weak (learning)
      weakPool.push({ q, mastery: prog.mastery, lastSeen });
    } else {
      // mastery 40+ → review
      reviewPool.push({ q, mastery: prog.mastery, lastSeen });
    }
  }

  // Sort weak pool: lowest mastery first, then most wrong
  weakPool.sort((a, b) => a.mastery - b.mastery || a.lastSeen - b.lastSeen);

  // Sort review pool: oldest lastSeen first (needs review)
  reviewPool.sort((a, b) => a.lastSeen - b.lastSeen);

  // Calculate slot counts
  let newSlots = Math.ceil(count * SESSION_RATIO.NEW);
  let weakSlots = Math.ceil(count * SESSION_RATIO.WEAK);
  let reviewSlots = count - newSlots - weakSlots;

  // Ensure we don't exceed count
  if (reviewSlots < 0) {
    reviewSlots = 0;
    weakSlots = count - newSlots;
  }

  // Fill slots — overflow to next category if under-filled
  const picked: Question[] = [];

  // 1. New
  const shuffledNew = shuffle(newPool);
  const newPicked = shuffledNew.slice(0, newSlots);
  picked.push(...newPicked);
  let remaining = newSlots - newPicked.length;

  // 2. Weak (+ overflow from new)
  const weakAvail = weakSlots + remaining;
  const weakPicked = weakPool.slice(0, weakAvail).map((w) => w.q);
  picked.push(...weakPicked);
  remaining = weakAvail - weakPicked.length;

  // 3. Review (+ overflow from weak)
  const reviewAvail = reviewSlots + remaining;
  const reviewPicked = reviewPool.slice(0, reviewAvail).map((r) => r.q);
  picked.push(...reviewPicked);
  remaining = reviewAvail - reviewPicked.length;

  // 4. If still under-filled, grab anything remaining (including cooldown items)
  if (picked.length < count) {
    const pickedIds = new Set(picked.map((p) => p.id));
    const extras = allQuestions.filter(
      (q) =>
        !pickedIds.has(q.id) && !recentlySeenQuestionIds.includes(q.id)
    );
    const shuffledExtras = shuffle(extras);
    picked.push(...shuffledExtras.slice(0, count - picked.length));
  }

  // Update recently seen cache
  recentlySeenQuestionIds = pushToRecentCache(
    recentlySeenQuestionIds,
    picked.map((q) => q.id)
  );

  return shuffle(picked);
}

/**
 * Generate a smart vocabulary session.
 * Orders words: new first → learning → review → mastered.
 * Returns ALL words (for the full deck experience) but ordered smartly.
 */
export async function generateSmartVocabSession(
  userId: string,
  allWords: VocabWord[]
): Promise<{
  words: VocabWord[];
  progressMap: Map<string, VocabProgressRecord>;
  stats: { newCount: number; learningCount: number; reviewCount: number; masteredCount: number };
}> {
  const progressMap = await getUserVocabProgress(userId);
  const now = Date.now();

  const newWords: VocabWord[] = [];
  const learningWords: { w: VocabWord; mastery: number; lastSeen: number }[] = [];
  const reviewWords: { w: VocabWord; mastery: number; lastSeen: number }[] = [];
  const masteredWords: { w: VocabWord; mastery: number; lastSeen: number }[] = [];

  for (const w of allWords) {
    const prog = progressMap.get(w.id);

    if (!prog) {
      newWords.push(w);
      continue;
    }

    const lastSeen = prog.lastSeenAt?.toMillis?.() ?? 0;

    if (prog.mastery < MASTERY_THRESHOLDS.REVIEW) {
      learningWords.push({ w, mastery: prog.mastery, lastSeen });
    } else if (prog.mastery < MASTERY_THRESHOLDS.MASTERED) {
      reviewWords.push({ w, mastery: prog.mastery, lastSeen });
    } else {
      masteredWords.push({ w, mastery: prog.mastery, lastSeen });
    }
  }

  // Sort: learning by lowest mastery first
  learningWords.sort((a, b) => a.mastery - b.mastery);
  // Sort: review by oldest lastSeen first
  reviewWords.sort((a, b) => a.lastSeen - b.lastSeen);
  // Sort: mastered by oldest lastSeen first
  masteredWords.sort((a, b) => a.lastSeen - b.lastSeen);

  // Compose final ordering: new → learning → review → mastered
  const orderedWords: VocabWord[] = [
    ...shuffle(newWords),
    ...learningWords.map((l) => l.w),
    ...reviewWords.map((r) => r.w),
    ...masteredWords.map((m) => m.w),
  ];

  // Update recently seen cache
  recentlySeenVocabIds = pushToRecentCache(
    recentlySeenVocabIds,
    orderedWords.slice(0, RECENTLY_SEEN_CACHE_SIZE).map((w) => w.id)
  );

  return {
    words: orderedWords,
    progressMap,
    stats: {
      newCount: newWords.length,
      learningCount: learningWords.length,
      reviewCount: reviewWords.length,
      masteredCount: masteredWords.length,
    },
  };
}

/**
 * Get progress stats summary for a user's questions.
 */
export async function getQuestionProgressStats(
  userId: string,
  totalQuestions: number
): Promise<{ newCount: number; learningCount: number; reviewCount: number; masteredCount: number }> {
  const progressMap = await getUserQuestionProgress(userId);
  let learningCount = 0;
  let reviewCount = 0;
  let masteredCount = 0;

  progressMap.forEach((prog) => {
    if (prog.mastery >= MASTERY_THRESHOLDS.MASTERED) masteredCount++;
    else if (prog.mastery >= MASTERY_THRESHOLDS.REVIEW) reviewCount++;
    else learningCount++;
  });

  const newCount = totalQuestions - learningCount - reviewCount - masteredCount;
  return { newCount: Math.max(0, newCount), learningCount, reviewCount, masteredCount };
}
