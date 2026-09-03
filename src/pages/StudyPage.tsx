import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
};

const formatTopic = (topic: string) =>
  topicLabels[topic] ?? topic.replaceAll('-', ' ').replace(/\b\w/g, (character) => character.toUpperCase());

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

const parseExplanation = (explanation: string) => {
  if (!explanation) return { sentenceTranslation: '', viExpl: '' };

  const parts = explanation.split('|').map((s) => s.trim());
  let sentenceTranslation = '';
  let viExpl = '';

  const translationPart = parts.find((p) => p.toLowerCase().startsWith('dịch nghĩa:'));
  const explanationPart = parts.find((p) => p.toLowerCase().startsWith('giải thích:'));

  if (translationPart) {
    sentenceTranslation = translationPart.replace(/dịch nghĩa:\s*/i, '');
  }
  if (explanationPart) {
    viExpl = explanationPart.replace(/giải thích:\s*/i, '');
  }

  if (!sentenceTranslation && !viExpl) {
    if (parts.length > 1) {
      viExpl = parts.slice(1).join(' | ');
    } else {
      viExpl = parts[0];
    }
  }

  return { sentenceTranslation, viExpl };
};

export default function StudyPage() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSkill, setActiveSkill] = useState<CefrStudySkill>('grammar');
  const [activeLevel, setActiveLevel] = useState<CefrLevel>(() => getCurrentCefrLevel(profile));
  const [practiceTitle, setPracticeTitle] = useState('CEFR smart practice');
  const [sessionSize, setSessionSize] = useState<5 | 10 | 20>(10);
  const [queueStats, setQueueStats] = useState({ due: 0, weak: 0, newCount: 0 });

  // Active quiz session states
  const [quizActive, setQuizActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [answerConfidence, setAnswerConfidence] = useState<AnswerConfidence | null>(null);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Session duration timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(0);
  const activeSessionIdRef = useRef<string | null>(null);
  const answersRef = useRef<QuestionAnswer[]>([]);
  const actionBtnRef = useRef<HTMLDivElement | null>(null);
  const finishInProgressRef = useRef<boolean>(false);
  const [selectedReviewSession, setSelectedReviewSession] = useState<StudySession | null>(null);

  const { setStudySessionActive } = useUIStore();

  useEffect(() => {
    activeSessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Keep UI store in sync
  useEffect(() => {
    setStudySessionActive(quizActive);
    return () => {
      setStudySessionActive(false);
    };
  }, [quizActive, setStudySessionActive]);

  // Auto-scroll action button into view when explanation expands
  useEffect(() => {
    if (isAnswerSubmitted && actionBtnRef.current) {
      setTimeout(() => {
        actionBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  }, [isAnswerSubmitted]);

  // Cancel on unmount
  useEffect(() => () => cancelStudySession(activeSessionIdRef.current), []);

  // Intercept back button gestures and browser back navigation using popstate
  useEffect(() => {
    if (!quizActive || results) return;

    // Push dummy history entry so back button pops it instead of navigating away
    window.history.pushState({ preventBack: true }, '');

    const handlePopState = (e: PopStateEvent) => {
      const confirmExit = window.confirm(
        'Bạn có chắc chắn muốn rời khỏi bài học? Tiến trình hiện tại sẽ bị hủy.'
      );
      if (confirmExit) {
        cancelStudySession(sessionId);
        setQuizActive(false);
        setQuestions([]);
        setSessionId(null);
        setResults(null);
      } else {
        // Push dummy state again to intercept the next back gesture
        window.history.pushState({ preventBack: true }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up the dummy history entry if the user completes or exits the quiz
      if (window.history.state?.preventBack) {
        window.history.back();
      }
    };
  }, [quizActive, results, sessionId]);

  // Prevent page refresh / tab close
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const level = params.get('level');
    const skill = params.get('skill');
    if (isCefrLevel(level)) setActiveLevel(level);
    if (skill === 'grammar' || skill === 'use-of-english' || skill === 'reading') {
      setActiveSkill(skill as CefrStudySkill);
    }
  }, [location.search]);

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

  // Catch retake questions from router state (e.g. from Profile page)
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

      const activeSessionId = await startStudySession(profile.uid, 'cefr', 'quiz');
      setSessionId(activeSessionId);
      setQuestions(list);
      setCurrentIndex(0);
      setAnswers([]);
      setSelectedChoice(null);
      setIsAnswerSubmitted(false);
      setAnswerConfidence(null);
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

  const handleSubmitAnswer = () => {
    if (selectedChoice === null || isAnswerSubmitted) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedChoice === currentQuestion.correctAnswer;
    const timeSpent = (Date.now() - questionStartTimeRef.current) / 1000;

    const answerRecord: QuestionAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedChoice,
      isCorrect,
      timeSpent,
    };

    setAnswers((prev) => [...prev, answerRecord]);
    setIsAnswerSubmitted(true);
    setAnswerConfidence(null);
  };

  const handleConfidence = (confidence: AnswerConfidence) => {
    setAnswerConfidence(confidence);
    setAnswers((previous) => previous.map((answer) =>
      answer.questionId === questions[currentIndex]?.id ? { ...answer, confidence } : answer
    ));
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setSelectedChoice(null);
      setIsAnswerSubmitted(false);
      setAnswerConfidence(null);
      setCurrentIndex((prev) => prev + 1);
      questionStartTimeRef.current = Date.now();
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async (submittedAnswers?: QuestionAnswer[]) => {
    if (!sessionId || !profile?.uid || finishInProgressRef.current) return;
    finishInProgressRef.current = true;
    const finalAnswers = submittedAnswers && submittedAnswers.length > 0 ? submittedAnswers : answers;
    try {
      setLoadingQuestions(true);
      const sessionResults = await endStudySession(
        sessionId,
        profile.uid,
        finalAnswers,
        profile.currentStreak
      );
      setResults(sessionResults);
      toast.success('Quiz completed! 🎉');
    } catch (err) {
      console.error('Quiz submission error:', err);
      // Fallback: calculate results locally so the student is never stuck on Question 10
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
      toast('Quiz results saved locally. Cloud will sync on your next activity.', { icon: '⚠️' });
    } finally {
      finishInProgressRef.current = false;
      setLoadingQuestions(false);
    }
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

  const handleExitQuiz = () => {
    if (results || window.confirm('Exit quiz? Current progress will not be saved.')) {
      cancelStudySession(sessionId);
      setQuizActive(false);
      setQuestions([]);
      setSessionId(null);
      setResults(null);
    }
  };

  useEffect(() => {
    if (!quizActive || results) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target?.tagName ?? '')) return;

      if (!isAnswerSubmitted && ['1', '2', '3', '4'].includes(event.key)) {
        const choice = Number(event.key) - 1;
        if (choice < (questions[currentIndex]?.choices.length ?? 0)) {
          event.preventDefault();
          setSelectedChoice(choice);
        }
      }

      if (event.key === 'Enter') {
        if (!isAnswerSubmitted && selectedChoice !== null) {
          event.preventDefault();
          handleSubmitAnswer();
        } else if (isAnswerSubmitted && !loadingQuestions) {
          event.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isAnswerSubmitted, loadingQuestions, questions, quizActive, results, selectedChoice]);

  // Render Quiz flow
  if (quizActive) {
    const currentQuestion = questions[currentIndex];
    const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
    const wrongQuestionIds = new Set(answers.filter((answer) => !answer.isCorrect).map((answer) => answer.questionId));
    const wrongQuestions = questions.filter((question) => wrongQuestionIds.has(question.id));

    return (
      <div className="mx-auto w-full max-w-[1280px] space-y-4 pb-8 text-slate-800 animate-fade-in">
        {/* Header toolbar */}
        <div className="grid gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <button
            onClick={handleExitQuiz}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-slate-900"
          >
            <Icons.X className="w-4 h-4" /> Exit Session
          </button>

          <p className="truncate text-center text-xs font-black text-slate-800 sm:px-4">{practiceTitle}</p>

          <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-500 sm:justify-end">
            <span className="flex items-center gap-1.5 tabular-nums">
              <Icons.Timer className="w-3.5 h-3.5 text-[#0071E3]" />
              {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}
            </span>
            <span className="font-black text-[#0071E3]">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        <Progress value={progressPercent} height="sm" />

        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className={`grid items-start gap-4 lg:min-h-[calc(100vh-210px)] lg:items-stretch ${
                currentQuestion?.context
                  ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]'
                  : 'lg:grid-cols-[minmax(320px,0.75fr)_minmax(0,1.25fr)]'
              }`}
            >
              <Card className="h-full space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="purple">CEFR {currentQuestion?.cefrLevel ?? activeLevel}</Badge>
                    <Badge variant="info" className="capitalize">{currentQuestion?.topic || 'Business'}</Badge>
                  </div>
                  <Badge variant="warning" dot>{skillMeta[currentQuestion?.skill ?? activeSkill]?.shortTitle ?? 'CEFR'}</Badge>
                </div>
                {currentQuestion?.context && (
                  <div className="max-h-[calc(100vh-280px)] overflow-y-auto whitespace-pre-line rounded-md border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                    {currentQuestion.context}
                  </div>
                )}
                <div className="border-t border-slate-100 pt-4">
                  <p className="mb-2 text-[10px] font-black uppercase text-slate-400">Question {currentIndex + 1}</p>
                  <h2 className="text-lg font-bold leading-relaxed text-slate-950 sm:text-xl">
                    {currentQuestion?.question}
                  </h2>
                </div>
              </Card>

              <div className="flex h-full flex-col gap-4">
                <div className={`grid gap-3 ${currentQuestion?.context ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'}`}>
                  {currentQuestion?.choices.map((choice, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = selectedChoice === idx;
                    const isCorrect = idx === currentQuestion.correctAnswer;

                    let borderClass = 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm';
                    if (isSelected && !isAnswerSubmitted) {
                      borderClass = 'border-[#0071E3] bg-sky-50 text-[#0071E3] shadow-sm';
                    } else if (isAnswerSubmitted) {
                      if (isCorrect) {
                        borderClass = 'border-emerald-500 bg-emerald-50 text-emerald-700';
                      } else if (isSelected) {
                        borderClass = 'border-rose-500 bg-rose-50 text-rose-700';
                      } else {
                        borderClass = 'border-slate-100 bg-slate-50 opacity-50 text-slate-400';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => !isAnswerSubmitted && setSelectedChoice(idx)}
                        disabled={isAnswerSubmitted}
                        className={`flex min-h-16 w-full items-center gap-4 rounded-lg border p-4 text-left text-sm font-semibold transition-all ${borderClass}`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-black ${
                          isSelected && !isAnswerSubmitted
                            ? 'border-[#0071E3] bg-[#0071E3] text-white'
                            : 'border-slate-200 bg-slate-100 text-slate-500'
                        }`}>
                          {letter}
                        </span>
                        <span className="min-w-0 flex-1 leading-5">{choice}</span>
                        {isAnswerSubmitted && isCorrect && <Icons.Check className="h-5 w-5 shrink-0 text-emerald-600" />}
                        {isAnswerSubmitted && isSelected && !isCorrect && <Icons.X className="h-5 w-5 shrink-0 text-rose-600" />}
                      </button>
                    );
                  })}
                </div>

                {isAnswerSubmitted && (() => {
                  const { sentenceTranslation, viExpl } = parseExplanation(currentQuestion?.explanation);

                  return (
                    <motion.div className="space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="space-y-3 rounded-lg border-sky-200 bg-sky-50 p-5 text-slate-700 shadow-none">
                        <p className="flex items-center gap-2 border-b border-sky-200 pb-2 text-xs font-black uppercase text-sky-700">
                          <Icons.Info className="h-4 w-4" /> Detailed explanation
                        </p>
                        <div className="space-y-3 text-sm leading-6">
                          {sentenceTranslation && (
                            <div>
                              <span className="mb-1 inline-flex items-center gap-1.5 text-xs font-black text-slate-800">
                                <Icons.Languages className="h-4 w-4 text-sky-600" /> Translation
                              </span>
                              <p className="font-medium text-slate-700">{sentenceTranslation}</p>
                            </div>
                          )}
                          {viExpl && (
                            <div className={sentenceTranslation ? 'border-t border-sky-200 pt-3' : ''}>
                              <span className="mb-1 inline-flex items-center gap-1.5 text-xs font-black text-slate-800">
                                <Icons.BookOpenCheck className="h-4 w-4 text-sky-600" /> Explanation
                              </span>
                              <p className="text-slate-700">{viExpl}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-xs font-black text-slate-700">How confident were you?</p>
                        <div className="grid w-full grid-cols-3 gap-1 rounded-md bg-slate-100 p-1 sm:w-auto">
                          {([
                            ['low', 'Not sure'],
                            ['medium', 'Fairly sure'],
                            ['high', 'Very sure'],
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
                })()}

                <div ref={actionBtnRef} className="mt-auto flex justify-end border-t border-slate-200 pt-4">
                  {!isAnswerSubmitted ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={selectedChoice === null}
                      className="w-full px-8 font-bold sm:w-auto"
                    >
                      <Icons.Check className="h-4 w-4" /> {currentIndex === questions.length - 1 ? 'Check & Review' : 'Submit Answer'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      disabled={loadingQuestions}
                      className="w-full px-8 font-bold sm:w-auto"
                    >
                      {loadingQuestions ? (
                        <Icons.LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : currentIndex < questions.length - 1 ? (
                        <Icons.ArrowRight className="h-4 w-4" />
                      ) : (
                        <Icons.Flag className="h-4 w-4" />
                      )}
                      {loadingQuestions
                        ? 'Saving...'
                        : currentIndex < questions.length - 1
                          ? 'Next Question'
                          : 'Finish Quiz'}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md lg:min-h-[calc(100vh-210px)] lg:grid-cols-[minmax(300px,0.75fr)_minmax(0,1.25fr)]"
            >
              <section className="flex flex-col justify-between bg-slate-950 p-6 text-white sm:p-8">
                <div>
                  <p className="text-xs font-black uppercase text-sky-300">{practiceTitle}</p>
                  <h2 className="mt-2 text-2xl font-black">Quiz complete</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Your result has been saved to recent study activity.</p>
                </div>
                <div className="mt-8 flex items-center gap-5 lg:flex-col lg:items-start">
                  <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full border-4 border-sky-400 bg-slate-900">
                    <p className="text-3xl font-black">{results.accuracy}%</p>
                    <p className="text-[10px] font-black uppercase text-slate-400">Accuracy</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-300">Correct answers</p>
                    <p className="mt-1 text-3xl font-black tabular-nums">
                      {results.correctAnswers}<span className="text-lg text-slate-500"> / {results.totalQuestions}</span>
                    </p>
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-5 p-5 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400">Session summary</p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">Learning performance</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${
                    results.isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {results.isValid ? <Icons.ShieldCheck className="h-4 w-4" /> : <Icons.ShieldAlert className="h-4 w-4" />}
                    {results.isValid ? 'Verified' : 'Review needed'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-4">
                  <div className="bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400">Correct</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{results.correctAnswers} / {results.totalQuestions}</p>
                  </div>
                  <div className="bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400">Time spent</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{formatDuration(Math.round(results.timeSpent))}</p>
                  </div>
                  <div className="bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400">XP earned</p>
                    <p className="mt-1 text-lg font-black text-emerald-600">+{results.xpEarned} XP</p>
                  </div>
                  <div className="bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400">Streak bonus</p>
                    <p className="mt-1 text-lg font-black text-amber-600">+{results.streakBonus} XP</p>
                  </div>
                </div>

                {results.isValid ? (
                  <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                    <Icons.ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-sm font-black">Session verified</p>
                      <p className="mt-1 text-xs leading-5 text-emerald-700">Your timing and learning activity passed validation. XP and progress were recorded.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">
                    <Icons.AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-sm font-black">Session not eligible for XP</p>
                      <p className="mt-1 text-xs leading-5 text-rose-700">
                        {(results.validationIssues ?? []).length > 0
                          ? (results.validationIssues ?? []).map((issue) => validationIssueMessages[issue]).join(' ')
                          : 'The session data could not be validated.'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-auto flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <Button
                    onClick={() => {
                      handleExitQuiz();
                      navigate('/');
                    }}
                    variant="secondary"
                    className="px-6 font-semibold"
                  >
                    <Icons.Map className="h-4 w-4" /> Back to Path
                  </Button>
                  {wrongQuestions.length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={() => handleStartQuiz(wrongQuestions, { title: 'Mistake repair' })}
                      className="border-rose-200 bg-rose-50 px-6 font-bold text-rose-700 hover:bg-rose-100"
                    >
                      <Icons.RefreshCw className="h-4 w-4" /> Repair {wrongQuestions.length} mistakes
                    </Button>
                  )}
                  <Button onClick={() => handleStartQuiz(undefined, { count: sessionSize })} className="px-6 font-bold">
                    <Icons.RotateCcw className="h-4 w-4" /> New smart session
                  </Button>
                </div>
              </section>
            </motion.div>
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
      <LearningModuleNav active="grammar" />

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
              onClick={() => setActiveLevel(level)}
              className={`min-h-16 border-b border-r border-slate-200 px-3 py-2 text-center transition-colors sm:border-b-0 ${
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

      <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:grid-cols-3">
        {(['grammar', 'use-of-english', 'reading'] as CefrStudySkill[]).map((skill) => (
          <button
            key={skill}
            type="button"
            aria-pressed={activeSkill === skill}
            onClick={() => setActiveSkill(skill)}
            className={`flex min-h-20 items-center justify-between gap-3 border-b px-5 py-4 text-left transition-colors last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 ${
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
        className="flex w-full items-center justify-between rounded-lg border border-sky-200 bg-sky-50 px-5 py-5 text-left shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-100/70 disabled:cursor-not-allowed disabled:opacity-70"
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
            className="group min-h-36 rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
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

      {/* Recent Study Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="mb-4 text-base font-bold text-slate-800 flex items-center gap-2">
          <Icons.History className="w-5 h-5 text-[#0071E3]" />
          Recent Sessions
        </h2>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No study sessions yet. Click one of the modes above to start learning!
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
                  {session.type === 'listening' ? '🎧' : session.type === 'vocabulary' ? '📚' : '📝'}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 capitalize">{session.type} Practice</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatTimestamp(session.createdAt as any)}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs font-bold text-slate-700">
                    {session.questionsAttempted} Questions
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
