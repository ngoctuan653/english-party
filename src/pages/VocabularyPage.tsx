import { useEffect, useState, useRef } from 'react';
import { db } from '@/services/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { VocabWord } from '@/types/vocabulary';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { startStudySession, endStudySession } from '@/services/study';
import { formatDuration } from '@/utils/helpers';
import { toast } from 'react-hot-toast';
import type { SessionResults } from '@/types/study';
import type { QuestionAnswer } from '@/types/question';

export default function VocabularyPage() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTopic, setActiveTopic] = useState('all');
  const [isFlipped, setIsFlipped] = useState(false);

  // Session states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [viewedWordIds, setViewedWordIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wordStartTimeRef = useRef<number>(0);
  const answersRef = useRef<QuestionAnswer[]>([]);

  useEffect(() => {
    async function loadVocab() {
      try {
        setLoading(true);
        const snap = await getDocs(
          query(collection(db, 'vocabulary'), where('isActive', '==', true))
        );
        const list: VocabWord[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as VocabWord);
        });
        setWords(list);
      } catch (err) {
        console.error('Failed to load vocab words:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVocab();
  }, []);

  const filteredWords = words.filter(
    (w) => activeTopic === 'all' || w.topic.toLowerCase() === activeTopic.toLowerCase()
  );

  const currentWord = filteredWords[currentIndex];

  // Start study session
  useEffect(() => {
    async function startSession() {
      if (!profile?.uid || words.length === 0 || sessionId) return;
      try {
        const id = await startStudySession(profile.uid, 'toeic', 'vocabulary');
        setSessionId(id);
        wordStartTimeRef.current = Date.now();
        // Track the first word automatically
        const firstWord = filteredWords[0];
        if (firstWord) {
          setViewedWordIds(new Set([firstWord.id]));
          answersRef.current = [
            {
              questionId: firstWord.id,
              selectedAnswer: 0,
              isCorrect: true,
              timeSpent: 0.1,
            },
          ];
        }
      } catch (err) {
        console.error('Failed to start vocabulary session:', err);
      }
    }
    if (!loading && words.length > 0) {
      startSession();
    }
  }, [profile?.uid, loading, words.length]);

  // Session duration timer
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

  // Track word viewing
  const trackWordView = (wordId: string) => {
    if (!wordId) return;
    
    // Save time spent on the previous word
    const timeSpentOnPrev = (Date.now() - wordStartTimeRef.current) / 1000;
    if (answersRef.current.length > 0) {
      answersRef.current[answersRef.current.length - 1].timeSpent = Math.max(timeSpentOnPrev, 0.5);
    }
    
    wordStartTimeRef.current = Date.now();

    if (viewedWordIds.has(wordId)) return;

    setViewedWordIds((prev) => {
      const next = new Set(prev);
      next.add(wordId);
      return next;
    });

    answersRef.current.push({
      questionId: wordId,
      selectedAnswer: 0,
      isCorrect: true,
      timeSpent: 0.1, // Will be updated on next slide
    });
  };

  useEffect(() => {
    if (filteredWords.length > 0 && currentWord) {
      trackWordView(currentWord.id);
    }
  }, [currentIndex, activeTopic, filteredWords.length]);

  const handleNext = () => {
    if (currentIndex < filteredWords.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinishVocab = async () => {
    if (!sessionId || !profile?.uid || saving) return;
    try {
      setSaving(true);
      // Finalize time spent on the last word
      const lastTime = (Date.now() - wordStartTimeRef.current) / 1000;
      if (answersRef.current.length > 0) {
        answersRef.current[answersRef.current.length - 1].timeSpent = Math.max(lastTime, 0.5);
      }

      const sessionResults = await endStudySession(
        sessionId,
        profile.uid,
        answersRef.current,
        profile.currentStreak,
        { total: viewedWordIds.size, correct: viewedWordIds.size }
      );
      setResults(sessionResults);
      toast.success('Vocabulary session saved! 🎉');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save vocabulary session.');
    } finally {
      setSaving(false);
    }
  };

  const handleExitVocab = () => {
    if (results || viewedWordIds.size === 0 || window.confirm('Exit session? Current progress will not be saved.')) {
      navigate('/study');
    }
  };

  // Unique topics
  const topics = ['all', ...Array.from(new Set(words.map((w) => w.topic.toLowerCase())))];

  // Dummy status variables for layout stats
  const masteredCount = Math.round(words.length * 0.15); // mock derived
  const learningCount = Math.round(words.length * 0.25); // mock derived
  const remainingCount = words.length - masteredCount - learningCount;

  // Session completed view
  if (results) {
    return (
      <div className="max-w-md mx-auto pb-8 text-slate-800 animate-fade-in space-y-6 text-center">
        <Card className="p-8 bg-white border border-slate-200/80 shadow-md space-y-6">
          <h2 className="text-2xl font-black text-slate-800">Vocabulary Results</h2>
          
          <div className="w-32 h-32 mx-auto rounded-full bg-slate-50 border-4 border-violet-500 flex flex-col justify-center items-center relative overflow-hidden shadow-md shadow-violet-500/5">
            <div className="absolute inset-0 bg-violet-500/3 blur-xl" />
            <p className="text-3xl font-black text-slate-800 relative z-10">{viewedWordIds.size}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase relative z-10 font-sans">Words Studied</p>
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
                setViewedWordIds(new Set());
                answersRef.current = [];
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2"
            >
              Study Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 text-slate-800 max-w-xl mx-auto">
      {/* Header toolbar */}
      <div className="flex justify-between items-center bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm">
        <button
          onClick={handleExitVocab}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Icons.X className="w-4 h-4" /> Exit Vocabulary
        </button>
        
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <Icons.Timer className="w-3.5 h-3.5 text-violet-500" />
            {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-violet-600 font-bold">
            {viewedWordIds.size} words studied
          </span>
        </div>

        {sessionId && (
          <Button
            onClick={handleFinishVocab}
            disabled={saving}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl cursor-pointer"
          >
            {saving ? 'Saving...' : 'Finish & Save'}
          </Button>
        )}
      </div>

      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            <span className="bg-gradient-to-r from-blue-600 to-[#0071E3] bg-clip-text text-transparent">
              Vocabulary Deck
            </span>
          </h1>
          <p className="mt-1 text-xs text-slate-505">
            {words.length} words available · {masteredCount} mastered
          </p>
        </div>
      </div>

      {/* Topic filter */}
      <div className="flex flex-wrap gap-2 py-1">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => {
              setActiveTopic(topic);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all capitalize cursor-pointer ${
              activeTopic === topic
                ? 'border-[#0071E3] bg-[#0071E3]/8 text-[#0071E3]'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Deck Content */}
      {loading ? (
        <Card className="h-72 flex items-center justify-center bg-white border-slate-200/60 shadow-sm">
          <Skeleton className="h-48 w-full max-w-sm rounded-xl" />
        </Card>
      ) : filteredWords.length === 0 ? (
        <Card className="h-72 flex flex-col items-center justify-center p-6 bg-white border-slate-200/60 shadow-sm text-center space-y-3">
          <p className="text-slate-500 text-sm">No vocabulary terms in this category.</p>
          {profile?.role === 'admin' ? (
            <Link to="/admin/import">
              <Button size="sm" className="bg-[#0071E3] text-white">
                Import Vocabulary CSV
              </Button>
            </Link>
          ) : (
            <p className="text-xs text-slate-400">Ask your admin to upload TOEIC vocabulary lists.</p>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Card wrapper */}
          <div
            className="w-full cursor-pointer h-80"
            style={{ perspective: '1000px' }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              className="relative h-full w-full"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front Side */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white shadow-md p-8 text-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <Badge variant="purple" className="absolute right-4 top-4 text-[9px] uppercase font-bold tracking-wider">
                  {currentWord.topic}
                </Badge>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{currentWord.word}</h2>
                <p className="text-sm text-slate-500 mt-2">/{currentWord.pronunciation}/</p>
                <Badge variant="default" className="mt-3 capitalize text-[10px] font-bold">
                  {currentWord.partOfSpeech}
                </Badge>
                <p className="text-[10px] text-slate-400 mt-8 uppercase font-bold tracking-wider">
                  Tap to Reveal Definition
                </p>
              </div>

              {/* Back Side */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white shadow-md p-8 text-center"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <Badge variant="success" className="absolute right-4 top-4 text-[9px] uppercase font-bold">
                  Definition
                </Badge>

                <p className="text-lg font-bold text-slate-900 max-w-sm leading-relaxed">{currentWord.definition}</p>
                {currentWord.definitionNative && (
                  <p className="text-sm text-[#0071E3] font-semibold mt-1">{currentWord.definitionNative}</p>
                )}

                <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-3.5 mt-5 text-left">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Usage Example</p>
                  <p className="text-xs italic text-slate-700 mt-1 leading-relaxed">"{currentWord.example}"</p>
                  {currentWord.exampleTranslation && (
                    <p className="text-[10px] text-slate-505 mt-0.5">{currentWord.exampleTranslation}</p>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-wider">
                  Tap to Flip Back
                </p>
              </div>
            </motion.div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="secondary"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-5 py-2 text-xs font-bold"
            >
              <Icons.ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>

            <span className="text-xs font-bold text-slate-500 tabular-nums">
              {currentIndex + 1} / {filteredWords.length}
            </span>

            <Button
              variant="secondary"
              onClick={handleNext}
              disabled={currentIndex === filteredWords.length - 1}
              className="px-5 py-2 text-xs font-bold"
            >
              Next <Icons.ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Mini Progress Bars */}
          <Card className="p-4 bg-white border border-slate-200/60 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Vocab Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>Mastered</span>
                  <span className="text-emerald-600">{masteredCount}</span>
                </div>
                <Progress value={(masteredCount / words.length) * 100} height="sm" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>Learning</span>
                  <span className="text-amber-600">{learningCount}</span>
                </div>
                <Progress value={(learningCount / words.length) * 100} height="sm" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>Remaining</span>
                  <span className="text-slate-600">{remainingCount}</span>
                </div>
                <Progress value={(remainingCount / words.length) * 100} height="sm" />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
