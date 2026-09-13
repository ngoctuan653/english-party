import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import {
  cancelStudySession,
  endStudySession,
  fetchQuestions,
  getRecentSessions,
  startStudySession,
} from '@/services/study';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import type { StudySession, SessionResults, SessionValidationIssue } from '@/types/study';
import type { AnswerConfidence, CefrSkill, Question, QuestionAnswer } from '@/types/question';
import { formatTimestamp, formatDuration, getAccuracyColor } from '@/utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import * as Icons from 'lucide-react';
import {
  buildMistakeReviewDeck,
  generateSmartQuizSession,
  getUserQuestionProgress,
  isReviewDue,
} from '@/services/progress';
import SessionReviewModal from '@/components/study/SessionReviewModal';
import ToeicReadingSection from '@/components/study/ToeicReadingSection';
import ReadingPassage from '@/components/study/ReadingPassage';
import {
  LearningIntro,
  LearningModuleNav,
  LearningSectionHeading,
  WorkspaceSearch,
} from '@/components/study/LearningWorkspace';
import { getBundledQuestionCount, getBundledTopics } from '@/data/questionBank';
import type { CefrLevel } from '@/types/cefr';
import { CEFR_LEVELS, CEFR_LEVEL_META, getCefrDifficulty, getCurrentCefrLevel, isCefrLevel } from '@/types/cefr';

type CefrStudySkill = 'grammar' | 'use-of-english' | 'reading';

interface QuestionAttempt {
  selectedChoice: number | null;
  isSubmitted: boolean;
  isCorrect?: boolean;
  timeSpent: number;
  confidence?: AnswerConfidence | null;
}

const skillMeta: Record<CefrSkill, { id: CefrSkill; title: string; shortTitle: string; viTitle: string; description: string; partFallback: number }> = {
  grammar: {
    id: 'grammar',
    title: 'Grammar Foundations',
    shortTitle: 'Grammar',
    viTitle: 'Ngữ pháp B2',
    description: 'Build accurate sentences with B2 grammar, inversion, conditionals & passive structures.',
    partFallback: 5,
  },
  'use-of-english': {
    id: 'use-of-english',
    title: 'Use of English & Collocations',
    shortTitle: 'Use of English',
    viTitle: 'Cụm từ & Điền khuyết',
    description: 'Master authentic collocations, phrasal verbs, idioms and connected text completion.',
    partFallback: 6,
  },
  reading: {
    id: 'reading',
    title: 'Reading Comprehension',
    shortTitle: 'Reading',
    viTitle: 'Đọc hiểu B2',
    description: 'Read level-appropriate texts and answer detail, purpose, and inference questions.',
    partFallback: 7,
  },
  listening: {
    id: 'listening',
    title: 'Listening Studio',
    shortTitle: 'Listening',
    viTitle: 'Luyện nghe B2',
    description: 'Listen to dialogues and talks with authentic pronunciation and question sets.',
    partFallback: 3,
  },
  speaking: {
    id: 'speaking',
    title: 'Speaking Studio',
    shortTitle: 'Speaking',
    viTitle: 'Luyện nói AI',
    description: 'Practice spoken English with real-time AI roleplay and exam simulations.',
    partFallback: 1,
  },
};

const topicLabels: Record<string, string> = {
  'hobbies-leisure': 'Hobbies & Leisure · Sở thích & Thể thao',
  'travel-transport': 'Travel & Getting Around · Du lịch & Di chuyển',
  'education-learning': 'Education & Skills · Giáo dục & Học tập',
  'work-business': 'Work & Business · Công việc & Kinh doanh',
  'health-lifestyle': 'Health & Lifestyle · Sức khỏe & Lối sống',
  'people-relationships': 'People & Relationships · Con người & Mối quan hệ',
  'environment-nature': 'Environment & Climate · Môi trường & Thiên nhiên',
  'technology-innovation': 'Technology & Digital · Công nghệ & Kỷ nguyên số',
  'media-communication': 'Media & Communication · Truyền thông & Báo chí',
  'food-nutrition': 'Food, Diet & Nutrition · Ẩm thực & Dinh dưỡng',
  'money-finance': 'Money, Banking & Economy · Tiền tệ & Tài chính',
  'science-discovery': 'Science & Discovery · Khoa học & Khám phá',
  'law-justice': 'Law, Crime & Justice · Pháp luật & Công lý',
  'housing-urban-life': 'Housing & City Life · Nhà ở & Đô thị hóa',
  // TOEIC Part 5 & 6 Topics
  'toeic-grammar': 'TOEIC Grammar · Ngữ pháp trọng điểm TOEIC',
  'toeic-vocabulary': 'TOEIC Vocabulary · Từ vựng cốt lõi TOEIC',
  'toeic-word-form': 'TOEIC Word Forms · Cấu trúc & Biến thể từ loại',
  'toeic-prepositions-conjunctions': 'Prepositions & Conjunctions · Giới từ & Liên từ',
  'toeic-text-completion': 'Text Completion · Điền từ vào đoạn văn',
  'toeic-business-notices': 'Business Notices · Thông báo & Bản ghi nhớ',
  'toeic-business-letters': 'Business Letters & Emails · Thư tín thương mại & Email',
  // TOEIC Part 7 Topics
  'toeic-single-passage': 'Single Passages · Đọc hiểu đoạn văn đơn',
  'toeic-multi-passage': 'Double & Triple Passages · Đọc hiểu đoạn kép & đoạn ba',
  'toeic-emails-memos': 'Emails & Memorandums · Thư điện tử & Thông điệp nội bộ',
  'toeic-advertisements': 'Advertisements & Marketing · Quảng cáo & Tiếp thị',
  'toeic-articles-reports': 'Articles & Reports · Bài báo kinh tế & Báo cáo',
  'toeic-forms-invoices': 'Forms, Invoices & Schedules · Biểu mẫu & Hóa đơn',
  'toeic-chat-discussions': 'Online Chat & Discussions · Tin nhắn trực tuyến & Đàm thoại',
};

