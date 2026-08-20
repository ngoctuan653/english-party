/**
 * Study Service
 * Manages study sessions, question fetching, and answer submission.
 */

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { Question, QuestionAnswer } from '@/types/question';
import type { StudySession, SessionResults, SessionType, SessionValidationIssue } from '@/types/study';
import type { DailyProgress, MissionProgress, MissionType } from '@/types/gamification';
import type { UserProfile } from '@/types/user';
import {
  cancelAntiCheatTracking,
  startAntiCheatTracking,
  stopAntiCheatTracking,
  validateAnswerTiming,
} from '@/services/anticheat';
import type { AntiCheatData } from '@/services/anticheat';
import { ANTI_CHEAT } from '@/utils/constants';
import {
  calculateSessionXP,
  generateDailyMissions,
  hasMetStreakRequirements,
} from '@/services/gamification';
import { calculateLevel } from '@/types/gamification';
import { getTodayDateString } from '@/utils/helpers';
import { batchUpdateQuestionProgress, batchUpdateVocabProgress } from '@/services/progress';
import { getBundledQuestions } from '@/data/questionBank';

// ============================================
// Fetch Questions
// ============================================

export async function fetchQuestions(options: {
  exam?: string;
  part?: number;
  topic?: string;
  difficulty?: number;
  type?: string;
  count?: number;
}): Promise<Question[]> {
  const bundled = getBundledQuestions(options);
  const questionsRef = collection(db, 'questions');
  const constraints: Parameters<typeof query>[1][] = [
    where('isActive', '==', true),
  ];

  if (options.exam) constraints.push(where('exam', '==', options.exam));
  if (options.part) constraints.push(where('part', '==', options.part));
  if (options.topic) constraints.push(where('topic', '==', options.topic));
  if (options.difficulty) constraints.push(where('difficulty', '==', options.difficulty));
  if (options.type) constraints.push(where('type', '==', options.type));

  constraints.push(limit(options.count || 20));

  const q = query(questionsRef, ...constraints);
  const remoteQuestions: Question[] = [];

  try {
    const snapshot = await getDocs(q);
    snapshot.forEach((snapshotDoc) => {
      remoteQuestions.push({ id: snapshotDoc.id, ...snapshotDoc.data() } as Question);
    });
  } catch (error) {
    if (bundled.length === 0) throw error;
    console.warn('Using bundled TOEIC question bank because Firestore could not be reached.', error);
  }

  const merged = new Map<string, Question>();
  bundled.forEach((item) => merged.set(item.id, item));
  remoteQuestions.forEach((item) => merged.set(item.id, item));

  return shuffleArray(Array.from(merged.values())).slice(0, options.count || 20);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================
// Study Session Management
// ============================================

export async function startStudySession(
  userId: string,
  exam: string,
  type: 'quiz' | 'vocabulary' | 'listening' | 'mission'
): Promise<string> {
  const sessionId = `${userId}_${exam}_${type}_${Date.now()}`;

  // Start anti-cheat tracking
  startAntiCheatTracking(sessionId);

  return sessionId;
}

export function cancelStudySession(sessionId: string | null | undefined): void {
  if (sessionId) cancelAntiCheatTracking(sessionId);
}

const MAX_SESSION_ITEMS = 200;

function emptyXP() {
  return { baseXP: 0, streakBonus: 0, perfectBonus: 0, totalXP: 0 };
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

function createInitialMissions(): MissionProgress[] {
  return generateDailyMissions().map((mission) => ({
    missionId: mission.id,
    type: mission.type,
    title: mission.title,
    target: mission.target,
    current: 0,
    completed: false,
    xpReward: mission.xpReward,
  }));
}

function createDailyProgress(userId: string, today: string, now: Timestamp): DailyProgress {
  return {
    id: `${userId}_${today}`,
    userId,
    date: today,
    questionsCompleted: 0,
    wordsLearned: 0,
    activeMinutes: 0,
    listeningSetsCompleted: 0,
    xpEarned: 0,
    accuracy: 0,
    missions: createInitialMissions(),
    streakMaintained: false,
    createdAt: now,
    updatedAt: now,
  };
}

function applyMissionProgress(
  missions: MissionProgress[],
  missionType: MissionType,
  progressAmount: number,
  now: Timestamp
): { missions: MissionProgress[]; completedRewards: number } {
  if (progressAmount <= 0) return { missions, completedRewards: 0 };

  let completedRewards = 0;
  const updatedMissions = missions.map((mission) => {
    if (mission.type !== missionType || mission.completed) return mission;

    const current = Math.min(mission.target, mission.current + progressAmount);
    const completed = current >= mission.target;
    if (completed) completedRewards += mission.xpReward;

    return {
      ...mission,
      current,
      completed,
      ...(completed ? { completedAt: now } : {}),
    };
  });

  return { missions: updatedMissions, completedRewards };
}

export function getSessionInputIssues(
  answers: QuestionAnswer[],
  totalQuestions: number,
  correctAnswers: number,
  sessionType: SessionType,
  totalSeconds: number,
  customMetrics?: { total: number; correct: number }
): SessionValidationIssue[] {
  if (totalQuestions <= 0 || totalQuestions > MAX_SESSION_ITEMS) return ['invalid-session-data'];
  if (correctAnswers < 0 || correctAnswers > totalQuestions) return ['invalid-session-data'];

  const answersAreWellFormed = answers.every((answer) =>
    answer.questionId &&
    Number.isInteger(answer.selectedAnswer) &&
    answer.selectedAnswer >= 0 &&
    typeof answer.isCorrect === 'boolean' &&
    Number.isFinite(answer.timeSpent) &&
    answer.timeSpent >= 0
  );
  if (!answersAreWellFormed) return ['invalid-session-data'];

  if (!customMetrics) {
    if (answers.length !== totalQuestions) return ['invalid-session-data'];
    const uniqueQuestionIds = new Set(answers.map((answer) => answer.questionId));
    if (uniqueQuestionIds.size !== answers.length) return ['invalid-session-data'];
  } else if (sessionType !== 'vocabulary' && customMetrics.total !== answers.length) {
    return ['invalid-session-data'];
  }

  const recordedAnswerSeconds = answers.reduce(
    (sum, answer) => sum + Math.min(answer.timeSpent, 60 * 60),
    0,
  );

  if (sessionType === 'quiz' || sessionType === 'listening') {
    const fastAnswers = answers.filter((answer) => answer.timeSpent < ANTI_CHEAT.minSingleAnswerSeconds).length;
    const fastAnswerRatio = answers.length > 0 ? fastAnswers / answers.length : 0;
    const recordedAverage = answers.length > 0 ? recordedAnswerSeconds / answers.length : 0;
    const hasImplausibleTiming =
      !validateAnswerTiming(totalQuestions, totalSeconds) &&
      recordedAverage < ANTI_CHEAT.minSecondsPerQuestion &&
      fastAnswerRatio > ANTI_CHEAT.maxFastAnswerRatio;
    if (hasImplausibleTiming) return ['implausibly-fast'];
  }

  if (sessionType === 'vocabulary') {
    const minimumReviewSeconds = Math.min(totalQuestions, 30);
    if (totalSeconds < minimumReviewSeconds && recordedAnswerSeconds < minimumReviewSeconds) {
      return ['implausibly-fast'];
    }
  }

  return [];
}

export function resolveSessionTiming(
  sessionId: string,
  answers: QuestionAnswer[],
  antiCheatData: Pick<AntiCheatData, 'activeSeconds' | 'totalSeconds' | 'trackingAvailable'>,
  nowMs = Date.now(),
) {
  const timestampStr = sessionId.split('_').at(-1) ?? '';
  const startTimestampMs = Number(timestampStr);
  const hasValidStartTimestamp =
    Number.isFinite(startTimestampMs) &&
    startTimestampMs > 0 &&
    startTimestampMs <= nowMs + 5000;
  const startedAtDate = hasValidStartTimestamp ? new Date(startTimestampMs) : new Date(nowMs);
  const wallClockSeconds = hasValidStartTimestamp
    ? Math.max(0, Math.round((nowMs - startTimestampMs) / 1000))
    : 0;
  const recordedAnswerSeconds = Math.round(
    answers.reduce(
      (sum, answer) => sum + (Number.isFinite(answer.timeSpent) ? Math.min(Math.max(0, answer.timeSpent), 60 * 60) : 0),
      0,
    ),
  );
  const totalSeconds = Math.max(antiCheatData.totalSeconds, wallClockSeconds, recordedAnswerSeconds);
  const activeSeconds = antiCheatData.trackingAvailable
    ? Math.min(totalSeconds, antiCheatData.activeSeconds)
    : Math.min(totalSeconds, recordedAnswerSeconds);

  return { activeSeconds, hasValidStartTimestamp, recordedAnswerSeconds, startedAtDate, totalSeconds };
}

function buildSessionResults(session: StudySession): SessionResults {
  return {
    totalQuestions: session.questionsAttempted,
    correctAnswers: session.questionsCorrect,
    accuracy: session.accuracy,
    xpEarned: session.xpEarned,
    streakBonus: session.streakBonus ?? 0,
    timeSpent: session.totalSeconds,
    isValid: session.isValid,
    validationIssues: session.validationIssues,
  };
}

export async function endStudySession(
  sessionId: string,
  userId: string,
  answers: QuestionAnswer[],
  currentStreak: number,
  customMetrics?: { total: number; correct: number }
): Promise<SessionResults> {
  const antiCheatData = stopAntiCheatTracking(sessionId);

  const totalQuestions = customMetrics
    ? clampInteger(customMetrics.total, 0, MAX_SESSION_ITEMS)
    : clampInteger(answers.length, 0, MAX_SESSION_ITEMS);
  const correctAnswers = customMetrics
    ? clampInteger(customMetrics.correct, 0, totalQuestions)
    : clampInteger(answers.filter((a) => a.isCorrect).length, 0, totalQuestions);

  if (totalQuestions === 0) {
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      accuracy: 0,
      xpEarned: 0,
      streakBonus: 0,
      timeSpent: antiCheatData.totalSeconds,
      isValid: false,
      validationIssues: ['invalid-session-data'],
    };
  }

  const accuracy = (correctAnswers / totalQuestions) * 100;
  const isPerfect = accuracy === 100 && totalQuestions >= 5 && !customMetrics;

  const parts = sessionId.split('_');
  const sessionType = (parts[parts.length - 2] || 'quiz') as SessionType;
  const exam = parts[parts.length - 3] || 'toeic';

  const timing = resolveSessionTiming(sessionId, answers, antiCheatData);
  const { activeSeconds, startedAtDate, totalSeconds } = timing;
  const startedAt = Timestamp.fromDate(startedAtDate);

  const inputIssues = getSessionInputIssues(
    answers,
    totalQuestions,
    correctAnswers,
    sessionType,
    totalSeconds,
    customMetrics
  );
  const validationIssues = Array.from(new Set([
    ...antiCheatData.validationIssues,
    ...inputIssues,
  ]));
  const isValid = validationIssues.length === 0;

  const sessionRef = doc(db, 'study_sessions', sessionId);
  const userRef = doc(db, 'users', userId);
  const today = getTodayDateString();
  const progressRef = doc(db, 'daily_progress', `${userId}_${today}`);

  const transactionResult = await runTransaction(db, async (transaction) => {
    const existingSessionSnap = await transaction.get(sessionRef);
    if (existingSessionSnap.exists()) {
      return {
        ...buildSessionResults(existingSessionSnap.data() as StudySession),
        alreadyProcessed: true,
      };
    }

    const now = Timestamp.now();
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error('User profile not found.');
    }

    const profile = userSnap.data() as UserProfile;
    const progressSnap = await transaction.get(progressRef);
    const existingProgress = progressSnap.exists()
      ? (progressSnap.data() as DailyProgress)
      : createDailyProgress(userId, today, now);

    let progressAfter: DailyProgress = {
      ...existingProgress,
      missions: [...(existingProgress.missions ?? createInitialMissions())],
      updatedAt: now,
    };

    const activeMinutes = Math.floor(activeSeconds / 60);
    const wrongAnswers = totalQuestions - correctAnswers;
    let xpCalc = emptyXP();
    let missionBonus = 0;
    let totalAwardedXP = 0;
    let shouldMaintainStreak = false;

    if (isValid) {
      const previousAccuracyWeight =
        (existingProgress.questionsCompleted || 0) +
        (existingProgress.listeningSetsCompleted || 0);
      const sessionAccuracyWeight = sessionType === 'vocabulary' ? 0 : totalQuestions;

      progressAfter = {
        ...progressAfter,
        questionsCompleted:
          progressAfter.questionsCompleted +
          (sessionType === 'quiz' || sessionType === 'mission' ? totalQuestions : 0),
        wordsLearned:
          progressAfter.wordsLearned +
          (sessionType === 'vocabulary' ? totalQuestions : 0),
        activeMinutes: progressAfter.activeMinutes + activeMinutes,
        listeningSetsCompleted:
          progressAfter.listeningSetsCompleted +
          (sessionType === 'listening' ? 1 : 0),
      };

      if (sessionAccuracyWeight > 0) {
        const weightedAccuracy =
          ((existingProgress.accuracy || 0) * previousAccuracyWeight +
            Math.round(accuracy) * sessionAccuracyWeight) /
          Math.max(1, previousAccuracyWeight + sessionAccuracyWeight);
        progressAfter.accuracy = Math.round(weightedAccuracy);
      }

      shouldMaintainStreak =
        !progressAfter.streakMaintained && hasMetStreakRequirements(progressAfter);

      xpCalc = calculateSessionXP(
        correctAnswers,
        wrongAnswers,
        profile.currentStreak ?? currentStreak,
        isPerfect,
        {
          includeStreakBonus: shouldMaintainStreak,
          includeWrongAnswerXP: sessionType !== 'vocabulary' && correctAnswers / totalQuestions >= 0.5,
        }
      );

      const missionUpdates: Array<[MissionType, number]> = [];
      if (sessionType === 'vocabulary') {
        missionUpdates.push(['words', totalQuestions]);
      } else if (sessionType === 'listening') {
        missionUpdates.push(['listening', 1]);
      } else {
        missionUpdates.push(['questions', totalQuestions]);
      }
      missionUpdates.push(['minutes', activeMinutes]);

      for (const [missionType, amount] of missionUpdates) {
        const missionResult = applyMissionProgress(progressAfter.missions, missionType, amount, now);
        progressAfter.missions = missionResult.missions;
        missionBonus += missionResult.completedRewards;
      }

      totalAwardedXP = xpCalc.totalXP + missionBonus;
      progressAfter.xpEarned += totalAwardedXP;

      if (shouldMaintainStreak) {
        progressAfter.streakMaintained = true;
      }
    }

    const sessionData: StudySession = {
      id: sessionId,
      userId,
      exam,
      type: sessionType,
      questionsAttempted: totalQuestions,
      questionsCorrect: correctAnswers,
      accuracy: Math.round(accuracy),
      xpEarned: totalAwardedXP,
      baseXP: xpCalc.baseXP,
      streakBonus: xpCalc.streakBonus,
      perfectBonus: xpCalc.perfectBonus,
      missionBonus,
      startedAt,
      endedAt: now,
      activeSeconds,
      totalSeconds,
      tabSwitches: antiCheatData.tabSwitches,
      idleIntervals: antiCheatData.idleIntervals,
      interactionCount: antiCheatData.interactionCount,
      trackingAvailable: antiCheatData.trackingAvailable,
      validationIssues,
      isValid,
      answers,
      createdAt: startedAt,
    };

    transaction.set(sessionRef, sessionData);

    if (isValid) {
      transaction.set(progressRef, progressAfter);

      const nextXP = Math.max(0, (profile.xp || 0) + totalAwardedXP);
      const userUpdates: Partial<UserProfile> & Record<string, unknown> = {
        xp: nextXP,
        level: calculateLevel(nextXP),
        totalStudyMinutes: (profile.totalStudyMinutes || 0) + activeMinutes,
        updatedAt: now,
      };

      if (sessionType === 'vocabulary') {
        userUpdates.vocabularyLearned = (profile.vocabularyLearned || 0) + totalQuestions;
      } else {
        userUpdates.totalQuestionsAnswered = (profile.totalQuestionsAnswered || 0) + totalQuestions;
        userUpdates.totalCorrectAnswers = (profile.totalCorrectAnswers || 0) + correctAnswers;
      }

      if (shouldMaintainStreak) {
        const lastStudy = profile.lastStudyDate || '';
        let newStreak = 1;
        if (lastStudy === today) {
          newStreak = profile.currentStreak || 1;
        } else if (lastStudy === getYesterdayDateString()) {
          newStreak = (profile.currentStreak || 0) + 1;
        }
        userUpdates.currentStreak = newStreak;
        userUpdates.longestStreak = Math.max(newStreak, profile.longestStreak || 0);
        userUpdates.lastStudyDate = today;
      }

      transaction.update(userRef, userUpdates);
    }

    return {
      ...buildSessionResults(sessionData),
      alreadyProcessed: false,
    };
  });

  if (transactionResult.isValid && !transactionResult.alreadyProcessed) {
    try {
      if (sessionType === 'vocabulary') {
        const vocabEntries = answers.map((a) => ({
          wordId: a.questionId,
          isCorrect: true,
          alreadyKnew: a.selectedAnswer === 1,
        }));
        await batchUpdateVocabProgress(userId, vocabEntries);
      } else if (sessionType !== 'listening') {
        const questionEntries = answers.map((a) => ({
          questionId: a.questionId,
          isCorrect: a.isCorrect,
        }));
        await batchUpdateQuestionProgress(userId, questionEntries);
      }
    } catch (progressErr) {
      console.error('Failed to update item progress:', progressErr);
    }
  }

  const { alreadyProcessed: _alreadyProcessed, ...publicResult } = transactionResult;
  return publicResult;
}

