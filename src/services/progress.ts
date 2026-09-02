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
import type { Question, QuestionAnswer } from '@/types/question';
import type { VocabWord } from '@/types/vocabulary';
import type {
  QuestionProgress,
  ReviewRating,
  VocabProgressRecord,
  ProgressState,
} from '@/types/progress';
import {
  MASTERY_THRESHOLDS,
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

const DAY_MS = 24 * 60 * 60 * 1000;
const AGAIN_RETRY_MS = 10 * 60 * 1000;

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function timestampMs(value: Timestamp | undefined): number {
  return value?.toMillis?.() ?? 0;
}

export function isReviewDue(
  progress: QuestionProgress | VocabProgressRecord,
  nowMs = Date.now(),
): boolean {
  if (progress.nextReviewAt) return timestampMs(progress.nextReviewAt) <= nowMs;
  return !isOnCooldown(progress, nowMs);
}

export function ratingFromAnswer(answer: Pick<QuestionAnswer, 'isCorrect' | 'confidence'>): ReviewRating {
  if (!answer.isCorrect) return 'again';
  if (answer.confidence === 'low') return 'hard';
  if (answer.confidence === 'high') return 'easy';
  return 'good';
}

/**
 * Lightweight adaptive scheduler inspired by modern spaced-repetition systems.
 * It keeps the existing mastery model while adding an item-specific next review.
 */
export function calculateReviewSchedule(
  current: Partial<QuestionProgress | VocabProgressRecord> | undefined,
  rating: ReviewRating,
  nowMs = Date.now(),
) {
  const currentMastery = clamp(current?.mastery ?? 0, 0, 100);
  const previousInterval = Math.max(0, current?.intervalDays ?? 0);
  const previousCorrect = Math.max(0, current?.consecutiveCorrect ?? 0);
  let easeFactor = clamp(current?.easeFactor ?? 2.3, 1.3, 3);
  let intervalDays = previousInterval;
  let consecutiveCorrect = previousCorrect;
  let lapseCount = Math.max(0, current?.lapseCount ?? 0);
  let nextReviewMs = nowMs + DAY_MS;
  let mastery = currentMastery;

  if (rating === 'again') {
    mastery = calculateNewMastery(currentMastery, false);
    intervalDays = 0;
    consecutiveCorrect = 0;
    lapseCount += 1;
    easeFactor = clamp(easeFactor - 0.2, 1.3, 3);
    nextReviewMs = nowMs + AGAIN_RETRY_MS;
  } else if (rating === 'hard') {
    mastery = Math.min(100, currentMastery + (100 - currentMastery) * 0.12);
    consecutiveCorrect += 1;
    intervalDays = previousInterval <= 0 ? 1 : Math.max(1, Math.round(previousInterval * 1.25));
    easeFactor = clamp(easeFactor - 0.05, 1.3, 3);
    nextReviewMs = nowMs + intervalDays * DAY_MS;
  } else if (rating === 'good') {
    mastery = calculateNewMastery(currentMastery, true);
    consecutiveCorrect += 1;
    intervalDays = previousInterval <= 0
      ? (previousCorrect > 0 ? 3 : 1)
      : Math.max(previousInterval + 1, Math.round(previousInterval * easeFactor));
    nextReviewMs = nowMs + intervalDays * DAY_MS;
  } else {
    mastery = Math.min(100, currentMastery + (100 - currentMastery) * 0.4);
    consecutiveCorrect += 1;
    intervalDays = previousInterval <= 0
      ? 4
      : Math.max(previousInterval + 2, Math.round(previousInterval * easeFactor * 1.3));
    easeFactor = clamp(easeFactor + 0.05, 1.3, 3);
    nextReviewMs = nowMs + intervalDays * DAY_MS;
  }

  const roundedMastery = Math.round(mastery * 100) / 100;
  return {
    mastery: roundedMastery,
    state: getMasteryState(roundedMastery),
    reviewCount: Math.max(0, current?.reviewCount ?? 0) + 1,
    lapseCount,
    consecutiveCorrect,
    intervalDays,
    easeFactor: Math.round(easeFactor * 100) / 100,
    nextReviewAt: Timestamp.fromMillis(nextReviewMs),
    lastRating: rating,
  };
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
  if (progress.nextReviewAt) return timestampMs(progress.nextReviewAt) > nowMs;
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

  const schedule = calculateReviewSchedule(existing ?? undefined, isCorrect ? 'good' : 'again');

  const updated: QuestionProgress = {
    questionId,
    correctCount: (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0),
    wrongCount: (existing?.wrongCount ?? 0) + (isCorrect ? 0 : 1),
    lastSeenAt: Timestamp.now(),
    ...schedule,
  };

  await setDoc(progressRef, updated);
}

/**
 * Batch-update question progress for an entire session.
 * More efficient: fetches progress once, writes once per question.
 */
export async function batchUpdateQuestionProgress(
  userId: string,
  answers: Array<Pick<QuestionAnswer, 'questionId' | 'isCorrect' | 'confidence'>>
): Promise<void> {
  // Fetch existing progress once
  const progressMap = await getUserQuestionProgress(userId);

  const writes = answers.map((ans) => {
    const existing = progressMap.get(ans.questionId);
    const schedule = calculateReviewSchedule(existing, ratingFromAnswer(ans));

    const updated: QuestionProgress = {
      questionId: ans.questionId,
      correctCount:
        (existing?.correctCount ?? 0) + (ans.isCorrect ? 1 : 0),
      wrongCount:
        (existing?.wrongCount ?? 0) + (ans.isCorrect ? 0 : 1),
      lastSeenAt: Timestamp.now(),
      ...schedule,
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
  entries: { wordId: string; isCorrect: boolean; alreadyKnew?: boolean; rating?: ReviewRating }[]
): Promise<void> {
  const progressMap = await getUserVocabProgress(userId);

  const writes = entries.map((entry) => {
    const existing = progressMap.get(entry.wordId);
    const rating = entry.rating ?? (entry.alreadyKnew ? 'easy' : entry.isCorrect ? 'good' : 'again');
    const schedule = calculateReviewSchedule(existing, rating);

    const updated: VocabProgressRecord = {
      wordId: entry.wordId,
      correctCount:
        (existing?.correctCount ?? 0) + (entry.isCorrect ? 1 : 0),
      wrongCount:
        (existing?.wrongCount ?? 0) + (entry.isCorrect ? 0 : 1),
      lastSeenAt: Timestamp.now(),
      ...schedule,
    };

    const ref = doc(db, 'users', userId, 'vocabProgress', entry.wordId);
    return setDoc(ref, updated);
  });

  await Promise.all(writes);
}

export function buildSmartVocabDeck(
  allWords: VocabWord[],
  progressMap: Map<string, VocabProgressRecord>,
  options: { maxCount?: number; reviewSampleCount?: number } = {}
): VocabWord[] {
  const maxCount = Math.max(1, options.maxCount ?? 12);
  const reviewSampleCount = Math.max(1, options.reviewSampleCount ?? 3);
  const now = Date.now();
  const newWords: VocabWord[] = [];
  const dueWords: { w: VocabWord; mastery: number; dueAt: number }[] = [];
  const futureLearning: { w: VocabWord; mastery: number; dueAt: number }[] = [];
  const futureMastered: { w: VocabWord; mastery: number; dueAt: number }[] = [];

  for (const w of allWords) {
    const prog = progressMap.get(w.id);
    if (!prog) {
      newWords.push(w);
      continue;
    }

    const dueAt = timestampMs(prog.nextReviewAt) || timestampMs(prog.lastSeenAt);
    if (isReviewDue(prog, now)) {
      dueWords.push({ w, mastery: prog.mastery, dueAt });
    } else if (prog.mastery < MASTERY_THRESHOLDS.MASTERED) {
      futureLearning.push({ w, mastery: prog.mastery, dueAt });
    } else {
      futureMastered.push({ w, mastery: prog.mastery, dueAt });
    }
  }

  dueWords.sort((a, b) => a.dueAt - b.dueAt || a.mastery - b.mastery);
  futureLearning.sort((a, b) => a.mastery - b.mastery || a.dueAt - b.dueAt);
  futureMastered.sort((a, b) => a.dueAt - b.dueAt || a.mastery - b.mastery);

  const picked: VocabWord[] = [];
  const pickedIds = new Set<string>();
  const add = (items: VocabWord[], limit: number) => {
    for (const word of items) {
      if (picked.length >= maxCount || limit <= 0 || pickedIds.has(word.id)) continue;
      picked.push(word);
      pickedIds.add(word.id);
      limit -= 1;
    }
  };
  const preferFresh = <T extends { w: VocabWord }>(items: T[]) => [
    ...items.filter((entry) => !recentlySeenVocabIds.includes(entry.w.id)),
    ...items.filter((entry) => recentlySeenVocabIds.includes(entry.w.id)),
  ].map((entry) => entry.w);

  const dueSlots = Math.min(maxCount, Math.max(reviewSampleCount, Math.ceil(maxCount * 0.5)));
  const newSlots = Math.max(0, Math.ceil(maxCount * 0.35));
  add(preferFresh(dueWords), dueSlots);
  add(shuffle(newWords), newSlots);
  add(preferFresh(futureLearning), maxCount - picked.length);
  add(preferFresh(dueWords), maxCount - picked.length);
  add(preferFresh(futureMastered), maxCount - picked.length);
  add(shuffle(allWords), maxCount - picked.length);

  const deck = picked.length > 0 ? picked : shuffle(allWords).slice(0, Math.min(maxCount, allWords.length));

  recentlySeenVocabIds = pushToRecentCache(
    recentlySeenVocabIds,
    deck.map((w) => w.id)
  );

  return deck;
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
 * Build a focused deck from questions the learner has not recovered yet.
 * A mistake is considered recovered once correct attempts catch up and
 * mastery reaches the review threshold.
 */
export function buildMistakeReviewDeck(
  allQuestions: Question[],
  progressMap: Map<string, QuestionProgress>,
  count = 10,
): Question[] {
  const candidates = allQuestions
    .map((question) => ({ question, progress: progressMap.get(question.id) }))
    .filter(({ progress }) =>
      progress &&
      progress.wrongCount > 0 &&
      (progress.wrongCount > progress.correctCount || progress.mastery < MASTERY_THRESHOLDS.REVIEW)
    )
    .sort((a, b) => {
      const aProgress = a.progress!;
      const bProgress = b.progress!;
      const aUnresolved = aProgress.wrongCount > aProgress.correctCount ? 0 : 1;
      const bUnresolved = bProgress.wrongCount > bProgress.correctCount ? 0 : 1;
      const aLastSeen = aProgress.lastSeenAt?.toMillis?.() ?? 0;
      const bLastSeen = bProgress.lastSeenAt?.toMillis?.() ?? 0;

      return (
        aUnresolved - bUnresolved ||
        aProgress.mastery - bProgress.mastery ||
        bProgress.wrongCount - aProgress.wrongCount ||
        aLastSeen - bLastSeen
      );
    });

  const fresh = candidates.filter(({ question }) => !recentlySeenQuestionIds.includes(question.id));
  const repeated = candidates.filter(({ question }) => recentlySeenQuestionIds.includes(question.id));
  const deck = [...fresh, ...repeated].slice(0, Math.max(1, count)).map(({ question }) => question);

  recentlySeenQuestionIds = pushToRecentCache(
    recentlySeenQuestionIds,
    deck.map((question) => question.id),
  );

  return deck;
}

/**
 * Interleave topics and parts without destroying the scheduler's priority order.
 */
export function interleaveQuestions(items: Question[]): Question[] {
  const remaining = [...items];
  const result: Question[] = [];

  while (remaining.length > 0) {
    const previous = result.at(-1);
    const nextIndex = previous
      ? remaining.findIndex((question) => question.topic !== previous.topic && question.part !== previous.part)
      : 0;
    const fallbackIndex = previous
      ? remaining.findIndex((question) => question.topic !== previous.topic)
      : 0;
    const index = nextIndex >= 0 ? nextIndex : fallbackIndex >= 0 ? fallbackIndex : 0;
    result.push(remaining.splice(index, 1)[0]);
  }

  return result;
}

/**
 * Generate a due-first adaptive quiz with new material and reinforcement.
 */
export async function generateSmartQuizSession(
  userId: string,
  allQuestions: Question[],
  count: number,
  options: { targetDifficulty?: number } = {},
): Promise<Question[]> {
  const progressMap = await getUserQuestionProgress(userId);
  const now = Date.now();
  const maxCount = Math.max(1, count);
  const newPool: Question[] = [];
  const dueWeak: { q: Question; mastery: number; dueAt: number }[] = [];
  const dueReview: { q: Question; mastery: number; dueAt: number }[] = [];
  const futureWeak: { q: Question; mastery: number; dueAt: number }[] = [];
  const futureReview: { q: Question; mastery: number; dueAt: number }[] = [];

  for (const q of allQuestions) {
    const prog = progressMap.get(q.id);
    if (!prog) {
      newPool.push(q);
      continue;
    }

    const dueAt = timestampMs(prog.nextReviewAt) || timestampMs(prog.lastSeenAt);
    if (isReviewDue(prog, now)) {
      if (prog.mastery < MASTERY_THRESHOLDS.REVIEW) dueWeak.push({ q, mastery: prog.mastery, dueAt });
      else dueReview.push({ q, mastery: prog.mastery, dueAt });
    } else if (prog.mastery < MASTERY_THRESHOLDS.REVIEW) {
      futureWeak.push({ q, mastery: prog.mastery, dueAt });
    } else {
      futureReview.push({ q, mastery: prog.mastery, dueAt });
    }
  }

  const byNeed = (a: { mastery: number; dueAt: number }, b: { mastery: number; dueAt: number }) =>
    a.dueAt - b.dueAt || a.mastery - b.mastery;
  dueWeak.sort(byNeed);
  dueReview.sort(byNeed);
  futureWeak.sort((a, b) => a.mastery - b.mastery || a.dueAt - b.dueAt);
  futureReview.sort(byNeed);

  const targetDifficulty = options.targetDifficulty;
  const preparedNew = shuffle(newPool).sort((a, b) => {
    if (!targetDifficulty) return 0;
    return Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty);
  });
  const picked: Question[] = [];
  const pickedIds = new Set<string>();
  const add = (items: Question[], limit: number) => {
    for (const question of items) {
      if (picked.length >= maxCount || limit <= 0 || pickedIds.has(question.id)) continue;
      if (recentlySeenQuestionIds.includes(question.id)) continue;
      picked.push(question);
      pickedIds.add(question.id);
      limit -= 1;
    }
  };

  const duePool = [...dueWeak, ...dueReview].map((entry) => entry.q);
  const reinforcementPool = [...futureWeak, ...futureReview].map((entry) => entry.q);
  add(duePool, Math.ceil(maxCount * 0.5));
  add(preparedNew, Math.ceil(maxCount * 0.35));
  add(reinforcementPool, maxCount - picked.length);
  add(duePool, maxCount - picked.length);
  add(preparedNew, maxCount - picked.length);
  add(shuffle(allQuestions), maxCount - picked.length);

  if (picked.length < maxCount) {
    for (const question of shuffle(allQuestions)) {
      if (picked.length >= maxCount) break;
      if (!pickedIds.has(question.id)) {
        picked.push(question);
        pickedIds.add(question.id);
      }
    }
  }

  // Update recently seen cache
  recentlySeenQuestionIds = pushToRecentCache(
    recentlySeenQuestionIds,
    picked.map((q) => q.id)
  );

  return interleaveQuestions(picked);
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