const formatTopic = (topic?: string) => {
  if (!topic) return '';
  return topicLabels[topic] ?? topic.replaceAll('-', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
};

const validationIssueMessages: Record<SessionValidationIssue, string> = {
  'invalid-session-data': 'Some answer data was incomplete or inconsistent.',
  'implausibly-fast': 'Most answers were submitted in an implausibly short time.',
  'excessive-tab-switching': 'The study tab was left too many times during this session.',
  'extended-inactivity': 'The session contained multiple long periods without learning activity.',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const parseExplanation = (explanation?: string) => {
  if (!explanation) return { evidence: '', sentenceTranslation: '', viExpl: '' };

  // Strip any accidental Chinese characters
  const cleanExplanation = explanation.replace(/[\u4e00-\u9fa5]/g, '').trim();

  const parts = cleanExplanation.split('|').map((s) => s.trim());
  let evidence = '';
  let sentenceTranslation = '';
  let viExpl = '';

  const evidencePart = parts.find((p) => p.toLowerCase().startsWith('dẫn chứng:'));
  const translationPart = parts.find((p) => p.toLowerCase().startsWith('dịch nghĩa:'));
  const explanationPart = parts.find((p) => p.toLowerCase().startsWith('giải thích:'));

  if (evidencePart) {
    evidence = evidencePart.replace(/dẫn chứng:\s*/i, '').trim();
  }
  if (translationPart) {
    sentenceTranslation = translationPart.replace(/dịch nghĩa:\s*/i, '').trim();
  }
  if (explanationPart) {
    viExpl = explanationPart.replace(/giải thích:\s*/i, '').trim();
  }

  if (!sentenceTranslation && !viExpl && !evidence) {
    if (parts.length > 1) {
      viExpl = parts.slice(1).join(' | ');
    } else {
      viExpl = parts[0];
    }
  }

  return { evidence, sentenceTranslation, viExpl };
};

export default function StudyPage() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isToeicRoute = location.pathname === '/study/toeic' || searchParams.get('tab') === 'toeic';

  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSkill, setActiveSkill] = useState<CefrStudySkill>('grammar');
  const [activeLevel, setActiveLevel] = useState<CefrLevel>(() => getCurrentCefrLevel(profile));
  const [practiceTitle, setPracticeTitle] = useState('CEFR smart practice');
  const [sessionSize, setSessionSize] = useState<5 | 10 | 20>(10);
  const [queueStats, setQueueStats] = useState({ due: 0, weak: 0, newCount: 0 });

  // TOEIC controlled parameters
  const [toeicTest, setToeicTest] = useState<number>(() => {
    const p = Number(searchParams.get('test'));
    return p >= 1 && p <= 10 ? p : 1;
  });
  const [toeicTab, setToeicTab] = useState<'tests' | 'topics'>(() => {
    return searchParams.get('mode') === 'topics' ? 'topics' : 'tests';
  });

  // Active quiz session states
  const [quizActive, setQuizActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswersMap, setUserAnswersMap] = useState<Record<string, QuestionAttempt>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Modals for test experience
  const [showExitModal, setShowExitModal] = useState(false);
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  // Session duration timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(0);
  const activeSessionIdRef = useRef<string | null>(null);
  const actionBtnRef = useRef<HTMLDivElement | null>(null);
  const finishInProgressRef = useRef<boolean>(false);
  const [selectedReviewSession, setSelectedReviewSession] = useState<StudySession | null>(null);
  const [lastCompletedSession, setLastCompletedSession] = useState<StudySession | null>(null);

  const { setStudySessionActive } = useUIStore();

  useEffect(() => {
    activeSessionIdRef.current = sessionId;
  }, [sessionId]);

  // Keep UI store in sync
  useEffect(() => {
    setStudySessionActive(quizActive);
    return () => {
      setStudySessionActive(false);
    };
  }, [quizActive, setStudySessionActive]);

  // Auto-scroll action button into view when explanation expands
  const currentQuestion = questions[currentIndex];
  const currentAttempt = currentQuestion ? userAnswersMap[currentQuestion.id] : undefined;
  const isCurrentAnswerSubmitted = !!currentAttempt?.isSubmitted;

  useEffect(() => {
    if (isCurrentAnswerSubmitted && actionBtnRef.current) {
      setTimeout(() => {
        actionBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  }, [isCurrentAnswerSubmitted]);

  // Cancel on unmount
  useEffect(() => () => cancelStudySession(activeSessionIdRef.current), []);

  // Intercept browser back button cleanly without looping
  useEffect(() => {
    if (!quizActive || results) return;

    window.history.pushState({ quizActive: true }, '');

    const handlePopState = () => {
      setShowExitModal(true);
      window.history.pushState({ quizActive: true }, '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [quizActive, results]);

  // Prevent page refresh / tab close during active quiz
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (quizActive && !results) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [quizActive, results]);

  useEffect(() => {
    async function loadSessions() {
      if (!profile?.uid) return;
      try {
        setLoading(true);
        const data = await getRecentSessions(profile.uid, 5);
        setSessions(data);
      } catch (err) {
        console.error('Failed to load recent sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, [profile?.uid, quizActive]);

  // URL search params sync
  useEffect(() => {
    const level = searchParams.get('level');
    const skill = searchParams.get('skill');
    const test = Number(searchParams.get('test'));
    const mode = searchParams.get('mode');

    if (isCefrLevel(level)) setActiveLevel(level);
    if (skill === 'grammar' || skill === 'use-of-english' || skill === 'reading') {
      setActiveSkill(skill as CefrStudySkill);
    }
    if (test >= 1 && test <= 10) setToeicTest(test);
    if (mode === 'tests' || mode === 'topics') setToeicTab(mode);
  }, [searchParams]);

  const handleSelectLevel = (level: CefrLevel) => {
    setActiveLevel(level);
    const next = new URLSearchParams(searchParams);
    next.set('level', level);
    setSearchParams(next, { replace: true });
  };

  const handleSelectSkill = (skill: CefrStudySkill) => {
    setActiveSkill(skill);
    const next = new URLSearchParams(searchParams);
    next.set('skill', skill);
    setSearchParams(next, { replace: true });
  };

  const handleToeicTestChange = (t: number) => {
    setToeicTest(t);
    const next = new URLSearchParams(searchParams);
    next.set('test', String(t));
    setSearchParams(next, { replace: true });
  };

  const handleToeicTabChange = (mode: 'tests' | 'topics') => {
    setToeicTab(mode);
    const next = new URLSearchParams(searchParams);
    next.set('mode', mode);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (!profile?.uid || quizActive) return;
    let cancelled = false;

    async function loadQueueStats() {
      try {
        const [pool, progressMap] = await Promise.all([
          fetchQuestions({ exam: 'cefr', cefrLevel: activeLevel, count: 1000 }),
          getUserQuestionProgress(profile!.uid),
        ]);
        if (cancelled) return;
        const activePool = pool.filter((question) => question.skill === activeSkill || (!question.skill && question.part === skillMeta[activeSkill].partFallback));
        let due = 0;
        let weak = 0;
        let newCount = 0;
        for (const question of activePool) {
          const progress = progressMap.get(question.id);
          if (!progress) newCount += 1;
          else {
            if (isReviewDue(progress)) due += 1;
          }
        }
        weak = pool.filter((question) => {
          const progress = progressMap.get(question.id);
          return progress && progress.wrongCount > 0 && (progress.wrongCount > progress.correctCount || progress.mastery < 40);
        }).length;
        setQueueStats({ due, weak, newCount });
      } catch (error) {
        console.warn('Could not load practice queue summary.', error);
      }
    }

    void loadQueueStats();
    return () => {
      cancelled = true;
    };
  }, [activeLevel, activeSkill, profile?.uid, quizActive]);

  // Catch retake questions from router state
  useEffect(() => {
    if (!profile?.uid) return;
    if (location.state?.practiceQuestions) {
      const customQ = location.state.practiceQuestions as Question[];
      navigate(location.pathname, { replace: true });
      handleStartQuiz(customQ);
    } else if (location.state?.practiceMode === 'mistakes') {
      navigate(location.pathname, { replace: true });
      handleStartMistakeReview();
    }
  }, [location.state, navigate, profile?.uid]);

  // Timer interval
  useEffect(() => {
    if (quizActive && !results) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizActive, results]);

  const handleStartQuiz = async (
    customQuestions?: Question[],
    filters: { skill?: CefrStudySkill; topic?: string; count?: number; title?: string } = {},
  ) => {
    if (!profile?.uid) return;
    try {
      setLoadingQuestions(true);
      let list: Question[] = [];

      if (customQuestions && customQuestions.length > 0) {
        list = customQuestions;
        setPracticeTitle(filters.title ?? 'Review practice');
      } else {
        const targetSkill = filters.skill ?? activeSkill;
        const allQuestions = await fetchQuestions({
          exam: 'cefr',
          cefrLevel: activeLevel,
          skill: targetSkill,
          topic: filters.topic,
          count: 250,
        });

        if (allQuestions.length === 0) {
          toast.error('No practice questions available for this level yet.');
          setLoadingQuestions(false);
          return;
        }

        list = await generateSmartQuizSession(profile.uid, allQuestions, filters.count ?? sessionSize, {
          targetDifficulty: getCefrDifficulty(activeLevel),
        });
        setPracticeTitle(
          filters.topic
            ? `${activeLevel} ${skillMeta[targetSkill].shortTitle} · ${formatTopic(filters.topic)}`
            : `${activeLevel} ${skillMeta[targetSkill].shortTitle} practice`,
        );
      }

      const isToeicSession =
        (customQuestions && customQuestions.length > 0 && (customQuestions[0]?.exam === 'toeic-2026' || customQuestions[0]?.tags?.includes('toeic-2026'))) ||
        isToeicRoute;
      const examType = isToeicSession ? 'toeic-2026' : 'cefr';
      const activeSessionId = await startStudySession(profile.uid, examType, 'quiz');
      setSessionId(activeSessionId);
      setQuestions(list);
      setCurrentIndex(0);
      setUserAnswersMap({});
      setResults(null);
      setSecondsElapsed(0);
      questionStartTimeRef.current = Date.now();
      setQuizActive(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to start quiz session.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelectChoice = (choiceIdx: number) => {
    if (!currentQuestion) return;
    const attempt = userAnswersMap[currentQuestion.id];
    if (attempt?.isSubmitted) return;

    setUserAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || { isSubmitted: false, timeSpent: 0, confidence: null }),
        selectedChoice: choiceIdx,
      },
    }));
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    const attempt = userAnswersMap[currentQuestion.id];
    if (!attempt || attempt.selectedChoice === null || attempt.isSubmitted) return;

    const isCorrect = attempt.selectedChoice === currentQuestion.correctAnswer;
    const elapsed = (Date.now() - questionStartTimeRef.current) / 1000;

    setUserAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedChoice: attempt.selectedChoice,
        isSubmitted: true,
        isCorrect,
        timeSpent: (prev[currentQuestion.id]?.timeSpent || 0) + elapsed,
        confidence: null,
      },
    }));
  };

  const handleConfidence = (confidence: AnswerConfidence) => {
    if (!currentQuestion) return;
    setUserAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || { selectedChoice: null, isSubmitted: true, timeSpent: 0 }),
        confidence,
      },
    }));
  };

  const handleNavigateQuestion = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    // Record time spent on current question before leaving
    if (currentQuestion && questionStartTimeRef.current > 0) {
      const elapsed = (Date.now() - questionStartTimeRef.current) / 1000;
      setUserAnswersMap((prev) => {
        const existing = prev[currentQuestion.id];
        if (!existing) return prev;
        return {
          ...prev,
          [currentQuestion.id]: {
            ...existing,
            timeSpent: (existing.timeSpent || 0) + elapsed,
          },
        };
      });
    }

    setCurrentIndex(targetIndex);
    questionStartTimeRef.current = Date.now();
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      handleNavigateQuestion(currentIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      handleNavigateQuestion(currentIndex + 1);
    } else {
      const answeredCount = questions.filter(
        (q) => userAnswersMap[q.id]?.selectedChoice !== null && userAnswersMap[q.id]?.selectedChoice !== undefined
      ).length;
      if (answeredCount < questions.length) {
        setShowFinishConfirmModal(true);
      } else {
        handleFinishQuiz();
      }
    }
  };

  const handleFinishQuiz = async () => {
    if (!sessionId || !profile?.uid || finishInProgressRef.current) return;
    finishInProgressRef.current = true;
    setShowFinishConfirmModal(false);

    const finalAnswers: QuestionAnswer[] = questions
      .map((q) => {
        const att = userAnswersMap[q.id];
        if (!att || att.selectedChoice === null) return null;
        const answerItem: QuestionAnswer = {
          questionId: q.id,
          selectedAnswer: att.selectedChoice,
          isCorrect: att.selectedChoice === q.correctAnswer,
          timeSpent: Math.max(1, Math.round(att.timeSpent || 3)),
        };
        if (att.confidence) {
          answerItem.confidence = att.confidence;
        }
        return answerItem;
      })
      .filter(Boolean) as QuestionAnswer[];

    try {
      setLoadingQuestions(true);
      const sessionResults = await endStudySession(
        sessionId,
        profile.uid,
        finalAnswers,
        profile.currentStreak
      );
      setResults(sessionResults);

      const isToeic =
        isToeicRoute ||
        (questions.length > 0 && (questions[0]?.exam === 'toeic-2026' || questions[0]?.tags?.includes('toeic-2026')));
      const completedSessionObj: StudySession = {
        id: sessionId,
        userId: profile.uid,
        exam: isToeic ? 'toeic-2026' : 'cefr',
        type: 'quiz',
        questionsAttempted: sessionResults.totalQuestions,
        questionsCorrect: sessionResults.correctAnswers,
        accuracy: sessionResults.accuracy,
        xpEarned: sessionResults.xpEarned,
        baseXP: Math.max(0, sessionResults.xpEarned - (sessionResults.streakBonus || 0)),
        streakBonus: sessionResults.streakBonus || 0,
        perfectBonus: 0,
        missionBonus: 0,
        startedAt: Timestamp.fromMillis(Date.now() - secondsElapsed * 1000),
        endedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        activeSeconds: sessionResults.timeSpent,
        totalSeconds: sessionResults.timeSpent,
        tabSwitches: 0,
        idleIntervals: 0,
        interactionCount: finalAnswers.length,
        trackingAvailable: true,
        validationIssues: sessionResults.validationIssues || [],
        isValid: sessionResults.isValid,
        answers: finalAnswers,
      };
      setLastCompletedSession(completedSessionObj);

      // Immediately sync XP and stats to AuthStore for real-time header reflection
      if (sessionResults.xpEarned > 0) {
        const cur = useAuthStore.getState().profile;
        if (cur) {
          useAuthStore.getState().setProfile({
            ...cur,
            xp: (cur.xp || 0) + sessionResults.xpEarned,
            totalQuestionsAnswered: (cur.totalQuestionsAnswered || 0) + sessionResults.totalQuestions,
            totalCorrectAnswers: (cur.totalCorrectAnswers || 0) + sessionResults.correctAnswers,
          });
        }
      }

      // Refresh recent sessions list
      try {
        const updated = await getRecentSessions(profile.uid, 5);
        setSessions(updated);
      } catch (e) {
        console.warn('Could not reload recent sessions:', e);
      }

      toast.success(`Bài thi đã hoàn thành! +${sessionResults.xpEarned} XP 🎉`);
    } catch (err) {
      console.error('Quiz submission error:', err);
      const total = questions.length;
      const correct = finalAnswers.filter((a) => a.isCorrect).length;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      const fallbackResults: SessionResults = {
        totalQuestions: total,
        correctAnswers: correct,
        accuracy,
        xpEarned: correct * 10,
        streakBonus: 0,
        timeSpent: secondsElapsed,
        isValid: true,
      };
      setResults(fallbackResults);

      const isToeic =
        isToeicRoute ||
        (questions.length > 0 && (questions[0]?.exam === 'toeic-2026' || questions[0]?.tags?.includes('toeic-2026')));
      const completedSessionObj: StudySession = {
        id: sessionId,
        userId: profile.uid,
        exam: isToeic ? 'toeic-2026' : 'cefr',
        type: 'quiz',
        questionsAttempted: total,
        questionsCorrect: correct,
        accuracy,
        xpEarned: fallbackResults.xpEarned,
        baseXP: fallbackResults.xpEarned,
        streakBonus: 0,
        perfectBonus: 0,
        missionBonus: 0,
        startedAt: Timestamp.fromMillis(Date.now() - secondsElapsed * 1000),
        endedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        activeSeconds: secondsElapsed,
        totalSeconds: secondsElapsed,
        tabSwitches: 0,
        idleIntervals: 0,
        interactionCount: finalAnswers.length,
        trackingAvailable: true,
        validationIssues: [],
        isValid: true,
        answers: finalAnswers,
      };
      setLastCompletedSession(completedSessionObj);

      if (fallbackResults.xpEarned > 0) {
        const cur = useAuthStore.getState().profile;
        if (cur) {
          useAuthStore.getState().setProfile({
            ...cur,
            xp: (cur.xp || 0) + fallbackResults.xpEarned,
            totalQuestionsAnswered: (cur.totalQuestionsAnswered || 0) + fallbackResults.totalQuestions,
            totalCorrectAnswers: (cur.totalCorrectAnswers || 0) + fallbackResults.correctAnswers,
          });
        }
      }

      toast('Kết quả bài thi đã được lưu.', { icon: 'ℹ️' });
    } finally {
      finishInProgressRef.current = false;
      setLoadingQuestions(false);
    }
  };

  const handleExitQuizConfirm = () => {
    cancelStudySession(activeSessionIdRef.current);
    setShowExitModal(false);
    setQuizActive(false);
    setQuestions([]);
    setSessionId(null);
    setResults(null);
    setUserAnswersMap({});
    setCurrentIndex(0);
    toast('Đã thoát bài thi', { icon: '🚪' });
  };

  const handleStartMistakeReview = async () => {
    if (!profile?.uid || loadingQuestions) return;
    try {
      setLoadingQuestions(true);
      const [allQuestions, progressMap] = await Promise.all([
        fetchQuestions({ exam: 'cefr', cefrLevel: activeLevel, count: 1000 }),
        getUserQuestionProgress(profile.uid),
      ]);
      const readingQuestions = allQuestions.filter((question) => question.part === 5 || question.part === 6 || question.part === 7);
      const reviewDeck = buildMistakeReviewDeck(readingQuestions, progressMap, sessionSize);

      if (reviewDeck.length === 0) {
        toast.success('No unresolved mistakes. Your review queue is clear!');
        return;
      }

      await handleStartQuiz(reviewDeck, { title: 'Mistakes review' });
    } catch (error) {
      console.error(error);
      toast.error('Could not prepare your mistakes review.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!quizActive || results) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target?.tagName ?? '')) return;

      const currentQ = questions[currentIndex];
      const attempt = currentQ ? userAnswersMap[currentQ.id] : null;

      if (!attempt?.isSubmitted && ['1', '2', '3', '4'].includes(event.key)) {
        const choice = Number(event.key) - 1;
        if (currentQ && choice < currentQ.choices.length) {
          event.preventDefault();
          handleSelectChoice(choice);
        }
      }

      if (event.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          event.preventDefault();
          handlePrevQuestion();
        }
      }

      if (event.key === 'ArrowRight') {
        if (currentIndex < questions.length - 1) {
          event.preventDefault();
          handleNextQuestion();
        }
      }

      if (event.key === 'Enter') {
        if (!attempt?.isSubmitted && attempt?.selectedChoice !== null && attempt?.selectedChoice !== undefined) {
          event.preventDefault();
          handleSubmitAnswer();
        } else if (attempt?.isSubmitted && !loadingQuestions) {
          event.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, loadingQuestions, questions, quizActive, results, userAnswersMap]);

  // Render Quiz flow
  if (quizActive) {
    const activeQ = questions[currentIndex];
    const attempt = activeQ ? userAnswersMap[activeQ.id] : undefined;
    const selectedChoice = attempt?.selectedChoice ?? null;
    const isAnswerSubmitted = !!attempt?.isSubmitted;
    const answerConfidence = attempt?.confidence ?? null;

    const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
    const answeredCount = questions.filter(
      (q) => userAnswersMap[q.id]?.selectedChoice !== null && userAnswersMap[q.id]?.selectedChoice !== undefined
    ).length;

    const wrongQuestions = questions.filter((q) => {
      const att = userAnswersMap[q.id];
      return att && att.isSubmitted && att.selectedChoice !== q.correctAnswer;
    });

    const renderExplanation = () => {
      if (!isAnswerSubmitted || !activeQ) return null;
      const { evidence, sentenceTranslation, viExpl } = parseExplanation(activeQ.explanation);

      return (
        <motion.div className="space-y-3 pt-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="space-y-3 rounded-xl border-sky-200 bg-sky-50/70 p-5 text-slate-700 shadow-none">
            <p className="flex items-center gap-2 border-b border-sky-200/80 pb-2 text-xs font-black uppercase text-sky-700">
              <Icons.Info className="h-4 w-4" /> Dẫn chứng & Hướng dẫn giải chi tiết
            </p>
            <div className="space-y-3 text-sm leading-relaxed">
              {/* 1. Dẫn chứng trong bài (English Evidence) */}
              {evidence && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3.5 text-amber-950">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800">
                    <Icons.Quote className="h-4 w-4 text-amber-600" /> Dẫn chứng trong bài (English Evidence)
                  </span>
                  <p className="text-sm sm:text-base font-semibold italic text-amber-950 leading-relaxed select-text">
                    {evidence}
                  </p>
                </div>
              )}

              {/* 2. Giải thích chi tiết (Vietnamese Explanation) */}
              {viExpl && (
                <div className="rounded-lg border border-sky-200/90 bg-white p-3.5 text-slate-800 shadow-2xs">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-sky-800">
                    <Icons.BookOpenCheck className="h-4 w-4 text-sky-600" /> Giải thích chi tiết (Vietnamese Explanation)
                  </span>
                  <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed select-text whitespace-pre-line">
                    {viExpl}
                  </p>
                </div>
              )}

              {/* 3. Dịch nghĩa câu hỏi & đáp án (Vietnamese Translation) */}
              {sentenceTranslation && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3.5 text-slate-800">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-800">
                    <Icons.Languages className="h-4 w-4 text-indigo-600" /> Dịch nghĩa câu hỏi & đáp án
                  </span>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed select-text">
                    {sentenceTranslation}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <p className="text-xs font-black text-slate-700">Mức độ tự tin của bạn:</p>
            <div className="grid w-full grid-cols-3 gap-1 rounded-md bg-slate-100 p-1 sm:w-auto">
              {([
                ['low', 'Chưa chắc'],
                ['medium', 'Khá tự tin'],
                ['high', 'Rất chắc chắn'],
              ] as Array<[AnswerConfidence, string]>).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleConfidence(value)}
                  className={`rounded px-3 py-1.5 text-[10px] font-black transition-colors ${
                    answerConfidence === value
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      );
    };

    const renderChoices = (isTwoCol = false) => {
      if (!activeQ) return null;
      return (
        <div className={`grid gap-3 ${isTwoCol ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
          {activeQ.choices.map((choice, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedChoice === idx;
            const isCorrect = idx === activeQ.correctAnswer;

            let borderClass = 'border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50 text-slate-700 shadow-sm';
            if (isSelected && !isAnswerSubmitted) {
              borderClass = 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500 shadow-sm';
            } else if (isAnswerSubmitted) {
              if (isCorrect) {
                borderClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
              } else if (isSelected) {
                borderClass = 'border-rose-500 bg-rose-50 text-rose-800 font-bold';
              } else {
                borderClass = 'border-slate-100 bg-slate-50 opacity-50 text-slate-400';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectChoice(idx)}
                disabled={isAnswerSubmitted}
                className={`flex min-h-16 w-full items-center gap-4 rounded-xl border p-4 text-left text-sm font-semibold transition-all ${borderClass}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${
                  isSelected && !isAnswerSubmitted
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : isAnswerSubmitted && isCorrect
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : isAnswerSubmitted && isSelected
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-slate-200 bg-slate-100 text-slate-600'
                }`}>
                  {letter}
                </span>
                <span className="min-w-0 flex-1 leading-5 select-text">{choice}</span>
                {isAnswerSubmitted && isCorrect && <Icons.Check className="h-5 w-5 shrink-0 text-emerald-600" />}
                {isAnswerSubmitted && isSelected && !isCorrect && <Icons.X className="h-5 w-5 shrink-0 text-rose-600" />}
              </button>
            );
          })}
        </div>
      );
    };

    const renderNavigationControls = () => {
      return (
        <div ref={actionBtnRef} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {/* Câu trước */}
          <Button
            type="button"
            variant="secondary"
            onClick={handlePrevQuestion}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 font-bold"
          >
            <Icons.ChevronLeft className="h-4 w-4" />
            <span>Câu trước</span>
          </Button>

          {/* Giữa: Kiểm tra đáp án / Thông báo */}
          <div className="flex items-center gap-2">
            {!isAnswerSubmitted ? (
              <Button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={selectedChoice === null}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-sm disabled:opacity-50"
              >
                <Icons.Check className="h-4 w-4" />
                <span>Kiểm tra đáp án</span>
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                <Icons.CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Đã kiểm tra
              </span>
            )}
          </div>

          {/* Câu sau / Nộp bài */}
          <div className="flex items-center gap-2">
            {currentIndex < questions.length - 1 ? (
              <Button
                type="button"
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 font-bold px-6 bg-slate-900 hover:bg-slate-800 text-white"
              >
                <span>Câu sau</span>
                <Icons.ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setShowFinishConfirmModal(true)}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 shadow-sm"
              >
                <Icons.Flag className="h-4 w-4" />
                <span>Nộp bài thi</span>
              </Button>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="mx-auto w-full max-w-[1360px] space-y-4 pb-8 text-slate-800 animate-fade-in">
        {/* Top Header Toolbar with Prominent Exit button */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 cursor-pointer shadow-2xs"
            >
              <Icons.LogOut className="h-3.5 w-3.5" />
              <span>Thoát bài thi</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <p className="hidden md:block truncate text-xs font-black text-slate-800 max-w-sm">
              {practiceTitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 tabular-nums border border-slate-200">
              <Icons.Timer className="w-3.5 h-3.5 text-sky-600" />
              {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}
            </span>

            {/* Question Counter & Palette Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPalette(!showPalette)}
              className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer"
            >
              <Icons.LayoutGrid className="h-3.5 w-3.5" />
              <span>Câu {currentIndex + 1} / {questions.length}</span>
              <span className="text-[11px] font-bold text-slate-500">({answeredCount} đã làm)</span>
            </button>

            {/* Quick Finish Button */}
            <Button
              type="button"
              size="sm"
              onClick={() => setShowFinishConfirmModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
            >
              <Icons.Flag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nộp bài</span>
            </Button>
          </div>
        </div>

        <Progress value={progressPercent} height="sm" />

        {/* Question Palette Drawer */}
        <AnimatePresence>
          {showPalette && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-xl border border-sky-100 bg-white p-4 shadow-md"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Icons.LayoutGrid className="h-4 w-4 text-sky-600" />
                  <span className="text-xs font-black text-slate-900">
                    Bảng câu hỏi ({answeredCount}/{questions.length} đã trả lời)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
                    Click vào số câu để chuyển nhanh
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPalette(false)}
                    className="text-xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                  >
                    Đóng ✕
                  </button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto pr-1">
                <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-20 gap-1.5">
                  {questions.map((q, idx) => {
                    const att = userAnswersMap[q.id];
                    const isCurrent = idx === currentIndex;
                    const hasAnswer = att?.selectedChoice !== null && att?.selectedChoice !== undefined;
                    const isSub = att?.isSubmitted;
                    const isCorr = att?.isCorrect;

                    let btnClass = 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50';
                    if (isCurrent) {
                      btnClass = 'border-indigo-600 bg-indigo-50 text-indigo-700 font-black ring-2 ring-indigo-400';
                    } else if (isSub) {
                      btnClass = isCorr
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                        : 'border-rose-400 bg-rose-50 text-rose-700 font-bold';
                    } else if (hasAnswer) {
                      btnClass = 'border-sky-400 bg-sky-50 text-sky-700 font-bold';
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          handleNavigateQuestion(idx);
                          setShowPalette(false);
                        }}
                        className={`h-9 w-full rounded-lg border text-xs transition-all flex items-center justify-center cursor-pointer ${btnClass}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeQ?.context ? (
                /* Layout with Reading Passage on Left, Question + Choices on Right */
                <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
                  {/* Left Column: Context / Reading Passage ONLY */}
                  <Card className="h-full space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-xs">
                          <Icons.BookOpen className="h-3 w-3" /> Đoạn văn đọc hiểu
                        </span>
                        {activeQ?.tags?.includes('toeic-2026') ? (
                          <>
                            <Badge variant="info">
                              {activeQ.tags.find((t) => t.startsWith('test-'))?.toUpperCase().replace('-', ' ') || 'TOEIC'}
                            </Badge>
                            <Badge variant="purple">Part {activeQ.part}</Badge>
                          </>
                        ) : (
                          <Badge variant="purple">CEFR {activeQ?.cefrLevel ?? activeLevel}</Badge>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">Reading Passage</span>
                    </div>

                    <div className="max-h-[calc(100vh-280px)] overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/80 p-5 text-sm sm:text-base leading-relaxed text-slate-800 font-sans select-text">
                      <ReadingPassage content={activeQ.context} />
                    </div>
                  </Card>

                  {/* Right Column: Question Text on Top, Choices directly underneath */}
                  <div className="flex h-full flex-col gap-4">
                    <Card className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <span className="text-xs font-black uppercase tracking-wider text-sky-700">
                          Câu {currentIndex + 1} / {questions.length}
                        </span>
                        <span className="text-xs font-bold text-slate-400 truncate max-w-[200px]">
                          {formatTopic(activeQ.topic)}
                        </span>
                      </div>

                      {/* QUESTION TEXT DIRECTLY ABOVE CHOICES */}
                      <div>
                        <h2 className="text-lg font-bold leading-relaxed text-slate-950 sm:text-xl select-text">
                          {activeQ.question}
                        </h2>
                      </div>

                      {/* CHOICES DIRECTLY UNDERNEATH */}
                      <div className="mt-4">
                        {renderChoices(false)}
                      </div>

                      {/* EXPLANATION IF SUBMITTED */}
                      {renderExplanation()}
                    </Card>

                    {/* Navigation Controls */}
                    {renderNavigationControls()}
                  </div>
                </div>
              ) : (
                /* Layout WITHOUT Context (e.g. Part 5 Sentence Completion, Grammar) */
                <div className="mx-auto w-full max-w-4xl space-y-4">
                  <Card className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {activeQ?.tags?.includes('toeic-2026') ? (
                          <>
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-xs">
                              <Icons.Award className="h-3 w-3" /> TOEIC 2026
                            </span>
                            <Badge variant="info">
                              {activeQ.tags.find((t) => t.startsWith('test-'))?.toUpperCase().replace('-', ' ') || 'Test'}
                            </Badge>
                            <Badge variant="purple">Part {activeQ.part}</Badge>
                          </>
                        ) : (
                          <Badge variant="purple">CEFR {activeQ?.cefrLevel ?? activeLevel}</Badge>
                        )}
                        <span className="text-xs font-bold text-slate-500">
                          Câu {currentIndex + 1} / {questions.length}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 truncate max-w-[200px]">
                        {formatTopic(activeQ?.topic)}
                      </span>
                    </div>

                    {/* QUESTION TEXT DIRECTLY ON TOP */}
                    <div className="pt-1">
                      <h2 className="text-xl font-bold leading-relaxed text-slate-950 sm:text-2xl select-text">
                        {activeQ?.question}
                      </h2>
                    </div>

                    {/* CHOICES DIRECTLY UNDERNEATH QUESTION */}
                    <div className="mt-6">
                      {renderChoices(true)}
                    </div>

                    {/* EXPLANATION IF SUBMITTED */}
                    {renderExplanation()}
                  </Card>

                  {/* Navigation Controls */}
                  {renderNavigationControls()}
                </div>
              )}
            </motion.div>
          ) : (
            /* Results Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md lg:min-h-[calc(100vh-210px)] lg:grid-cols-[minmax(300px,0.75fr)_minmax(0,1.25fr)]"
            >
              <section className="flex flex-col justify-between bg-slate-950 p-6 text-white sm:p-8">
                <div>
                  <p className="text-xs font-black uppercase text-sky-300">{practiceTitle}</p>
                  <h2 className="mt-2 text-2xl font-black">Hoàn thành bài thi! 🎉</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Kết quả bài thi đã được lưu vào lịch sử học tập của bạn.</p>
                </div>
                <div className="mt-8 flex items-center gap-5 lg:flex-col lg:items-start">
                  <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full border-4 border-sky-400 bg-slate-900">
                    <p className="text-3xl font-black">{results.accuracy}%</p>
                    <p className="text-[10px] font-black uppercase text-slate-400">Độ chính xác</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-300">Số câu đúng</p>
                    <p className="mt-1 text-3xl font-black tabular-nums">
                      {results.correctAnswers}<span className="text-lg text-slate-500"> / {results.totalQuestions}</span>
                    </p>
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-5 p-5 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400">Tổng kết phiên học</p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">Hiệu suất làm bài</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${
                    results.isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {results.isValid ? <Icons.ShieldCheck className="h-4 w-4" /> : <Icons.ShieldAlert className="h-4 w-4" />}
                    {results.isValid ? 'Hợp lệ' : 'Cần xem lại'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-4">
                  <div className="bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400">Đúng</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{results.correctAnswers} / {results.totalQuestions}</p>
                  </div>
                  <div className="bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400">Thời gian</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{formatDuration(Math.round(results.timeSpent))}</p>
                  </div>
                  <div className="bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400">XP nhận được</p>
                    <p className="mt-1 text-lg font-black text-emerald-600">+{results.xpEarned} XP</p>
                  </div>
                  <div className="bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400">Streak Bonus</p>
                    <p className="mt-1 text-lg font-black text-amber-600">+{results.streakBonus} XP</p>
                  </div>
                </div>

                {results.isValid ? (
                  <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                    <Icons.ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-sm font-black">Phiên học đã được xác thực</p>
                      <p className="mt-1 text-xs leading-5 text-emerald-700">Thời gian và hành động học tập đáp ứng tiêu chuẩn. XP và tiến trình đã được ghi nhận.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">
                    <Icons.AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-sm font-black">Phiên học chưa đủ điều kiện tính XP</p>
                      <p className="mt-1 text-xs leading-5 text-rose-700">
                        {(results.validationIssues ?? []).length > 0
                          ? (results.validationIssues ?? []).map((issue) => validationIssueMessages[issue]).join(' ')
                          : 'Dữ liệu phiên học chưa được xác thực đầy đủ.'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-auto flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <Button
                    onClick={() => {
                      setQuizActive(false);
                      setResults(null);
                      setQuestions([]);
                      navigate(isToeicRoute ? '/study/toeic' : '/study');
                    }}
                    variant="secondary"
                    className="px-6 font-semibold"
                  >
                    <Icons.ArrowLeft className="h-4 w-4" /> Quay lại danh sách
                  </Button>
                  {lastCompletedSession && (
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedReviewSession(lastCompletedSession)}
                      className="border-sky-200 bg-sky-50 px-6 font-bold text-sky-700 hover:bg-sky-100"
                    >
                      <Icons.Eye className="h-4 w-4" /> Xem lại bài làm
                    </Button>
                  )}
                  {wrongQuestions.length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={() => handleStartQuiz(wrongQuestions, { title: 'Sửa lỗi sai' })}
                      className="border-rose-200 bg-rose-50 px-6 font-bold text-rose-700 hover:bg-rose-100"
                    >
                      <Icons.RefreshCw className="h-4 w-4" /> Làm lại {wrongQuestions.length} câu sai
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setQuizActive(false);
                      setResults(null);
                      setQuestions([]);
                    }}
                    className="px-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Icons.RotateCcw className="h-4 w-4" /> Bài học mới
                  </Button>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exit Confirmation Modal */}
        <AnimatePresence>
          {showExitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
                    <Icons.LogOut className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Thoát bài thi?</h3>
                    <p className="text-xs text-slate-500">Tiến trình làm bài hiện tại sẽ dừng lại</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                  Bạn đã làm <span className="font-bold text-slate-900">{answeredCount}/{questions.length}</span> câu hỏi. Tiến trình làm bài sẽ không được lưu nếu bạn thoát ngay bây giờ.
                </p>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <Button variant="secondary" onClick={() => setShowExitModal(false)} className="font-bold">
                    Tiếp tục làm bài
                  </Button>
                  <Button
                    onClick={handleExitQuizConfirm}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  >
                    Xác nhận thoát
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Finish Confirmation Modal */}
        <AnimatePresence>
          {showFinishConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                    <Icons.Flag className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Xác nhận nộp bài thi</h3>
                    <p className="text-xs text-slate-500">Tổng kết kết quả học tập</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                  {answeredCount < questions.length ? (
                    <>
                      Bạn mới trả lời <span className="font-bold text-amber-600">{answeredCount}/{questions.length}</span> câu hỏi. Còn <span className="font-bold text-rose-600">{questions.length - answeredCount}</span> câu chưa trả lời. Bạn có chắc chắn muốn nộp bài thi ngay?
                    </>
                  ) : (
                    <>
                      Bạn đã trả lời đầy đủ toàn bộ <span className="font-bold text-emerald-600">{questions.length}</span> câu hỏi! Bạn đã sẵn sàng nộp bài để chấm điểm?
                    </>
                  )}
                </p>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <Button variant="secondary" onClick={() => setShowFinishConfirmModal(false)} className="font-bold">
                    Kiểm tra lại
                  </Button>
                  <Button
                    onClick={handleFinishQuiz}
                    disabled={loadingQuestions}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  >
                    {loadingQuestions ? 'Đang chấm điểm...' : 'Nộp bài ngay'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const filteredGrammarTopics = getBundledTopics(activeSkill, activeLevel).filter((topic) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return formatTopic(topic.topic).toLowerCase().includes(term);
  });

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4 pb-8 text-slate-800">
      <section className="min-w-0 space-y-4">
        {/* Module Navigation with 5 tabs */}
        <LearningModuleNav active={isToeicRoute ? 'toeic' : 'grammar'} />

        {isToeicRoute ? (
          /* ================= TOEIC READING 2026 VIEW ================= */
          <div className="space-y-6 animate-fade-in">
            <ToeicReadingSection
              onStartQuiz={handleStartQuiz}
              loadingQuestions={loadingQuestions}
              selectedTest={toeicTest}
              onSelectTest={handleToeicTestChange}
              activeTab={toeicTab}
              onSelectTab={handleToeicTabChange}
            />

            {/* Switch to CEFR prompt */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-[10px] font-black uppercase text-sky-700 tracking-wider">Học theo chuẩn CEFR</p>
                <h3 className="mt-1 text-base font-black text-slate-900">Luyện Ngữ pháp, Từ vựng & Đọc hiểu B2 - C1</h3>
                <p className="mt-1 text-xs text-slate-500">Rèn luyện cấu trúc ngữ pháp Cambridge, liên từ, collocations và đọc đoạn văn theo trình độ.</p>
              </div>
              <Link
                to="/study"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                <span>Mở CEFR Practice Hub</span>
                <Icons.ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ================= CEFR PRACTICE VIEW ================= */
          <div className="space-y-4 animate-fade-in">
            <LearningIntro
              eyebrow={`CEFR ${activeLevel} · ${CEFR_LEVEL_META[activeLevel].band}`}
              title={skillMeta[activeSkill].title}
              description={`${skillMeta[activeSkill].description} ${CEFR_LEVEL_META[activeLevel].descriptor}`}
              icon={activeSkill === 'reading' ? Icons.Newspaper : activeSkill === 'use-of-english' ? Icons.Files : Icons.BookOpen}
              accent="emerald"
              aside={(
                <div className="w-full">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Question bank</p>
                  <p className="mt-1 text-3xl font-black text-slate-950">{getBundledQuestionCount(activeSkill, undefined, activeLevel)}</p>
                  <p className="mt-1 text-xs text-slate-500">verified CEFR questions</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-full bg-emerald-500" />
                  </div>
                </div>
              )}
            />

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-sky-700">Personalized practice</p>
                  <h2 className="mt-1 text-lg font-black text-slate-950">Practice Hub</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Session</span>
                  <div className="flex rounded-md bg-slate-100 p-1" role="group" aria-label="Session size">
                    {([5, 10, 20] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSessionSize(size)}
                        aria-pressed={sessionSize === size}
                        className={`min-w-9 rounded px-2 py-1 text-[10px] font-black transition-colors ${
                          sessionSize === size ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={handleStartMistakeReview}
                  disabled={loadingQuestions}
                  className="group flex min-h-28 items-start gap-3 border-b border-slate-200 p-4 text-left transition-colors hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60 sm:border-r xl:border-b-0"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-700">
                    <Icons.RotateCcw className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-black text-slate-900">Mistakes</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{queueStats.weak} unresolved reading items</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-black text-rose-600">
                      Review <Icons.ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStartQuiz(undefined, { skill: activeSkill, count: sessionSize })}
                  disabled={loadingQuestions}
                  className="group flex min-h-28 items-start gap-3 border-b border-slate-200 p-4 text-left transition-colors hover:bg-sky-50 disabled:cursor-wait disabled:opacity-60 xl:border-b-0 xl:border-r"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                    <Icons.Sparkles className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-black text-slate-900">Smart mix</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{queueStats.due} due · {queueStats.newCount} new</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-black text-sky-700">
                      Practice <Icons.ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </button>
                <Link
                  to="/study/vocabulary"
                  className="group flex min-h-28 items-start gap-3 border-b border-slate-200 p-4 text-left transition-colors hover:bg-violet-50 sm:border-b-0 sm:border-r"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-violet-100 text-violet-700">
                    <Icons.Layers3 className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-black text-slate-900">Word recall</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">Spaced vocabulary review</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-black text-violet-700">
                      Recall <Icons.ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </Link>
                <Link
                  to="/study/listening"
                  className="group flex min-h-28 items-start gap-3 p-4 text-left transition-colors hover:bg-emerald-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                    <Icons.Headphones className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-black text-slate-900">Listening focus</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">Audio-first comprehension</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-black text-emerald-700">
                      Listen <Icons.ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </Link>
              </div>
            </section>

            {/* TOEIC Reading 2026 Section in CEFR page */}
            <ToeicReadingSection
              onStartQuiz={handleStartQuiz}
              loadingQuestions={loadingQuestions}
              selectedTest={toeicTest}
              onSelectTest={handleToeicTestChange}
              activeTab={toeicTab}
              onSelectTab={handleToeicTabChange}
            />

            {/* Choose CEFR level */}
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-3">
                <p className="text-[10px] font-black uppercase text-sky-700">Choose your CEFR level</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6">
                {CEFR_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={activeLevel === level}
                    onClick={() => handleSelectLevel(level)}
                    className={`min-h-16 border-b border-r border-slate-200 px-3 py-2 text-center transition-colors sm:border-b-0 cursor-pointer ${
                      activeLevel === level ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 hover:bg-sky-50'
                    }`}
                  >
                    <span className="block text-lg font-black">{level}</span>
                    <span className={`block text-[9px] font-bold ${activeLevel === level ? 'text-sky-100' : 'text-slate-400'}`}>
                      {CEFR_LEVEL_META[level].title}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Choose CEFR skill */}
            <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:grid-cols-3">
              {(['grammar', 'use-of-english', 'reading'] as CefrStudySkill[]).map((skill) => (
                <button
                  key={skill}
                  type="button"
                  aria-pressed={activeSkill === skill}
                  onClick={() => handleSelectSkill(skill)}
                  className={`flex min-h-20 items-center justify-between gap-3 border-b px-5 py-4 text-left transition-colors last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 cursor-pointer ${
                    activeSkill === skill ? 'bg-slate-950 text-white' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>
                    <span className={`block text-[10px] font-bold uppercase ${activeSkill === skill ? 'text-sky-300' : 'text-sky-700'}`}>
                      {skillMeta[skill].viTitle}
                    </span>
                    <span className="mt-1 block text-sm font-black">{skillMeta[skill].title}</span>
                  </span>
                  <span className={`text-xs font-bold ${activeSkill === skill ? 'text-sky-300' : 'text-slate-400'}`}>
                    {getBundledQuestionCount(skill, undefined, activeLevel)} Q
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleStartQuiz(undefined, { skill: activeSkill, count: sessionSize })}
              disabled={loadingQuestions}
              className="flex w-full items-center justify-between rounded-lg border border-sky-200 bg-sky-50 px-5 py-5 text-left shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-100/70 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
              <span className="flex min-w-0 items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white text-sky-600 shadow-sm">
                  <Icons.Shuffle className="h-7 w-7" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-black text-slate-900">Smart mixed practice</span>
                  <span className="block text-sm font-medium text-slate-500">{sessionSize} {activeLevel} {skillMeta[activeSkill].shortTitle.toLowerCase()} questions, balanced from due, new, and weak items</span>
                </span>
              </span>
              <span className="ml-4 hidden rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm sm:inline-flex">
                {loadingQuestions ? 'Loading...' : 'Start'}
              </span>
            </button>

            <WorkspaceSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={`Search ${activeLevel} ${skillMeta[activeSkill].shortTitle.toLowerCase()} topics...`}
            />

            <LearningSectionHeading
              title={`${activeLevel} ${skillMeta[activeSkill].shortTitle} topics`}
              count={`${filteredGrammarTopics.length} topics`}
              icon={Icons.LibraryBig}
            />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredGrammarTopics.map((topic) => (
                <motion.button
                  key={topic.topic}
                  variants={cardVariants}
                  type="button"
                  onClick={() => handleStartQuiz(undefined, { skill: activeSkill, topic: topic.topic, count: sessionSize })}
                  className="group min-h-36 rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md cursor-pointer"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-slate-900">{formatTopic(topic.topic)}</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">Focused CEFR {activeLevel} practice</p>
                    </div>
                    <div className="flex shrink-0 gap-2 text-slate-300">
                      <Icons.Star className="h-4 w-4" />
                      <Icons.RotateCcw className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-black text-blue-600">
                        <Icons.Target className="h-4 w-4" />
                        {topic.count} questions
                      </p>
                      <p className="mt-5 text-xs font-bold text-slate-500">{sessionSize} per smart session</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-sky-500">
                      Practice
                      <Icons.ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}

        {/* Recent Study Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 text-base font-bold text-slate-800 flex items-center gap-2">
            <Icons.History className="w-5 h-5 text-[#0071E3]" />
            Lịch sử học gần đây
          </h2>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Chưa có phiên học nào. Hãy bắt đầu một bài luyện tập ở trên!
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedReviewSession(session)}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/60 cursor-pointer"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-lg">
                    {session.exam === 'toeic-2026' ? '📘' : session.type === 'listening' ? '🎧' : session.type === 'vocabulary' ? '📚' : '📝'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={session.exam === 'toeic-2026' ? 'purple' : session.type === 'vocabulary' ? 'purple' : 'info'}
                        className="text-[10px] font-bold"
                      >
                        {session.exam === 'toeic-2026' ? 'TOEIC Reading 2026' : `${session.type} Practice`}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-700">
                        {session.questionsAttempted} câu hỏi
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{formatTimestamp(session.createdAt as any)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-black text-emerald-600">
                      +{session.xpEarned} XP
                    </p>
                    <div className="flex items-center gap-2 justify-end text-[10px] font-bold">
                      <span className={getAccuracyColor(session.accuracy)}>{session.accuracy}% accuracy</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400">{formatDuration(session.totalSeconds)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      <SessionReviewModal
        isOpen={selectedReviewSession !== null}
        onClose={() => setSelectedReviewSession(null)}
        session={selectedReviewSession}
        onPracticeQuizAgain={handleStartQuiz}
      />
    </div>
  );
}