// ============================================
// Recent Sessions
// ============================================

export async function getRecentSessions(userId: string, count: number = 10): Promise<StudySession[]> {
  const sessionsRef = collection(db, 'study_sessions');
  const q = query(
    sessionsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(count * 3)
  );

  const snapshot = await getDocs(q);
  const sessions: StudySession[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.questionsAttempted && data.questionsAttempted > 0) {
      sessions.push({ id: doc.id, ...data } as StudySession);
    }
  });
  return sessions.slice(0, count);
}

// ============================================
// Mock/Seed Questions (for development)
// ============================================

export function getMockQuestions(count: number = 10): Question[] {
  const mockQuestions: Question[] = [
    {
      id: 'q1',
      exam: 'toeic',
      part: 5,
      type: 'mcq',
      topic: 'business',
      difficulty: 700,
      question: 'The company\'s annual report _____ that profits had increased by 15% over the previous year.',
      choices: ['indicated', 'indicating', 'indicates', 'indication'],
      correctAnswer: 0,
      explanation: '"indicated" is the correct past tense verb form. The sentence describes a past event (annual report), so past tense is needed. | "indicated" là dạng động từ quá khứ đơn chính xác. Câu mô tả một sự kiện trong quá khứ (báo cáo thường niên), vì vậy cần dùng thì quá khứ.',
      tags: ['grammar', 'verb-tense'],
      isActive: true,
      timesAnswered: 0,
      timesCorrect: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'system',
    },
    {
      id: 'q2',
      exam: 'toeic',
      part: 5,
      type: 'mcq',
      topic: 'email',
      difficulty: 700,
      question: 'Please find _____ the documents you requested during our meeting yesterday.',
      choices: ['attach', 'attached', 'attaching', 'attachment'],
      correctAnswer: 1,
      explanation: '"attached" is used as an adjective/past participle in the phrase "find attached." This is a common business email expression. | "attached" được sử dụng như một tính từ/quá khứ phân từ trong cụm từ "find attached" (tìm thấy đính kèm). Đây là một cách diễn đạt email công việc phổ biến.',
      tags: ['grammar', 'business-email'],
      isActive: true,
      timesAnswered: 0,
      timesCorrect: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'system',
    },
    {
      id: 'q3',
      exam: 'toeic',
      part: 5,
      type: 'mcq',
      topic: 'office',
      difficulty: 700,
      question: 'All employees are required to attend the safety training _____ it is mandatory.',
      choices: ['because', 'although', 'despite', 'unless'],
      correctAnswer: 0,
      explanation: '"because" introduces a reason clause. The sentence explains WHY employees must attend — because it is mandatory. | "because" mở đầu cho mệnh đề chỉ nguyên nhân. Câu giải thích TẠI SAO nhân viên phải tham gia — vì nó là bắt buộc.',
      tags: ['grammar', 'conjunctions'],
      isActive: true,
      timesAnswered: 0,
      timesCorrect: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'system',
    },
    {
      id: 'q4',
      exam: 'toeic',
      part: 5,
      type: 'mcq',
      topic: 'finance',
      difficulty: 750,
      question: 'The budget proposal was _____ reviewed by the finance committee before being approved.',
      choices: ['thorough', 'thoroughly', 'thoroughness', 'more thorough'],
      correctAnswer: 1,
      explanation: '"thoroughly" is an adverb modifying the verb "reviewed." We need an adverb, not an adjective, to describe how the review was done. | "thoroughly" là trạng từ bổ nghĩa cho động từ "reviewed". Chúng ta cần một trạng từ chứ không phải tính từ để mô tả việc đánh giá được thực hiện như thế nào.',
      tags: ['grammar', 'adverbs'],
      isActive: true,
      timesAnswered: 0,
      timesCorrect: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'system',
    },
    {
      id: 'q5',
      exam: 'toeic',
      part: 5,
      type: 'mcq',
      topic: 'marketing',
      difficulty: 700,
      question: 'The marketing team decided to launch the campaign _____ the holiday season.',
      choices: ['while', 'during', 'within', 'between'],
      correctAnswer: 1,
      explanation: '"during" is a preposition used before a noun phrase to indicate a time period. "During the holiday season" correctly indicates the time of the campaign launch. | "during" là một giới từ dùng trước một cụm danh từ để chỉ một khoảng thời gian. "During the holiday season" chỉ thời điểm bắt đầu chiến dịch một cách chính xác.',
      tags: ['grammar', 'prepositions'],
      isActive: true,
      timesAnswered: 0,
      timesCorrect: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'system',
    },
    {
      id: 'q6',
      exam: 'toeic',
      part: 5,
      type: 'mcq',
      topic: 'meetings',
      difficulty: 700,
      question: 'The meeting has been _____ to next Monday due to scheduling conflicts.',
      choices: ['postponed', 'postponing', 'postpone', 'postponement'],
      correctAnswer: 0,
      explanation: '"postponed" is the past participle used in the passive voice construction "has been postponed." The meeting is being acted upon. | "postponed" là quá khứ phân từ được sử dụng trong cấu trúc bị động "has been postponed" (đã bị hoãn lại). Cuộc họp là đối tượng chịu tác động.',
      tags: ['grammar', 'passive-voice'],
      isActive: true,
      timesAnswered: 0,
      timesCorrect: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'system',
    },
    {
      id: 'q7',
      exam: 'toeic',
      part: 5,
      type: 'mcq',
      topic: 'hotel',
      difficulty: 650,
      question: 'Guests _____ check out before 11 AM or they will be charged for an additional night.',
      choices: ['must', 'might', 'could', 'would'],
      correctAnswer: 0,
      explanation: '"must" expresses obligation/requirement. The hotel requires guests to check out before 11 AM. | "must" diễn tả nghĩa vụ/yêu cầu. Khách sạn yêu cầu khách phải trả phòng trước 11 giờ sáng.',
      tags: ['grammar', 'modal-verbs'],
      isActive: true,
      timesAnswered: 0,
      timesCorrect: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'system',
    },
    {
      id: 'q8',
      exam: 'toeic',
      part: 5,
      type: 'mcq',
      topic: 'shipping',
      difficulty: 750,
      question: 'The shipment will arrive _____ three to five business days after the order is placed.',
      choices: ['among', 'within', 'beside', 'toward'],
      correctAnswer: 1,
      explanation: '"within" means inside a time frame. "Within three to five business days" means the delivery will happen before or at that time. | "within" nghĩa là trong một khoảng thời gian. "Within three to five business days" có nghĩa là việc giao hàng sẽ xảy ra trước hoặc vào thời điểm đó.',
      tags: ['grammar', 'prepositions'],
      isActive: true,
      timesAnswered: 0,
      timesCorrect: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'system',
    },
    {
      id: 'q9',
      exam: 'toeic',
      part: 5,
      type: 'mcq',
      topic: 'airport',
      difficulty: 700,
      question: 'Passengers _____ to arrive at the airport at least two hours before their international flight.',
      choices: ['advise', 'are advised', 'advising', 'have advising'],
      correctAnswer: 1,
      explanation: '"are advised" is the correct passive voice form. Passengers receive the advice (they don\'t give it), so passive voice is appropriate. | "are advised" là dạng câu bị động chính xác. Hành khách nhận được lời khuyên (họ không tự khuyên), vì vậy thể bị động là phù hợp.',
      tags: ['grammar', 'passive-voice'],
      isActive: true,
      timesAnswered: 0,
      timesCorrect: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'system',
    },
    {
      id: 'q10',
      exam: 'toeic',
      part: 5,
      type: 'mcq',
      topic: 'business',
      difficulty: 800,
      question: 'Had the contract been signed earlier, the project _____ completed on schedule.',
      choices: ['will have been', 'would have been', 'had been', 'has been'],
      correctAnswer: 1,
      explanation: 'This is a third conditional (past unreal). "Had + past participle" in the if-clause requires "would have + past participle" in the main clause. | Đây là câu điều kiện loại 3 (không có thật trong quá khứ). "Had + quá khứ phân từ" trong mệnh đề if yêu cầu "would have + quá khứ phân từ" ở mệnh đề chính.',
      tags: ['grammar', 'conditionals'],
      isActive: true,
      timesAnswered: 0,
      timesCorrect: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'system',
    },
  ];

  return shuffleArray(mockQuestions).slice(0, count);
}
