import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { getRecentSessions, fetchQuestions, startStudySession, endStudySession } from '@/services/study';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import type { StudySession, SessionResults } from '@/types/study';
import type { Question, QuestionAnswer } from '@/types/question';
import { formatTimestamp, formatDuration, getAccuracyColor } from '@/utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import * as Icons from 'lucide-react';
import { generateSmartQuizSession } from '@/services/progress';
import SessionReviewModal from '@/components/study/SessionReviewModal';

interface StudyMode {
  id: string;
  icon: string;
  title: string;
  description: string;
  gradient: string;
  hoverGlow: string;
  route: string;
}

const studyModes: StudyMode[] = [
  {
    id: 'quiz',
    icon: '📝',
    title: 'Grammar Quiz',
    description: 'Practice TOEIC Part 5 multiple choice grammar questions',
    gradient: 'from-violet-600 to-purple-500',
    hoverGlow: 'group-hover:shadow-violet-500/30',
    route: 'quiz',
  },
  {
    id: 'vocabulary',
    icon: '📚',
    title: 'Vocabulary',
    description: 'Learn high-level TOEIC vocabulary words with flashcards',
    gradient: 'from-blue-600 to-blue-400',
    hoverGlow: 'group-hover:shadow-blue-500/30',
    route: '/study/vocabulary',
  },
  {
    id: 'listening',
    icon: '🎧',
    title: 'Listening',
    description: 'Improve TOEIC listening comprehension with full audio sets',
    gradient: 'from-teal-600 to-teal-400',
    hoverGlow: 'group-hover:shadow-teal-500/30',
    route: '/study/listening',
  },
];

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

  const { setStudySessionActive } = useUIStore();

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
  }, [quizActive, results]);

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

  // Catch retake questions from router state (e.g. from Profile page)
  useEffect(() => {
    if (location.state?.practiceQuestions) {
      const customQ = location.state.practiceQuestions as Question[];
      navigate(location.pathname, { replace: true });
      handleStartQuiz(customQ);
    }
  }, [location.state, navigate]);

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

  const handleStartQuiz = async (customQuestions?: Question[]) => {
    if (!profile?.uid) return;
    try {
      setLoadingQuestions(true);
      let list: Question[] = [];

      if (customQuestions && customQuestions.length > 0) {
        list = customQuestions;
      } else {
        // Fetch a larger pool of active TOEIC questions
        const allQuestions = await fetchQuestions({ exam: 'toeic', count: 50 });
        
        if (allQuestions.length === 0) {
          toast.error('No practice questions available in database yet. Try importing CSV data first!');
          setLoadingQuestions(false);
          return;
        }

        // Smart selection: 60% new, 25% weak, 15% review
        list = await generateSmartQuizSession(profile.uid, allQuestions, 5);

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
    if (!sessionId || !profile?.uid) return;
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
      setLoadingQuestions(false);
    }
  };

  const handleExitQuiz = () => {
    if (results || window.confirm('Exit quiz? Current progress will not be saved.')) {
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
      <div className="max-w-2xl mx-auto pb-8 text-slate-800 animate-fade-in space-y-6">
        {/* Header toolbar */}
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm">
          <button
            onClick={handleExitQuiz}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <Icons.X className="w-4 h-4" /> Exit Session
          </button>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <Icons.Timer className="w-3.5 h-3.5 text-[#0071E3]" />
              {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[#0071E3] font-bold">
              Question {currentIndex + 1} / {questions.length}
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
              className="space-y-6"
            >
              {/* Question Text */}
              <Card className="p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex gap-2">
                    <Badge variant="purple">TOEIC Part {currentQuestion?.part || 5}</Badge>
                    <Badge variant="info" className="capitalize">{currentQuestion?.topic || 'Business'}</Badge>
                  </div>
                  {currentQuestion?.difficulty && (
                    <Badge variant="warning" dot>
                      Target: {currentQuestion.difficulty}
                    </Badge>
                  )}
                </div>
                <h2 className="text-lg font-bold leading-relaxed text-slate-800">
                  {currentQuestion?.question}
                </h2>
              </Card>

              {/* Choices list */}
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion?.choices.map((choice, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedChoice === idx;
                  const isCorrect = idx === currentQuestion.correctAnswer;

                  let borderClass = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm';
                  if (isSelected && !isAnswerSubmitted) {
                    borderClass = 'border-[#0071E3] bg-[#0071E3]/5 text-[#0071E3] shadow-sm';
                  } else if (isAnswerSubmitted) {
                    if (isCorrect) {
                      borderClass = 'border-emerald-500 bg-emerald-50 text-emerald-700';
                    } else if (isSelected) {
                      borderClass = 'border-rose-500 bg-rose-50 text-rose-700';
                    } else {
                      borderClass = 'border-slate-100 bg-slate-50/50 opacity-40 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !isAnswerSubmitted && setSelectedChoice(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full rounded-2xl border p-4.5 text-left text-sm font-semibold transition-all flex items-center gap-4 cursor-pointer ${borderClass}`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected && !isAnswerSubmitted ? 'bg-[#0071E3] text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {letter}
                      </span>
                      <span>{choice}</span>
                      {isAnswerSubmitted && isCorrect && <Icons.Check className="w-5 h-5 ml-auto text-emerald-600" />}
                      {isAnswerSubmitted && isSelected && !isCorrect && <Icons.X className="w-5 h-5 ml-auto text-rose-600" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation section */}
              {isAnswerSubmitted && (() => {
                const { sentenceTranslation, viExpl } = parseExplanation(currentQuestion?.explanation);

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-5 bg-blue-50/40 border-blue-100 text-slate-700 space-y-3">
                      <p className="text-xs font-bold text-[#0071E3] uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-200/50 pb-2">
                        <Icons.Info className="w-4 h-4" /> Giải thích chi tiết
                      </p>
                      <div className="space-y-3 text-xs leading-relaxed">
                        {sentenceTranslation && (
                          <div>
                            <span className="inline-flex items-center gap-1 font-bold text-slate-805 mb-1">
                              🇻🇳 Dịch câu:
                            </span>
                            <p className="text-slate-700 font-medium">{sentenceTranslation}</p>
                          </div>
                        )}
                        {viExpl && (
                          <div className={sentenceTranslation ? "pt-2.5 border-t border-slate-200/50" : ""}>
                            <span className="inline-flex items-center gap-1 font-bold text-slate-805 mb-1">
                              🇻🇳 Giải thích:
                            </span>
                            <p className="text-slate-705">{viExpl}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })()}

              {/* Action trigger */}
              <div className="flex justify-end gap-3 pt-2">
                {!isAnswerSubmitted ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedChoice === null}
                    className="px-8 font-bold"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="px-8 font-bold"
                  >
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            // Results screen
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <Card className="p-8 bg-white border border-slate-200/80 shadow-md space-y-6">
                <h2 className="text-2xl font-black text-slate-800">Quiz Results</h2>
                
                {/* Accuracy percentage circle/badge */}
                <div className="w-32 h-32 mx-auto rounded-full bg-slate-50 border-4 border-[#0071E3] flex flex-col justify-center items-center relative overflow-hidden shadow-md shadow-[#0071E3]/5">
                  <div className="absolute inset-0 bg-[#0071E3]/3 blur-xl" />
                  <p className="text-3xl font-black text-slate-800 relative z-10">{results.accuracy}%</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase relative z-10">Accuracy</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-4 border-t border-slate-100">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Correct</p>
                    <p className="text-base font-black text-slate-800 mt-1">
                      {results.correctAnswers} / {results.totalQuestions}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Time Spent</p>
                    <p className="text-base font-black text-slate-800 mt-1">
                      {Math.round(results.timeSpent)}s
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">XP Earned</p>
                    <p className="text-base font-black text-emerald-600 mt-1">
                      +{results.xpEarned} XP
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Streak Bonus</p>
                    <p className="text-base font-black text-amber-500 mt-1">
                      +{results.streakBonus} XP
                    </p>
                  </div>
                </div>

                {!results.isValid && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs leading-relaxed text-left flex items-start gap-2">
                    <Icons.AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
                    <div>
                      <p className="font-bold">Session Flagged (Anti-Cheat)</p>
                      <p className="text-[10px] text-rose-600/80 mt-0.5">
                        This session did not meet validation guidelines (answering too fast, switching tabs, or inactive). XP rewards have been discarded.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-center pt-2">
                  <Button onClick={() => setQuizActive(false)} variant="secondary" className="px-6 font-semibold">
                    Back to Station
                  </Button>
                  <Button onClick={() => handleStartQuiz()} className="px-6 font-bold">
                    Retake Quiz
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 text-slate-800 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          <span className="bg-gradient-to-r from-blue-600 to-[#0071E3] bg-clip-text text-transparent">
            Choose Your Study Mode
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Pick a mode and start leveling up your English skills
        </p>
      </div>

      {/* Study Mode Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {studyModes.map((mode) => (
          <motion.div key={mode.id} variants={cardVariants}>
            {mode.route.startsWith('/') ? (
              <Link to={mode.route} className="block">
                <div
                  className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 hover:shadow-lg ${mode.hoverGlow}`}
                >
                  <div
                    className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${mode.gradient} opacity-10 blur-3xl transition-opacity duration-300 group-hover:opacity-20`}
                  />

                  <div className="relative">
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${mode.gradient} text-xl shadow-sm text-white`}
                    >
                      {mode.icon}
                    </div>

                    <h3 className="mb-1 text-sm font-bold text-slate-800">{mode.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[40px]">
                      {mode.description}
                    </p>

                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors group-hover:text-slate-800">
                      Start studying
                      <Icons.ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div onClick={() => handleStartQuiz()} className="cursor-pointer">
                <div
                  className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 hover:shadow-lg ${mode.hoverGlow}`}
                >
                  <div
                    className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${mode.gradient} opacity-10 blur-3xl transition-opacity duration-300 group-hover:opacity-20`}
                  />

                  <div className="relative">
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${mode.gradient} text-xl shadow-sm text-white`}
                    >
                      {mode.icon}
                    </div>

                    <h3 className="mb-1 text-sm font-bold text-slate-800">{mode.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[40px]">
                      {mode.description}
                    </p>

                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors group-hover:text-slate-800">
                      {loadingQuestions ? 'Loading...' : 'Start Quiz'}
                      <Icons.ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
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

      <SessionReviewModal
        isOpen={selectedReviewSession !== null}
        onClose={() => setSelectedReviewSession(null)}
        session={selectedReviewSession}
        onPracticeQuizAgain={handleStartQuiz}
      />
    </div>
  );
}
