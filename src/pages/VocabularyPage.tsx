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
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { startStudySession, endStudySession } from '@/services/study';
import { formatDuration } from '@/utils/helpers';
import { toast } from 'react-hot-toast';
import type { SessionResults } from '@/types/study';
import type { QuestionAnswer } from '@/types/question';
import type { VocabProgressRecord } from '@/types/progress';
import { generateSmartVocabSession } from '@/services/progress';

const getTopicMeta = (topic: string) => {
  const meta: Record<string, { emoji: string; gradient: string; hoverGlow: string }> = {
    office: { emoji: '🏢', gradient: 'from-blue-600 to-indigo-500', hoverGlow: 'hover:shadow-indigo-500/25' },
    travel: { emoji: '✈️', gradient: 'from-cyan-500 to-blue-500', hoverGlow: 'hover:shadow-cyan-500/25' },
    marketing: { emoji: '📊', gradient: 'from-rose-500 to-orange-500', hoverGlow: 'hover:shadow-rose-500/25' },
    finance: { emoji: '💰', gradient: 'from-emerald-500 to-teal-500', hoverGlow: 'hover:shadow-emerald-500/25' },
    technology: { emoji: '💻', gradient: 'from-violet-600 to-purple-500', hoverGlow: 'hover:shadow-violet-500/25' },
    hotel: { emoji: '🏨', gradient: 'from-amber-500 to-orange-500', hoverGlow: 'hover:shadow-amber-500/25' },
    email: { emoji: '✉️', gradient: 'from-sky-500 to-indigo-500', hoverGlow: 'hover:shadow-sky-500/25' },
    shipping: { emoji: '📦', gradient: 'from-amber-600 to-yellow-600', hoverGlow: 'hover:shadow-amber-600/25' },
    meetings: { emoji: '🤝', gradient: 'from-teal-600 to-emerald-500', hoverGlow: 'hover:shadow-teal-500/25' },
    business: { emoji: '💼', gradient: 'from-slate-700 to-slate-800', hoverGlow: 'hover:shadow-slate-700/25' },
  };
  return meta[topic.toLowerCase()] || { emoji: '📚', gradient: 'from-violet-500 to-purple-500', hoverGlow: 'hover:shadow-purple-500/25' };
};

