import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { cancelStudySession, endStudySession, fetchQuestions, startStudySession } from '@/services/study';
import { generateSmartQuizSession } from '@/services/progress';
import { formatDuration } from '@/utils/helpers';
import type { AnswerConfidence, Question, QuestionAnswer } from '@/types/question';
import type { SessionResults } from '@/types/study';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import {
  LearningIntro,
  LearningModuleNav,
  LearningStats,
} from '@/components/study/LearningWorkspace';
import { getBundledQuestionCount } from '@/data/questionBank';
import type { CefrLevel } from '@/types/cefr';
import { CEFR_LEVELS, CEFR_LEVEL_META, getCefrDifficulty, getCurrentCefrLevel } from '@/types/cefr';

type ListeningMode = 'conversations' | 'talks';

const listeningModes: Array<{
  id: ListeningMode;
  part: number;
  title: string;
  viTitle: string;
  description: string;
  icon: typeof Icons.MessagesSquare;
  tone: string;
}> = [
  {
    id: 'conversations',
    part: 3,
    title: 'Conversations & Dialogues',
    viTitle: 'Hội thoại giao tiếp B2',
    description: 'Listen to authentic multi-speaker conversations and identify details, intent, and conclusions.',
    icon: Icons.MessagesSquare,
    tone: 'bg-sky-50 text-sky-700 border-sky-100',
  },
  {
    id: 'talks',
    part: 4,
    title: 'Talks & Presentations',
    viTitle: 'Thuyết trình & Bài nói B2',
    description: 'Practice comprehension with lectures, informative broadcasts, and structured presentations.',
    icon: Icons.Radio,
    tone: 'bg-violet-50 text-violet-700 border-violet-100',
  },
];

