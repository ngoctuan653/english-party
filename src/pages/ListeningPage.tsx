/**
 * @module ListeningPage
 * @description Listening practice with audio player, set selection, questions, and transcript toggle.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { startStudySession, endStudySession } from '@/services/study';
import { formatDuration } from '@/utils/helpers';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import type { SessionResults } from '@/types/study';
import type { QuestionAnswer } from '@/types/question';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

/* -------------------------------------------------------------------------- */
/*                                 Mock Data                                  */
/* -------------------------------------------------------------------------- */

const listeningSets = [
  { id: 1, title: 'Office Conversation', duration: '2:45', questions: 6, difficulty: 'Intermediate', icon: '🏢' },
  { id: 2, title: 'Phone Inquiry', duration: '1:30', questions: 4, difficulty: 'Beginner', icon: '📞' },
  { id: 3, title: 'Business Meeting', duration: '3:10', questions: 8, difficulty: 'Advanced', icon: '💼' },
  { id: 4, title: 'Travel Announcement', duration: '1:55', questions: 5, difficulty: 'Intermediate', icon: '✈️' },
];

const mockQuestion = {
  id: 'listening_set_1_q1',
  text: 'What does the man suggest?',
  options: [
    'A) Rescheduling the meeting',
    'B) Hiring more staff',
    'C) Ordering new equipment',
    'D) Extending the deadline',
  ],
  correctAnswer: 0, // Option A
};

const mockTranscript = `Man: Good morning, Susan. I was looking at the schedule for next week, and it seems like we have a conflict on Tuesday.

Woman: Oh, you're right. The client presentation and the team meeting are at the same time. What do you suggest?

Man: I think we should reschedule the team meeting to Wednesday afternoon. The client presentation is more urgent.

Woman: That works for me. I'll send out the updated calendar invite.`;

/* -------------------------------------------------------------------------- */
/*                               Component                                    */
/* -------------------------------------------------------------------------- */

