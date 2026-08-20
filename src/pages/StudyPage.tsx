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
import type { Question, QuestionAnswer } from '@/types/question';
import { formatTimestamp, formatDuration, getAccuracyColor } from '@/utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import * as Icons from 'lucide-react';
import {
  buildMistakeReviewDeck,
  generateSmartQuizSession,
  getUserQuestionProgress,
} from '@/services/progress';
import SessionReviewModal from '@/components/study/SessionReviewModal';
import {
  LearningIntro,
  LearningModuleNav,
  LearningSectionHeading,
  WorkspaceSearch,
} from '@/components/study/LearningWorkspace';
import { getBundledQuestionCount, getBundledTopics } from '@/data/questionBank';

type ToeicReadingPart = 5 | 6 | 7;

const partMeta: Record<ToeicReadingPart, { title: string; shortTitle: string; description: string }> = {
  5: {
    title: 'Incomplete Sentences',
    shortTitle: 'Grammar',
    description: 'Build accuracy with grammar, word forms, and business vocabulary in individual sentences.',
  },
  6: {
    title: 'Text Completion',
    shortTitle: 'Text completion',
    description: 'Choose language that completes emails, notices, memos, and other workplace texts.',
  },
  7: {
    title: 'Reading Comprehension',
    shortTitle: 'Reading',
    description: 'Read practical workplace documents and answer detail, purpose, and inference questions.',
  },
};