function formatClock(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

export default function ListeningPage() {
  const { profile } = useAuthStore();
  const { setStudySessionActive } = useUIStore();
  const [active, setActive] = useState(false);
  const [selectedPart, setSelectedPart] = useState<number>(3);
  const [activeLevel, setActiveLevel] = useState<CefrLevel>(() => getCurrentCefrLevel(profile));
  const [sessionSize, setSessionSize] = useState<5 | 10 | 20>(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [answerConfidence, setAnswerConfidence] = useState<AnswerConfidence | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartRef = useRef(0);
  const activeSessionIdRef = useRef<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const wrongQuestionIds = new Set(answers.filter((answer) => !answer.isCorrect).map((answer) => answer.questionId));
  const wrongQuestions = questions.filter((question) => wrongQuestionIds.has(question.id));

  useEffect(() => {
    activeSessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => () => cancelStudySession(activeSessionIdRef.current), []);

  useEffect(() => {
    setStudySessionActive(active && !results);
    return () => setStudySessionActive(false);
  }, [active, results, setStudySessionActive]);

  useEffect(() => {
    if (!active || results) return;
    timerRef.current = setInterval(() => setSecondsElapsed((value) => value + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, results]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const stopSpeech = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const playTranscript = () => {
    if (!currentQuestion?.transcript || !('speechSynthesis' in window)) {
      toast.error('Speech playback is not supported on this device.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.transcript);
    utterance.lang = 'en-US';
    utterance.rate = speechRate;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => voice.lang === 'en-US') ?? voices.find((voice) => voice.lang.startsWith('en')) ?? null;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setAnswerConfidence(null);
    setShowTranscript(false);
    questionStartRef.current = Date.now();
    stopSpeech();
  };

  const startPractice = async (part: number, customQuestions?: Question[]) => {
    if (!profile?.uid) return;
    try {
      setLoading(true);
      const pool = customQuestions ?? await fetchQuestions({ exam: 'cefr', cefrLevel: activeLevel, type: 'listening', part, count: 250 });
      const deck = customQuestions ?? await generateSmartQuizSession(profile.uid, pool, sessionSize, {
        targetDifficulty: getCefrDifficulty(activeLevel),
      });
      if (deck.length === 0) {
        toast.error(`No CEFR ${activeLevel} listening questions are available for this mode.`);
        return;
      }

      const id = await startStudySession(profile.uid, 'cefr', 'listening');
      setSelectedPart(part);
      setQuestions(deck);
      setSessionId(id);
      setCurrentIndex(0);
      setAnswers([]);
      setResults(null);
      setSecondsElapsed(0);
      setActive(true);
      resetQuestionState();
    } catch (error) {
      console.error(error);
      toast.error('Could not start listening practice.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = () => {
    if (!currentQuestion || selectedAnswer === null || isAnswerSubmitted) return;
    const answer: QuestionAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      timeSpent: Math.max(0, (Date.now() - questionStartRef.current) / 1000),
    };
    setAnswers((items) => [...items, answer]);
    setIsAnswerSubmitted(true);
    setAnswerConfidence(null);
    stopSpeech();
  };

  const handleConfidence = (confidence: AnswerConfidence) => {
    setAnswerConfidence(confidence);
    setAnswers((previous) => previous.map((answer) =>
      answer.questionId === currentQuestion?.id ? { ...answer, confidence } : answer
    ));
  };

  const finishPractice = async () => {
    if (!profile?.uid || !sessionId || loading) return;
    try {
      setLoading(true);
      const summary = await endStudySession(sessionId, profile.uid, answers, profile.currentStreak);
      setResults(summary);
      stopSpeech();
      toast.success('Listening session completed.');
    } catch (error) {
      console.error(error);
      toast.error('Could not save listening progress.');
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex >= questions.length - 1) {
      void finishPractice();
      return;
    }
    setCurrentIndex((value) => value + 1);
    resetQuestionState();
  };

  const exitPractice = () => {
    if (!results && answers.length > 0 && !window.confirm('Exit listening practice? Current progress will not be saved.')) return;
    cancelStudySession(sessionId);
    stopSpeech();
    setActive(false);
    setQuestions([]);
    setSessionId(null);
    setResults(null);
    setAnswers([]);
  };

  useEffect(() => {
    if (!active || results) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target?.tagName ?? '')) return;

      if (!isAnswerSubmitted && ['1', '2', '3', '4'].includes(event.key)) {
        const choice = Number(event.key) - 1;
        if (choice < (currentQuestion?.choices.length ?? 0)) {
          event.preventDefault();
          setSelectedAnswer(choice);
        }
      }

      if (event.key === 'Enter') {
        if (!isAnswerSubmitted && selectedAnswer !== null) {
          event.preventDefault();
          submitAnswer();
        } else if (isAnswerSubmitted && !loading) {
          event.preventDefault();
          nextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, currentQuestion, isAnswerSubmitted, loading, results, selectedAnswer]);

  if (!active) {
    return (
      <div className="mx-auto w-full max-w-[1440px] space-y-4 pb-8 text-slate-800">
        <LearningModuleNav active="listening" />
        <LearningIntro
          eyebrow={`CEFR ${activeLevel} Listening`}
          title="Listening Studio"
          description="Train with short, focused audio sessions. Listen first, answer from memory, then open the transcript to review unfamiliar phrases."
          icon={Icons.Headphones}
          accent="violet"
          aside={(
            <div className="w-full">
              <p className="text-[10px] font-bold uppercase text-slate-400">Listening bank</p>
              <p className="mt-1 text-3xl font-black text-slate-950">200</p>
              <p className="mt-1 text-xs text-slate-500">questions with transcripts</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-violet-700">
                <Icons.Volume2 className="h-4 w-4" /> Device voice playback
              </div>
            </div>
          )}
        />

        <LearningStats
          items={[
            { label: 'Conversations', value: getBundledQuestionCount(3, undefined, activeLevel), detail: `${activeLevel} dialogue questions`, icon: Icons.MessagesSquare, tone: 'blue' },
            { label: 'Short talks', value: getBundledQuestionCount(4, undefined, activeLevel), detail: `${activeLevel} monologue questions`, icon: Icons.Radio, tone: 'violet' },
            { label: 'Session size', value: sessionSize, detail: 'Questions per practice', icon: Icons.ListChecks, tone: 'emerald' },
            { label: 'Review mode', value: 'Adaptive', detail: 'Due + new + weak', icon: Icons.Brain, tone: 'amber' },
          ]}
        />

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-3">
            <p className="text-[10px] font-black uppercase text-violet-700">Listening level</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6">
            {CEFR_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={activeLevel === level}
                onClick={() => setActiveLevel(level)}
                className={`min-h-16 border-b border-r border-slate-200 px-3 py-2 transition-colors sm:border-b-0 ${
                  activeLevel === level ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-violet-50'
                }`}
              >
                <span className="block text-lg font-black">{level}</span>
                <span className={`block text-[9px] font-bold ${activeLevel === level ? 'text-violet-100' : 'text-slate-400'}`}>
                  {CEFR_LEVEL_META[level].title}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase text-violet-700">Session length</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{sessionSize} questions · adaptive queue</p>
          </div>
          <div className="flex rounded-md bg-slate-100 p-1" role="group" aria-label="Listening session size">
            {([5, 10, 20] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSessionSize(size)}
                aria-pressed={sessionSize === size}
                className={`min-w-12 rounded px-3 py-1.5 text-xs font-black transition-colors ${
                  sessionSize === size ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {listeningModes.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => startPractice(item.part)}
                disabled={loading}
                className="group flex min-h-48 flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md disabled:cursor-wait disabled:opacity-60"
              >
                <div className="flex w-full items-start justify-between gap-4">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-md border ${item.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-slate-400">{getBundledQuestionCount(item.part, undefined, activeLevel)} questions</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-sky-700">{item.viTitle}</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">{item.title}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-sky-700">
                    Start practice <Icons.ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            );
          })}
        </section>
      </div>
    );
  }

  if (results) {
    return (
      <div className="mx-auto w-full max-w-3xl pb-8 text-slate-800">
        <Card className="space-y-6 rounded-lg border border-slate-200 bg-white p-7 text-center shadow-md">
          <div>
            <p className="text-[10px] font-bold uppercase text-violet-700">CEFR {activeLevel} · {listeningModes.find((item) => item.part === selectedPart)?.title}</p>
            <h1 className="mt-2 text-2xl font-black text-slate-950">Listening results</h1>
          </div>
          <div className="mx-auto flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-violet-500 bg-violet-50">
            <p className="text-3xl font-black text-slate-950">{results.accuracy}%</p>
            <p className="text-[10px] font-bold uppercase text-slate-500">Accuracy</p>
          </div>
          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 sm:grid-cols-4">
            {[
              ['Correct', `${results.correctAnswers}/${results.totalQuestions}`],
              ['Time', formatDuration(results.timeSpent)],
              ['XP earned', `+${results.xpEarned}`],
              ['Streak bonus', `+${results.streakBonus}`],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-r border-slate-200 p-4 last:border-r-0 sm:border-b-0">
                <p className="text-[9px] font-bold uppercase text-slate-400">{label}</p>
                <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          {!results.isValid && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-left text-xs text-rose-700">
              <Icons.AlertTriangle className="h-5 w-5 shrink-0" />
              <p>This session did not meet the timing or activity requirements, so XP was not awarded.</p>
            </div>
          )}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="secondary" onClick={exitPractice}>Back to listening</Button>
            {wrongQuestions.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => startPractice(selectedPart, wrongQuestions)}
                className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              >
                Repair {wrongQuestions.length} mistakes
              </Button>
            )}
            <Button onClick={() => startPractice(selectedPart)} isLoading={loading}>Practice again</Button>
          </div>
        </Card>
      </div>
    );
  }

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-8 text-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <button onClick={exitPractice} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">
          <Icons.X className="h-4 w-4" /> Exit
        </button>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          <span>CEFR {currentQuestion?.cefrLevel ?? activeLevel}</span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1"><Icons.Timer className="h-4 w-4 text-violet-600" /> {formatClock(secondsElapsed)}</span>
          <span className="text-slate-300">|</span>
          <span className="text-violet-700">{currentIndex + 1}/{questions.length}</span>
        </div>
      </div>
      <Progress value={progress} height="sm" />

      <section className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={isSpeaking ? stopSpeech : playTranscript}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-slate-950 transition-transform hover:scale-105"
            aria-label={isSpeaking ? 'Stop audio' : 'Play audio'}
          >
            {isSpeaking ? <Icons.Square className="h-5 w-5" fill="currentColor" /> : <Icons.Play className="ml-0.5 h-6 w-6" fill="currentColor" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase text-sky-300">Listen before answering</p>
            <p className="mt-1 text-sm text-slate-300">Use replay when needed. The transcript unlocks after you submit.</p>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
            Speed
            <select
              value={speechRate}
              onChange={(event) => setSpeechRate(Number(event.target.value))}
              className="rounded-md border border-white/15 bg-white/10 px-2 py-1.5 text-white outline-none"
            >
              <option className="text-slate-950" value={0.75}>0.75x</option>
              <option className="text-slate-950" value={0.9}>0.9x</option>
              <option className="text-slate-950" value={1}>1.0x</option>
              <option className="text-slate-950" value={1.15}>1.15x</option>
            </select>
          </label>
        </div>
      </section>

      <AnimatePresence mode="wait">
        <motion.section
          key={currentQuestion?.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <p className="text-[10px] font-bold uppercase text-sky-700">Question {currentIndex + 1}</p>
            <h1 className="mt-2 text-xl font-black leading-7 text-slate-950">{currentQuestion?.question}</h1>
          </div>
          <div className="grid gap-2">
            {currentQuestion?.choices.map((choice, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = currentQuestion.correctAnswer === index;
              let style = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
              if (isSelected && !isAnswerSubmitted) style = 'border-sky-500 bg-sky-50 text-sky-800';
              if (isAnswerSubmitted && isCorrect) style = 'border-emerald-500 bg-emerald-50 text-emerald-800';
              if (isAnswerSubmitted && isSelected && !isCorrect) style = 'border-rose-500 bg-rose-50 text-rose-800';
              if (isAnswerSubmitted && !isSelected && !isCorrect) style = 'border-slate-100 bg-slate-50 text-slate-400';
              return (
                <button
                  key={choice}
                  type="button"
                  disabled={isAnswerSubmitted}
                  onClick={() => setSelectedAnswer(index)}
                  className={`flex min-h-14 items-center gap-3 rounded-lg border p-4 text-left text-sm font-semibold transition-colors ${style}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-black">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{choice}</span>
                  {isAnswerSubmitted && isCorrect && <Icons.Check className="h-5 w-5" />}
                  {isAnswerSubmitted && isSelected && !isCorrect && <Icons.X className="h-5 w-5" />}
                </button>
              );
            })}
          </div>

          {isAnswerSubmitted && (
            <div className="space-y-3">
              <div className="space-y-3 rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-slate-700">
                <p className="font-bold text-sky-800">Explanation</p>
                <p>{currentQuestion?.explanation}</p>
                <button
                  type="button"
                  onClick={() => setShowTranscript((value) => !value)}
                  className="inline-flex items-center gap-1 text-xs font-black text-sky-700"
                >
                  <Icons.FileText className="h-4 w-4" /> {showTranscript ? 'Hide transcript' : 'Review transcript'}
                </button>
                {showTranscript && (
                  <div className="whitespace-pre-line border-t border-sky-200 pt-3 text-slate-600">
                    {currentQuestion?.transcript}
                  </div>
                )}
              </div>
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
            </div>
          )}

          <div className="flex justify-end pt-1">
            {!isAnswerSubmitted ? (
              <Button onClick={submitAnswer} disabled={selectedAnswer === null}>Submit answer</Button>
            ) : (
              <Button onClick={nextQuestion} isLoading={loading}>
                {currentIndex < questions.length - 1 ? 'Next question' : 'Finish session'}
              </Button>
            )}
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