export default function ListeningPage() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [activeSet, setActiveSet] = useState(1);

  // Session states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [saving, setSaving] = useState(false);

  // Timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Start study session
  useEffect(() => {
    async function startSession() {
      if (!profile?.uid || sessionId) return;
      try {
        const id = await startStudySession(profile.uid, 'toeic', 'listening');
        setSessionId(id);
        startTimeRef.current = Date.now();
      } catch (err) {
        console.error('Failed to start listening session:', err);
      }
    }
    if (profile?.uid) {
      startSession();
    }
  }, [profile?.uid, activeSet]);

  // Session timer
  useEffect(() => {
    if (sessionId && !results) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId, results]);

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
  };

  const handleFinishListening = async () => {
    if (!sessionId || !profile?.uid || selectedAnswer === null || saving) return;
    try {
      setSaving(true);
      const isCorrect = selectedAnswer === mockQuestion.correctAnswer;
      const timeSpent = (Date.now() - startTimeRef.current) / 1000;

      const answerRecord: QuestionAnswer = {
        questionId: mockQuestion.id,
        selectedAnswer: selectedAnswer,
        isCorrect,
        timeSpent,
      };

      const sessionResults = await endStudySession(
        sessionId,
        profile.uid,
        [answerRecord],
        profile.currentStreak
      );
      setResults(sessionResults);
      toast.success('Listening set completed! 🎉');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save listening progress.');
    } finally {
      setSaving(false);
    }
  };

  const handleExitListening = () => {
    if (results || selectedAnswer === null || window.confirm('Exit session? Current progress will not be saved.')) {
      navigate('/study');
    }
  };

  // If results are available, render completion screen
  if (results) {
    return (
      <div className="max-w-md mx-auto pb-8 text-slate-800 animate-fade-in space-y-6 text-center">
        <Card className="p-8 bg-white border border-slate-200/80 shadow-md space-y-6">
          <h2 className="text-2xl font-black text-slate-800">Listening Results</h2>
          
          <div className="w-32 h-32 mx-auto rounded-full bg-slate-50 border-4 border-teal-500 flex flex-col justify-center items-center relative overflow-hidden shadow-md shadow-teal-500/5">
            <div className="absolute inset-0 bg-teal-500/3 blur-xl" />
            <p className="text-3xl font-black text-slate-800 relative z-10">{results.accuracy}%</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase relative z-10 font-sans">Accuracy</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-[9px] text-slate-400 font-bold uppercase">Time Spent</p>
              <p className="text-xs font-black text-slate-800 mt-1">
                {formatDuration(results.timeSpent)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-[9px] text-slate-400 font-bold uppercase">XP Earned</p>
              <p className="text-xs font-black text-emerald-600 mt-1">
                +{results.xpEarned} XP
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-[9px] text-slate-400 font-bold uppercase">Streak Bonus</p>
              <p className="text-xs font-black text-amber-500 mt-1">
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
                  This session did not meet validation guidelines. XP rewards have been discarded.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center pt-2">
            <Link to="/study" className="flex-1">
              <Button variant="secondary" className="w-full font-semibold text-xs py-2">
                Back to Station
              </Button>
            </Link>
            <Button
              onClick={() => {
                setResults(null);
                setSessionId(null);
                setSecondsElapsed(0);
                setSelectedAnswer(null);
                setIsAnswerSubmitted(false);
                setShowTranscript(false);
              }}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2"
            >
              Practice Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 text-slate-800 max-w-2xl mx-auto">
      {/* Header toolbar */}
      <div className="flex justify-between items-center bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm">
        <button
          onClick={handleExitListening}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Icons.X className="w-4 h-4" /> Exit Practice
        </button>
        
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <Icons.Timer className="w-3.5 h-3.5 text-teal-500" />
            {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-teal-600 font-bold">
            Set {activeSet}
          </span>
        </div>

        {sessionId && isAnswerSubmitted && (
          <Button
            onClick={handleFinishListening}
            disabled={saving}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl cursor-pointer"
          >
            {saving ? 'Saving...' : 'Finish & Save'}
          </Button>
        )}
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          <span className="bg-gradient-to-r from-blue-600 to-[#0071E3] bg-clip-text text-transparent">
            Listening Practice
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-505">
          Improve your TOEIC listening comprehension skills
        </p>
      </div>

      {/* Listening Set Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {listeningSets.map((set) => (
          <motion.button
            key={set.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!isAnswerSubmitted || window.confirm('Switch set? Current set progress will not be saved.')) {
                setActiveSet(set.id);
                setSelectedAnswer(null);
                setIsAnswerSubmitted(false);
                setShowTranscript(false);
                setSessionId(null); // Will trigger a new session start
              }
            }}
            className={`rounded-2xl border p-4 text-left transition-all duration-205 cursor-pointer ${
              activeSet === set.id
                ? 'border-[#0071E3] bg-blue-50/50 shadow-sm'
                : 'border-slate-200/60 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="mb-2 block text-2xl">{set.icon}</span>
            <p className="text-sm font-semibold text-slate-800">{set.title}</p>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
              <span>⏱ {set.duration}</span>
              <span>·</span>
              <span>{set.questions} Q</span>
            </div>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                set.difficulty === 'Beginner'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : set.difficulty === 'Advanced'
                    ? 'bg-rose-50 text-rose-700 border-rose-100'
                    : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}
            >
              {set.difficulty}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Audio Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          {/* Play Button */}
          <button className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-md transition-all cursor-pointer">
            <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          {/* Progress Bar */}
          <div className="flex-1">
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/3 rounded-full bg-[#0071E3]" />
            </div>
            <div className="flex justify-between text-[11px] tabular-nums text-slate-505">
              <span>0:52</span>
              <span>2:45</span>
            </div>
          </div>

          {/* Volume */}
          <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:text-slate-800 cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
            </svg>
          </button>
        </div>

        {/* Playback Controls */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 cursor-pointer">
            ⏮ -10s
          </button>
          <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 cursor-pointer">
            0.75×
          </button>
          <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 cursor-pointer font-bold">
            1.0×
          </button>
          <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 cursor-pointer">
            1.25×
          </button>
          <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 cursor-pointer">
            +10s ⏭
          </button>
        </div>
      </motion.div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm"
      >
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Question 1 of 6 (Set {activeSet})
        </div>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">{mockQuestion.text}</h3>

        <div className="space-y-2">
          {mockQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === mockQuestion.correctAnswer;

            let borderClass = 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50 text-slate-700';
            if (isSelected && !isAnswerSubmitted) {
              borderClass = 'border-[#0071E3] bg-[#0071E3]/5 text-[#0071E3]';
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
                key={option}
                onClick={() => !isAnswerSubmitted && setSelectedAnswer(idx)}
                disabled={isAnswerSubmitted}
                className={`w-full rounded-xl border p-4 text-left text-sm font-medium transition-all duration-200 cursor-pointer ${borderClass}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 cursor-pointer"
          >
            {showTranscript ? '🔽 Hide Transcript' : '▶️ Show Transcript'}
          </button>
          
          {!isAnswerSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`rounded-xl bg-[#0071E3] hover:bg-[#0077ED] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleFinishListening}
              disabled={saving}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Finish & Save'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Transcript */}
      {showTranscript && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-3 text-sm font-semibold text-slate-800">📜 Transcript</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-650">
            {mockTranscript}
          </p>
        </motion.div>
      )}
    </div>
  );
}