const topicLabels: Record<string, string> = {
  'subject-verb-agreement': 'Subject-verb agreement',
  'infinitives-gerunds': 'Infinitives & gerunds',
  'passive-voice': 'Active & passive voice',
  'verb-tenses': 'Verb tenses',
  'modal-verbs': 'Modal verbs',
  'word-forms': 'Word forms',
  'customer-service': 'Customer service',
  advertisements: 'Advertisements',
  comparisons: 'Comparisons',
  conjunctions: 'Conjunctions',
  participles: 'Participles',
  prepositions: 'Prepositions',
  reservations: 'Reservations',
  schedules: 'Schedules',
  subjunctive: 'Subjunctive',
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
  const [selectedReviewSession, setSelectedReviewSession] = useState<StudySession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePart, setActivePart] = useState<ToeicReadingPart>(5);
  const [practiceTitle, setPracticeTitle] = useState('Part 5 mixed practice');

  // Active quiz session states
  const [quizActive, setQuizActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Session duration timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(0);
  const finishInProgressRef = useRef(false);
  const activeSessionIdRef = useRef<string | null>(null);

  const { setStudySessionActive } = useUIStore();

  useEffect(() => {
    activeSessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => () => cancelStudySession(activeSessionIdRef.current), []);

  // Synchronize active study session state with layout
  useEffect(() => {
    setStudySessionActive(quizActive && !results);
    return () => {
      setStudySessionActive(false);
    };
  }, [quizActive, results, setStudySessionActive]);

  // Intercept back button gestures and browser back navigation using popstate
  useEffect(() => {
    const active = quizActive && !results;
    if (!active) return;

    // Push dummy history entry so back button pops it instead of navigating away
    window.history.pushState({ preventBack: true }, '');

    const handlePopState = (e: PopStateEvent) => {
      const confirmExit = window.confirm(
        'Thoát học? Tiến trình làm bài hiện tại sẽ không được lưu. (Exit session? Current progress will not be saved.)'
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
    const part = Number(new URLSearchParams(location.search).get('part'));
    if (part === 5 || part === 6 || part === 7) setActivePart(part);
  }, [location.search]);

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
    filters: { part?: ToeicReadingPart; topic?: string; count?: number; title?: string } = {},
  ) => {
    if (!profile?.uid) return;
    try {
      setLoadingQuestions(true);
      let list: Question[] = [];

      if (customQuestions && customQuestions.length > 0) {
        list = customQuestions;
        setPracticeTitle(filters.title ?? 'Review practice');
      } else {
        const targetPart = filters.part ?? activePart;
        const allQuestions = await fetchQuestions({
          exam: 'toeic',
          part: targetPart,
          topic: filters.topic,
          count: 250,
        });
        
        if (allQuestions.length === 0) {
          toast.error('No practice questions available in database yet. Try importing CSV data first!');
          setLoadingQuestions(false);
          return;
        }

        list = await generateSmartQuizSession(profile.uid, allQuestions, filters.count ?? 10);
        setPracticeTitle(
          filters.topic
            ? `Part ${targetPart} · ${formatTopic(filters.topic)}`
            : `Part ${targetPart} mixed practice`,
        );

        if (list.length === 0) {
          toast('Bạn đã hoàn thành hết câu hỏi hiện có! Hãy quay lại sau hoặc chờ thêm câu hỏi mới.\nYou\'ve completed all available questions!', {
            icon: '🎉',
            duration: 5000,
          });
          setLoadingQuestions(false);
          return;
        }
      }

      const activeSessionId = await startStudySession(profile.uid, 'toeic', 'quiz');
      setSessionId(activeSessionId);
      setQuestions(list);
      setCurrentIndex(0);
      setAnswers([]);
      setSelectedChoice(null);
      setIsAnswerSubmitted(false);
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
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setSelectedChoice(null);
      setIsAnswerSubmitted(false);
      setCurrentIndex((prev) => prev + 1);
      questionStartTimeRef.current = Date.now();
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    if (!sessionId || !profile?.uid || finishInProgressRef.current) return;
    finishInProgressRef.current = true;
    try {
      setLoadingQuestions(true);
      const sessionResults = await endStudySession(
        sessionId,
        profile.uid,
        answers,
        profile.currentStreak
      );
      setResults(sessionResults);
      toast.success('Quiz completed! 🎉');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save quiz results.');
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
        fetchQuestions({ exam: 'toeic', count: 1000 }),
        getUserQuestionProgress(profile.uid),
      ]);
      const reviewDeck = buildMistakeReviewDeck(allQuestions, progressMap, 10);

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

  // Render Quiz flow
  if (quizActive) {
    const currentQuestion = questions[currentIndex];
    const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

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
                    <Badge variant="purple">TOEIC Part {currentQuestion?.part || 5}</Badge>
                    <Badge variant="info" className="capitalize">{currentQuestion?.topic || 'Business'}</Badge>
                  </div>
                  {currentQuestion?.difficulty && (
                    <Badge variant="warning" dot>
                      Target: {currentQuestion.difficulty}
                    </Badge>
                  )}
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
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
                    </motion.div>
                  );
                })()}

                <div className="mt-auto flex justify-end border-t border-slate-200 pt-4">
                  {!isAnswerSubmitted ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={selectedChoice === null}
                      className="w-full px-8 font-bold sm:w-auto"
                    >
                      <Icons.Check className="h-4 w-4" /> Submit Answer
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
                  <Button onClick={() => handleStartQuiz()} className="px-6 font-bold">
                    <Icons.RotateCcw className="h-4 w-4" /> Practice Again
                  </Button>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const filteredGrammarTopics = getBundledTopics(activePart).filter((topic) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return formatTopic(topic.topic).toLowerCase().includes(term);
  });

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4 pb-8 text-slate-800">
      <section className="min-w-0 space-y-4">
      <LearningModuleNav active="grammar" />

      <LearningIntro
        eyebrow="TOEIC Reading"
        title={`Part ${activePart}: ${partMeta[activePart].title}`}
        description={partMeta[activePart].description}
        icon={activePart === 7 ? Icons.Newspaper : activePart === 6 ? Icons.Files : Icons.BookOpen}
        accent="emerald"
        aside={(
          <div className="w-full">
            <p className="text-[10px] font-bold uppercase text-slate-400">Question bank</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{getBundledQuestionCount(activePart)}</p>
            <p className="mt-1 text-xs text-slate-500">verified practice questions</p>
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
          <p className="text-xs font-medium text-slate-500">Short sessions based on what needs attention now</p>
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
              <span className="mt-1 block text-xs leading-5 text-slate-500">Retry unresolved answers</span>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-black text-rose-600">
                Review <Icons.ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleStartQuiz(undefined, { part: activePart, count: 10 })}
            disabled={loadingQuestions}
            className="group flex min-h-28 items-start gap-3 border-b border-slate-200 p-4 text-left transition-colors hover:bg-sky-50 disabled:cursor-wait disabled:opacity-60 xl:border-b-0 xl:border-r"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-100 text-sky-700">
              <Icons.Sparkles className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-black text-slate-900">Smart mix</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">New, weak, and review items</span>
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

      <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:grid-cols-3">
        {([5, 6, 7] as ToeicReadingPart[]).map((part) => (
          <button
            key={part}
            type="button"
            aria-pressed={activePart === part}
            onClick={() => setActivePart(part)}
            className={`flex min-h-20 items-center justify-between gap-3 border-b px-5 py-4 text-left transition-colors last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 ${
              activePart === part ? 'bg-slate-950 text-white' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>
              <span className={`block text-[10px] font-bold uppercase ${activePart === part ? 'text-sky-300' : 'text-sky-700'}`}>
                TOEIC Part {part}
              </span>
              <span className="mt-1 block text-sm font-black">{partMeta[part].shortTitle}</span>
            </span>
            <span className={`text-xs font-bold ${activePart === part ? 'text-slate-400' : 'text-slate-400'}`}>200 Q</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => handleStartQuiz(undefined, { part: activePart, count: 10 })}
        disabled={loadingQuestions}
        className="flex w-full items-center justify-between rounded-lg border border-sky-200 bg-sky-50 px-5 py-5 text-left shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-100/70 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white text-sky-600 shadow-sm">
            <Icons.Shuffle className="h-7 w-7" />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-black text-slate-900">Smart mixed practice</span>
            <span className="block text-sm font-medium text-slate-500">10 questions from Part {activePart}, balanced from new, weak, and review items</span>
          </span>
        </span>
        <span className="ml-4 hidden rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm sm:inline-flex">
          {loadingQuestions ? 'Loading...' : 'Start'}
        </span>
      </button>

      <WorkspaceSearch
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder={`Search Part ${activePart} topics...`}
      />

      <LearningSectionHeading
        title={`Part ${activePart} topics`}
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
            onClick={() => handleStartQuiz(undefined, { part: activePart, topic: topic.topic, count: 10 })}
            className="group min-h-36 rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-black text-slate-900">{formatTopic(topic.topic)}</h3>
                <p className="mt-1 text-xs font-medium text-slate-500">Focused Part {activePart} practice</p>
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
                <p className="mt-5 text-xs font-bold text-slate-500">10 per smart session</p>
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
