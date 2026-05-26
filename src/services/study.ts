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
  setDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { Question, QuestionAnswer } from '@/types/question';
import type { StudySession, SessionResults } from '@/types/study';
import { startAntiCheatTracking, stopAntiCheatTracking, validateAnswerTiming } from '@/services/anticheat';
import { calculateSessionXP, awardXP, updateDailyProgress, updateMissionProgress, checkAndUpdateStreak } from '@/services/gamification';

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
  const snapshot = await getDocs(q);

  const questions: Question[] = [];
  snapshot.forEach((doc) => {
    questions.push({ id: doc.id, ...doc.data() } as Question);
  });

  // Shuffle questions
  return shuffleArray(questions);
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
  const sessionId = `${userId}_${Date.now()}`;
  const sessionRef = doc(db, 'study_sessions', sessionId);

  const session: Omit<StudySession, 'startedAt' | 'createdAt'> & {
    startedAt: ReturnType<typeof serverTimestamp>;
    createdAt: ReturnType<typeof serverTimestamp>;
  } = {
    id: sessionId,
    userId,
    exam,
    type,
    questionsAttempted: 0,
    questionsCorrect: 0,
    accuracy: 0,
    xpEarned: 0,
    startedAt: serverTimestamp(),
    endedAt: null,
    activeSeconds: 0,
    totalSeconds: 0,
    tabSwitches: 0,
    idleIntervals: 0,
    interactionCount: 0,
    isValid: true,
    answers: [],
    createdAt: serverTimestamp(),
  };

  await setDoc(sessionRef, session);

  // Start anti-cheat tracking
  startAntiCheatTracking();

  return sessionId;
}

export async function endStudySession(
  sessionId: string,
  userId: string,
  answers: QuestionAnswer[],
  currentStreak: number,
  customMetrics?: { total: number; correct: number }
): Promise<SessionResults> {
  // Stop anti-cheat tracking
  const antiCheatData = stopAntiCheatTracking();

  const correctAnswers = customMetrics ? customMetrics.correct : answers.filter((a) => a.isCorrect).length;
  const totalQuestions = customMetrics ? customMetrics.total : answers.length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const isPerfect = accuracy === 100 && totalQuestions >= 5 && !customMetrics;

  // Retrieve session type
  const sessionRef = doc(db, 'study_sessions', sessionId);
  const sessionSnap = await getDoc(sessionRef);
  const sessionType = sessionSnap.exists() ? (sessionSnap.data().type || 'quiz') : 'quiz';

  // Validate answer timing
  const isVocabOrListening = sessionType === 'vocabulary' || sessionType === 'listening';
  const timingValid = isVocabOrListening ? true : validateAnswerTiming(totalQuestions, antiCheatData.totalSeconds);
  const isValid = antiCheatData.isValid && timingValid;

  // Calculate XP (only award if valid session)
  const xpCalc = isValid
    ? calculateSessionXP(correctAnswers, totalQuestions - correctAnswers, currentStreak, isPerfect)
    : { baseXP: 0, streakBonus: 0, perfectBonus: 0, totalXP: 0 };

  // Update session in Firestore
  await updateDoc(sessionRef, {
    questionsAttempted: totalQuestions,
    questionsCorrect: correctAnswers,
    accuracy: Math.round(accuracy),
    xpEarned: xpCalc.totalXP,
    endedAt: serverTimestamp(),
    activeSeconds: antiCheatData.activeSeconds,
    totalSeconds: antiCheatData.totalSeconds,
    tabSwitches: antiCheatData.tabSwitches,
    idleIntervals: antiCheatData.idleIntervals,
    interactionCount: antiCheatData.interactionCount,
    isValid,
    answers,
  });

  // Award XP and update progress
  if (isValid && xpCalc.totalXP > 0) {
    await awardXP(userId, xpCalc.totalXP);

    // Update daily progress
    const progressUpdates: any = {
      xpEarned: xpCalc.totalXP,
      activeMinutes: Math.round(antiCheatData.activeSeconds / 60),
      accuracy: Math.round(accuracy),
    };
    if (sessionType === 'vocabulary') {
      progressUpdates.wordsLearned = totalQuestions;
    } else if (sessionType === 'listening') {
      progressUpdates.listeningSetsCompleted = 1;
    } else {
      progressUpdates.questionsCompleted = totalQuestions;
    }
    await updateDailyProgress(userId, progressUpdates);

    // Update mission progress
    if (sessionType === 'vocabulary') {
      await updateMissionProgress(userId, 'words', totalQuestions);
    } else if (sessionType === 'listening') {
      await updateMissionProgress(userId, 'listening', 1);
    } else {
      await updateMissionProgress(userId, 'questions', totalQuestions);
    }
    await updateMissionProgress(userId, 'minutes', Math.round(antiCheatData.activeSeconds / 60));

    // Check streak
    await checkAndUpdateStreak(userId);
  }

  // Update user stats
  if (isValid) {
    const userRef = doc(db, 'users', userId);
    const userUpdates: any = {
      totalStudyMinutes: increment(Math.round(antiCheatData.activeSeconds / 60)),
      updatedAt: serverTimestamp(),
    };
    if (sessionType === 'vocabulary') {
      userUpdates.vocabularyLearned = increment(totalQuestions);
    } else {
      userUpdates.totalQuestionsAnswered = increment(totalQuestions);
      userUpdates.totalCorrectAnswers = increment(correctAnswers);
    }
    await updateDoc(userRef, userUpdates);
  }

  return {
    totalQuestions,
    correctAnswers,
    accuracy: Math.round(accuracy),
    xpEarned: xpCalc.totalXP,
    streakBonus: xpCalc.streakBonus,
    timeSpent: antiCheatData.totalSeconds,
    isValid,
  };
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
    limit(count)
  );

  const snapshot = await getDocs(q);
  const sessions: StudySession[] = [];
  snapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() } as StudySession);
  });
  return sessions;
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