const speakText = (text: string, rate: number = 0.9) => {
  if (!('speechSynthesis' in window)) return;
  
  // Stop current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const usVoice = voices.find(
    (v) =>
      v.lang === 'en-US' &&
      (v.name.includes('Google') ||
        v.name.includes('Microsoft') ||
        v.name.includes('Samantha') ||
        v.name.includes('Natural'))
  ) || voices.find((v) => v.lang.startsWith('en-US')) || voices.find((v) => v.lang.startsWith('en'));

  if (usVoice) {
    utterance.voice = usVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export default function VocabularyPage() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);

  // Initialize SpeechSynthesis voices early
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Session states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [viewedWordIds, setViewedWordIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Progress tracking states
  const [vocabProgressMap, setVocabProgressMap] = useState<Map<string, VocabProgressRecord>>(new Map());
  const [progressStats, setProgressStats] = useState({ newCount: 0, learningCount: 0, reviewCount: 0, masteredCount: 0 });

  const [wordSelections, setWordSelections] = useState<Map<string, number>>(new Map());

  const { setStudySessionActive } = useUIStore();

  // Sync active study session layout
  useEffect(() => {
    setStudySessionActive(selectedTopic !== null && !results);
    return () => {
      setStudySessionActive(false);
    };
  }, [selectedTopic, results, setStudySessionActive]);

  // Intercept back button gestures and browser back navigation using popstate
  useEffect(() => {
    const active = selectedTopic !== null && !results;
    if (!active) return;

    // Push dummy history entry so back button pops it instead of navigating away
    window.history.pushState({ preventBack: true }, '');

    const handlePopState = (e: PopStateEvent) => {
      const confirmExit = window.confirm(
        'Thoát học? Tiến trình học từ vựng hiện tại sẽ không được lưu. (Exit session? Current progress will not be saved.)'
      );
      if (confirmExit) {
        if (location.state?.practiceIds || selectedTopic === 'custom_practice') {
          navigate('/study');
        } else {
          setSessionId(null);
          setResults(null);
          setSelectedTopic(null);
          setCurrentIndex(0);
          setIsFlipped(false);
          setViewedWordIds(new Set());
          answersRef.current = [];
        }
      } else {
        // Push dummy state again to intercept the next back gesture
        window.history.pushState({ preventBack: true }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up the dummy history entry if the user completes or exits the session
      if (window.history.state?.preventBack) {
        window.history.back();
      }
    };
  }, [selectedTopic, results, navigate, location.state]);

  // Prevent page refresh / tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (selectedTopic !== null && !results) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [selectedTopic, results]);



  const handleMark = (wordId: string, choice: number) => {
    setWordSelections((prev) => {
      const next = new Map(prev);
      next.set(wordId, choice);
      return next;
    });

    const record = answersRef.current.find((a) => a.questionId === wordId);
    if (record) {
      record.selectedAnswer = choice;
    }

    if (choice === 1) {
      toast.success('Đã lưu: Đã biết từ này từ trước 🎯');
    } else {
      toast.success('Đã lưu: Đã hiểu từ mới này 📖');
    }

    // Auto-advance after brief delay
    if (currentIndex < filteredWords.length - 1) {
      setTimeout(() => {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      }, 400);
    }
  };

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
        const allWords: VocabWord[] = [];
        snap.forEach((doc) => {
          allWords.push({ id: doc.id, ...doc.data() } as VocabWord);
        });

        const practiceIds = location.state?.practiceIds as string[] | undefined;
        if (practiceIds && practiceIds.length > 0) {
          const filtered = allWords.filter((w) => practiceIds.includes(w.id));
          setWords(filtered);
          setSelectedTopic('custom_practice');
          if (profile?.uid) {
            const { progressMap, stats } = await generateSmartVocabSession(
              profile.uid,
              allWords
            );
            setVocabProgressMap(progressMap);
            setProgressStats(stats);
          }
        } else {
          // Normal flow: set all words for selection
          setWords(allWords);
          if (profile?.uid && allWords.length > 0) {
            const { progressMap, stats } = await generateSmartVocabSession(
              profile.uid,
              allWords
            );
            setVocabProgressMap(progressMap);
            setProgressStats(stats);
          }
        }
      } catch (err) {
        console.error('Failed to load vocab words:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVocab();
  }, [profile?.uid]);

  // Clear router state to avoid looping on reload
  useEffect(() => {
    if (location.state?.practiceIds) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  const filteredWords = words.filter(
    (w) =>
      selectedTopic &&
      (selectedTopic === 'custom_practice' ||
        w.topic.toLowerCase() === selectedTopic.toLowerCase())
  );

  const currentWord = filteredWords[currentIndex];

  // Start study session
  useEffect(() => {
    async function startSession() {
      if (!profile?.uid || filteredWords.length === 0 || sessionId) return;
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
    if (!loading && selectedTopic && filteredWords.length > 0) {
      startSession();
    }
  }, [profile?.uid, loading, selectedTopic, filteredWords.length]);

  // Autoplay word sound on card changes
  useEffect(() => {
    if (selectedTopic && currentWord && autoPlayAudio && !isFlipped) {
      speakText(currentWord.word, 0.85);
    }
  }, [currentIndex, selectedTopic, autoPlayAudio, isFlipped]);

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
  }, [currentIndex, filteredWords.length]);

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
      if (location.state?.practiceIds || selectedTopic === 'custom_practice') {
        navigate('/study');
      } else {
        setSessionId(null);
        setResults(null);
        setSelectedTopic(null);
        setCurrentIndex(0);
        setIsFlipped(false);
        setViewedWordIds(new Set());
        answersRef.current = [];
      }
    }
  };

  // Unique topics
  const topics = ['all', ...Array.from(new Set(words.map((w) => w.topic.toLowerCase())))];

  // Real progress stats (from Firestore subcollection)
  const masteredCount = progressStats.masteredCount;
  const learningCount = progressStats.learningCount + progressStats.reviewCount;
  const remainingCount = progressStats.newCount;

  /** Get display state for a word */
  const getWordState = (wordId: string): { label: string; emoji: string; color: string } => {
    const prog = vocabProgressMap.get(wordId);
    if (!prog) return { label: 'New', emoji: '🆕', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    switch (prog.state) {
      case 'mastered': return { label: 'Mastered', emoji: '✅', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'review': return { label: 'Review', emoji: '🔄', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'learning': return { label: 'Learning', emoji: '📖', color: 'bg-violet-50 text-violet-700 border-violet-200' };
      default: return { label: 'New', emoji: '🆕', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

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
            {selectedTopic === 'custom_practice' ? (
              <Link to="/study" className="flex-1">
                <Button variant="secondary" className="w-full font-semibold text-xs py-2">
                  Back to Station
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setResults(null);
                  setSessionId(null);
                  setSelectedTopic(null);
                  setViewedWordIds(new Set());
                  answersRef.current = [];
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className="flex-1 font-semibold text-xs py-2"
              >
                Back to Topics
              </Button>
            )}
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

  if (!selectedTopic) {
    const uniqueTopics = Array.from(new Set(words.map((w) => w.topic.toLowerCase())));

    return (
      <div className="space-y-8 pb-8 text-slate-850 max-w-4xl mx-auto animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            <span className="bg-gradient-to-r from-blue-600 to-[#0071E3] bg-clip-text text-transparent">
              Chủ đề Từ vựng
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Chọn một chủ đề để bắt đầu ôn luyện flashcards từ vựng
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton key={n} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {uniqueTopics.map((topic) => {
              const topicWords = words.filter((w) => w.topic.toLowerCase() === topic);
              const totalCount = topicWords.length;
              const masteredCount = topicWords.filter(
                (w) => vocabProgressMap.get(w.id)?.state === 'mastered'
              ).length;
              const learningCount = topicWords.filter((w) => {
                const state = vocabProgressMap.get(w.id)?.state;
                return state === 'learning' || state === 'review';
              }).length;

              const percentMastered = totalCount > 0 ? (masteredCount / totalCount) * 100 : 0;
              const meta = getTopicMeta(topic);

              return (
                <div
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 hover:shadow-lg cursor-pointer ${meta.hoverGlow}`}
                >
                  <div
                    className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${meta.gradient} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20`}
                  />

                  <div className="relative space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} text-lg shadow-sm text-white`}
                      >
                        {meta.emoji}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 capitalize">{topic}</h3>
                        <p className="text-[10px] text-slate-400 font-bold">{totalCount} từ vựng</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                        <span>Tiến độ học</span>
                        <span>{masteredCount} / {totalCount} từ</span>
                      </div>
                      <Progress value={percentMastered} height="sm" />
                    </div>

                    <div className="flex gap-2 text-[9px] font-bold text-slate-400">
                      <Badge variant="purple" size="sm" dot={learningCount > 0}>
                        {learningCount} đang học
                      </Badge>
                      <Badge variant="default" size="sm">
                        {totalCount - masteredCount - learningCount} từ mới
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-[10px] font-bold text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoPlayAudio}
              onChange={(e) => setAutoPlayAudio(e.target.checked)}
              className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 h-3.5 w-3.5 cursor-pointer"
            />
            <span>Auto Audio</span>
          </label>
          <span className="text-slate-200">|</span>
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
            <span className="bg-gradient-to-r from-blue-600 to-[#0071E3] bg-clip-text text-transparent capitalize">
              Chủ đề: {selectedTopic}
            </span>
          </h1>
          <p className="mt-1 text-xs text-slate-505">
            {filteredWords.length} words available
          </p>
        </div>
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
                {currentWord.difficulty && (
                  <Badge variant="warning" className="absolute left-1/2 -translate-x-1/2 top-4 text-[9px] font-bold">
                    🎯 Band: {currentWord.difficulty}
                  </Badge>
                )}
                {(() => {
                  const wordState = getWordState(currentWord.id);
                  return (
                    <span className={`absolute left-4 top-4 text-[9px] font-bold px-2 py-0.5 rounded-full border ${wordState.color}`}>
                      {wordState.emoji} {wordState.label}
                    </span>
                  );
                })()}
                <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                  {currentWord.word}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(currentWord.word, 0.85);
                    }}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
                    title="Pronounce word"
                  >
                    <Icons.Volume2 className="w-5 h-5 text-violet-500" />
                  </button>
                </h2>
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
                {currentWord.difficulty && (
                  <Badge variant="warning" className="absolute left-4 top-4 text-[9px] font-bold">
                    🎯 Band: {currentWord.difficulty}
                  </Badge>
                )}

                <p className="text-lg font-bold text-slate-900 max-w-sm leading-relaxed">{currentWord.definition}</p>
                {currentWord.definitionNative && (
                  <p className="text-sm text-[#0071E3] font-semibold mt-1">{currentWord.definitionNative}</p>
                )}

                <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-3.5 mt-5 text-left relative group">
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Usage Example</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(currentWord.example, 0.95);
                      }}
                      className="p-1 rounded-lg bg-white border border-slate-150 hover:border-slate-200 text-slate-400 hover:text-slate-700 transition-colors shadow-sm cursor-pointer"
                      title="Pronounce example sentence"
                    >
                      <Icons.Volume2 className="w-3.5 h-3.5 text-violet-500" />
                    </button>
                  </div>
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

          {/* Action buttons for vocabulary status */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMark(currentWord.id, 0);
              }}
              className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                wordSelections.get(currentWord.id) === 0
                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icons.CheckCircle className="w-4 h-4" />
              <span>Đã hiểu (Bây giờ đã học)</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMark(currentWord.id, 1);
              }}
              className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                wordSelections.get(currentWord.id) === 1
                  ? 'bg-[#0071E3] border-blue-600 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icons.BookmarkCheck className="w-4 h-4" />
              <span>Đã học (Đã biết từ trước)</span>
            </button>
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
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Vocab Progress</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>✅ Mastered</span>
                  <span className="text-emerald-600">{masteredCount}</span>
                </div>
                <Progress value={words.length > 0 ? (masteredCount / words.length) * 100 : 0} height="sm" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>📖 Learning</span>
                  <span className="text-amber-600">{learningCount}</span>
                </div>
                <Progress value={words.length > 0 ? (learningCount / words.length) * 100 : 0} height="sm" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>🆕 New</span>
                  <span className="text-slate-600">{remainingCount}</span>
                </div>
                <Progress value={words.length > 0 ? (remainingCount / words.length) * 100 : 0} height="sm" />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
