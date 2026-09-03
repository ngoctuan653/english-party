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
import { cancelStudySession, startStudySession, endStudySession } from '@/services/study';
import { formatDuration } from '@/utils/helpers';
import { toast } from 'react-hot-toast';
import type { SessionResults } from '@/types/study';
import type { QuestionAnswer } from '@/types/question';
import type { VocabProgressRecord } from '@/types/progress';
import type { CefrLevel } from '@/types/cefr';
import { CEFR_LEVELS, CEFR_LEVEL_META, cefrLevelFromDifficulty, getCurrentCefrLevel, isCefrLevel } from '@/types/cefr';
import {
  buildSmartVocabDeck,
  calculateReviewSchedule,
  generateSmartVocabSession,
  isReviewDue,
} from '@/services/progress';
import { getBundledVocabulary } from '@/data/questionBank';
import {
  LearningIntro,
  LearningModuleNav,
  LearningSectionHeading,
  LearningStats,
  WorkspaceSearch,
} from '@/components/study/LearningWorkspace';

const getTopicMeta = (topic: string) => {
  const meta: Record<string, { emoji: string; vi: string; tone: string; hoverGlow: string }> = {
    'hobbies-leisure': { emoji: '🎨', vi: 'Sở thích & Thể thao', tone: 'bg-pink-600', hoverGlow: 'hover:shadow-pink-500/10' },
    'travel-transport': { emoji: '✈️', vi: 'Du lịch & Di chuyển', tone: 'bg-cyan-600', hoverGlow: 'hover:shadow-cyan-500/10' },
    'education-learning': { emoji: '🎓', vi: 'Giáo dục & Học tập', tone: 'bg-blue-600', hoverGlow: 'hover:shadow-blue-500/10' },
    'work-business': { emoji: '💼', vi: 'Công việc & Kinh doanh', tone: 'bg-slate-800', hoverGlow: 'hover:shadow-slate-500/10' },
    'health-lifestyle': { emoji: '🌿', vi: 'Sức khỏe & Lối sống', tone: 'bg-emerald-600', hoverGlow: 'hover:shadow-emerald-500/10' },
    'people-relationships': { emoji: '👥', vi: 'Con người & Mối quan hệ', tone: 'bg-amber-600', hoverGlow: 'hover:shadow-amber-500/10' },
    'environment-nature': { emoji: '🌍', vi: 'Môi trường & Thiên nhiên', tone: 'bg-green-600', hoverGlow: 'hover:shadow-green-500/10' },
    'technology-innovation': { emoji: '💻', vi: 'Công nghệ & Kỷ nguyên số', tone: 'bg-violet-600', hoverGlow: 'hover:shadow-violet-500/10' },
    'media-communication': { emoji: '📰', vi: 'Truyền thông & Báo chí', tone: 'bg-rose-600', hoverGlow: 'hover:shadow-rose-500/10' },
    'food-nutrition': { emoji: '🥗', vi: 'Ẩm thực & Dinh dưỡng', tone: 'bg-orange-600', hoverGlow: 'hover:shadow-orange-500/10' },
    'money-finance': { emoji: '💳', vi: 'Tiền tệ & Tài chính', tone: 'bg-teal-600', hoverGlow: 'hover:shadow-teal-500/10' },
    'science-discovery': { emoji: '🔬', vi: 'Khoa học & Khám phá', tone: 'bg-indigo-600', hoverGlow: 'hover:shadow-indigo-500/10' },
    'law-justice': { emoji: '⚖️', vi: 'Pháp luật & Công lý', tone: 'bg-purple-600', hoverGlow: 'hover:shadow-purple-500/10' },
    'housing-urban-life': { emoji: '🏙️', vi: 'Nhà ở & Đô thị hóa', tone: 'bg-sky-600', hoverGlow: 'hover:shadow-sky-500/10' },
  };
  return meta[topic.toLowerCase()] || { emoji: '📚', vi: topic, tone: 'bg-indigo-600', hoverGlow: 'hover:shadow-indigo-500/10' };
};

const vocabRatings = [
  { value: 0, rating: 'again' as const, label: 'Again', icon: Icons.RotateCcw, tone: 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-400' },
  { value: 1, rating: 'hard' as const, label: 'Hard', icon: Icons.Brain, tone: 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400' },
  { value: 2, rating: 'good' as const, label: 'Good', icon: Icons.Check, tone: 'border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-400' },
  { value: 3, rating: 'easy' as const, label: 'Easy', icon: Icons.Zap, tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400' },
];

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
  const [sessionWords, setSessionWords] = useState<VocabWord[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [topicSearchTerm, setTopicSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<CefrLevel>(() => getCurrentCefrLevel(profile));

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
        cancelStudySession(sessionId);
        if (location.state?.practiceIds || selectedTopic === 'custom_practice') {
          navigate('/study');
        } else {
          setSessionId(null);
          setResults(null);
          setSelectedTopic(null);
          setSessionWords([]);
          setCurrentIndex(0);
          setIsFlipped(false);
          setSecondsElapsed(0);
          setViewedWordIds(new Set());
          setWordSelections(new Map());
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
  }, [selectedTopic, results, navigate, location.state, sessionId]);

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

    const timeSpent = Math.max(0.5, (Date.now() - wordStartTimeRef.current) / 1000);
    const record = answersRef.current.find((answer) => answer.questionId === wordId);
    if (record) {
      record.selectedAnswer = choice;
      record.isCorrect = choice > 0;
      record.timeSpent = timeSpent;
    } else {
      answersRef.current.push({
        questionId: wordId,
        selectedAnswer: choice,
        isCorrect: choice > 0,
        timeSpent,
      });
    }

    // Auto-advance after brief delay
    if (currentIndex < filteredWords.length - 1) {
      setTimeout(() => {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      }, 280);
    }
  };

  // Timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wordStartTimeRef = useRef<number>(0);
  const answersRef = useRef<QuestionAnswer[]>([]);
  const activeSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeSessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => () => cancelStudySession(activeSessionIdRef.current), []);

  useEffect(() => {
    async function loadVocab() {
      try {
        setLoading(true);
        const bundled = getBundledVocabulary();
        const mergedMap = new Map<string, VocabWord>();
        bundled.forEach((w) => mergedMap.set(w.id, w));

        try {
          const snap = await getDocs(
            query(collection(db, 'vocabulary'), where('isActive', '==', true))
          );
          snap.forEach((doc) => {
            const data = doc.data() as Omit<VocabWord, 'id'>;
            mergedMap.set(doc.id, {
              id: doc.id,
              ...data,
              exam: 'cefr',
              cefrLevel: isCefrLevel(data.cefrLevel) ? data.cefrLevel : cefrLevelFromDifficulty(data.difficulty),
            });
          });
        } catch (error) {
          console.warn('Using bundled vocabulary bank.', error);
        }

        const allWords: VocabWord[] = Array.from(mergedMap.values());

        const practiceIds = location.state?.practiceIds as string[] | undefined;
        if (practiceIds && practiceIds.length > 0) {
          const filtered = allWords.filter((w) => practiceIds.includes(w.id));
          setWords(filtered);
          setSessionWords(filtered);
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

  const filteredWords = selectedTopic
    ? sessionWords.length > 0
      ? sessionWords
      : words.filter(
          (w) =>
            selectedTopic === 'custom_practice' ||
            w.topic.toLowerCase() === selectedTopic.toLowerCase()
        )
    : [];

  const currentWord = filteredWords[currentIndex];

  // Start study session
  useEffect(() => {
    async function startSession() {
      if (!profile?.uid || filteredWords.length === 0 || sessionId) return;
      try {
        const id = await startStudySession(profile.uid, 'cefr', 'vocabulary');
        setSessionId(id);
        wordStartTimeRef.current = Date.now();
        const firstWord = filteredWords[0];
        if (firstWord) {
          setViewedWordIds(new Set([firstWord.id]));
        }
      } catch (err) {
        console.error('Failed to start vocabulary session:', err);
      }
    }
    if (!loading && selectedTopic && filteredWords.length > 0 && !results) {
      startSession();
    }
  }, [profile?.uid, loading, selectedTopic, filteredWords.length, sessionId, results]);

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
    wordStartTimeRef.current = Date.now();

    if (viewedWordIds.has(wordId)) return;

    setViewedWordIds((prev) => {
      const next = new Set(prev);
      next.add(wordId);
      return next;
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
    if (answersRef.current.length === 0) {
      toast.error('Hãy tự đánh giá ít nhất một từ trước khi kết thúc.');
      return;
    }
    try {
      setSaving(true);
      const correctRatings = answersRef.current.filter((answer) => answer.isCorrect).length;
      const sessionResults = await endStudySession(
        sessionId,
        profile.uid,
        answersRef.current,
        profile.currentStreak,
        { total: answersRef.current.length, correct: correctRatings }
      );
      const { progressMap, stats } = await generateSmartVocabSession(profile.uid, words);
      setVocabProgressMap(progressMap);
      setProgressStats(stats);
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
      cancelStudySession(sessionId);
      if (location.state?.practiceIds || selectedTopic === 'custom_practice') {
        navigate('/study');
      } else {
        setSessionId(null);
        setResults(null);
        setSelectedTopic(null);
        setSessionWords([]);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSecondsElapsed(0);
        setViewedWordIds(new Set());
        setWordSelections(new Map());
        answersRef.current = [];
      }
    }
  };

  // Unique topics
  const levelWords = words.filter((word) => (word.cefrLevel ?? cefrLevelFromDifficulty(word.difficulty)) === activeLevel);
  const topics = ['all', ...Array.from(new Set(levelWords.map((w) => w.topic.toLowerCase())))];

  // Real progress stats (from Firestore subcollection)
  const masteredCount = levelWords.filter((word) => vocabProgressMap.get(word.id)?.state === 'mastered').length;
  const learningCount = levelWords.filter((word) => {
    const state = vocabProgressMap.get(word.id)?.state;
    return state === 'learning' || state === 'review';
  }).length;
  const remainingCount = levelWords.filter((word) => !vocabProgressMap.has(word.id)).length;
  const dueCount = levelWords.filter((word) => {
    const progress = vocabProgressMap.get(word.id);
    return progress ? isReviewDue(progress) : false;
  }).length;

  const createDeckForTopic = (
    topic: string,
    sourceWords: VocabWord[] = levelWords,
    sourceProgressMap: Map<string, VocabProgressRecord> = vocabProgressMap
  ) => {
    const topicWords = topic === 'custom_practice'
      ? sourceWords
      : sourceWords.filter((w) => w.topic.toLowerCase() === topic.toLowerCase());

    return buildSmartVocabDeck(topicWords, sourceProgressMap, {
      maxCount: Math.min(12, Math.max(1, topicWords.length)),
      reviewSampleCount: 3,
    });
  };

  const resetVocabRun = () => {
    setSessionId(null);
    setResults(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSecondsElapsed(0);
    setViewedWordIds(new Set());
    setWordSelections(new Map());
    answersRef.current = [];
  };

  const handleSelectTopic = (topic: string) => {
    setSessionWords(createDeckForTopic(topic));
    setSelectedTopic(topic);
    resetVocabRun();
  };

  /** Get display state for a word */
  const getWordState = (wordId: string): { label: string; emoji: string; color: string } => {
    const prog = vocabProgressMap.get(wordId);
    if (!prog) return { label: 'New', emoji: '🆕', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (isReviewDue(prog)) return { label: 'Due now', emoji: '↻', color: 'bg-amber-50 text-amber-700 border-amber-200' };
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
            <p className="text-3xl font-black text-slate-800 relative z-10">{wordSelections.size}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase relative z-10 font-sans">Cards Rated</p>
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
                  resetVocabRun();
                  setSelectedTopic(null);
                  setSessionWords([]);
                }}
                className="flex-1 font-semibold text-xs py-2"
              >
                Back to Topics
              </Button>
            )}
            <Button
              onClick={() => {
                if (selectedTopic) {
                  setSessionWords(createDeckForTopic(selectedTopic));
                }
                resetVocabRun();
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
    const uniqueTopics = Array.from(new Set(levelWords.map((w) => w.topic.toLowerCase())));
    const searchTerm = topicSearchTerm.trim().toLowerCase();
    const filteredTopics = uniqueTopics.filter((topic) => !searchTerm || topic.includes(searchTerm));
    const totalWords = levelWords.length;
    const masteredPercent = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

    return (
      <div className="mx-auto w-full max-w-[1440px] space-y-4 pb-8 text-slate-800">
        <section className="min-w-0 space-y-4">
          <LearningModuleNav active="vocabulary" />

          <LearningIntro
            eyebrow={`CEFR ${activeLevel} Vocabulary`}
            title="Vocabulary Library"
            description="Build a practical word bank by topic. Smart sessions prioritize new and weak words, then add a small review sample only when needed."
            icon={Icons.Layers3}
            accent="blue"
            aside={(
              <div className="w-full">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Overall mastery</p>
                    <p className="mt-1 text-3xl font-black text-slate-950">{masteredPercent}%</p>
                  </div>
                  <p className="pb-1 text-xs font-bold text-emerald-700">{masteredCount}/{totalWords}</p>
                </div>
                <div className="mt-4">
                  <Progress value={masteredPercent} height="sm" />
                </div>
              </div>
            )}
          />

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-3">
              <p className="text-[10px] font-black uppercase text-sky-700">Vocabulary level</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6">
              {CEFR_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={activeLevel === level}
                  onClick={() => setActiveLevel(level)}
                  className={`min-h-16 border-b border-r border-slate-200 px-3 py-2 transition-colors sm:border-b-0 ${
                    activeLevel === level ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-sky-50'
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

          <LearningStats
            items={[
              { label: 'New words', value: remainingCount, detail: `${uniqueTopics.length} topics`, icon: Icons.Sparkles, tone: 'blue' },
              { label: 'Due now', value: dueCount, detail: 'Scheduled recall', icon: Icons.AlarmClock, tone: 'violet' },
              { label: 'In review', value: learningCount, detail: 'Building retention', icon: Icons.RotateCcw, tone: 'amber' },
              { label: 'Mastered', value: masteredCount, detail: 'Completed words', icon: Icons.BadgeCheck, tone: 'emerald' },
            ]}
          />

          <WorkspaceSearch
            value={topicSearchTerm}
            onChange={setTopicSearchTerm}
            placeholder="Search vocabulary topics..."
          />

          <LearningSectionHeading
            title="Vocabulary topics"
            count={`${filteredTopics.length} topics`}
            icon={Icons.BookMarked}
          />

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton key={n} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTopics.map((topic) => {
              const topicWords = levelWords.filter((w) => w.topic.toLowerCase() === topic);
              const totalCount = topicWords.length;
              const masteredCount = topicWords.filter(
                (w) => vocabProgressMap.get(w.id)?.state === 'mastered'
              ).length;
              const learningCount = topicWords.filter((w) => {
                const state = vocabProgressMap.get(w.id)?.state;
                return state === 'learning' || state === 'review';
              }).length;
              const topicDueCount = topicWords.filter((word) => {
                const progress = vocabProgressMap.get(word.id);
                return progress ? isReviewDue(progress) : false;
              }).length;

              const percentMastered = totalCount > 0 ? (masteredCount / totalCount) * 100 : 0;
              const meta = getTopicMeta(topic);

              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleSelectTopic(topic)}
                  className={`group min-h-40 rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md ${meta.hoverGlow}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${meta.tone} text-lg text-white shadow-sm`}
                      >
                        {meta.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-black capitalize text-slate-900">{topic}</h3>
                        <p className="mt-1 text-xs font-bold text-sky-600">{totalCount} words</p>
                      </div>
                      <Icons.ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-sky-500" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>Mastered</span>
                        <span>{masteredCount} / {totalCount}</span>
                      </div>
                      <Progress value={percentMastered} height="sm" />
                    </div>

                    <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-400">
                      {topicDueCount > 0 && (
                        <Badge variant="warning" size="sm" dot>
                          {topicDueCount} due now
                        </Badge>
                      )}
                      <Badge variant="purple" size="sm" dot={learningCount > 0}>
                        {learningCount} learning
                      </Badge>
                      <Badge variant="default" size="sm">
                        {totalCount - masteredCount - learningCount} new
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-8 text-slate-800">
      {/* Header toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <button
          onClick={handleExitVocab}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Icons.X className="w-4 h-4" /> Exit Vocabulary
        </button>
        
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
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
            {wordSelections.size} rated · {viewedWordIds.size} viewed
          </span>
        </div>

        {sessionId && (
          <Button
            onClick={handleFinishVocab}
            disabled={saving || wordSelections.size === 0}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl cursor-pointer"
          >
            {saving ? 'Saving...' : 'Finish & Save'}
          </Button>
        )}
      </div>

      {/* Title */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-sky-600">Flashcard Session</p>
          <h1 className="text-2xl font-black capitalize text-slate-950 sm:text-3xl">
            {selectedTopic}
          </h1>
          <p className="mt-2 text-xs font-bold text-slate-500">
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
            <p className="text-xs text-slate-400">Ask your admin to upload CEFR-tagged vocabulary lists.</p>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Card wrapper */}
          <div
            className="h-[22rem] w-full cursor-pointer"
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
                className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <Badge variant="purple" className="absolute right-4 top-4 text-[9px] uppercase font-bold tracking-wider">
                  {currentWord.topic}
                </Badge>
                {currentWord.difficulty && (
                  <Badge variant="warning" className="absolute left-1/2 -translate-x-1/2 top-4 text-[9px] font-bold">
                    CEFR {currentWord.cefrLevel ?? cefrLevelFromDifficulty(currentWord.difficulty)}
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
                <h2 className="flex items-center justify-center gap-2 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                  {currentWord.word}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(currentWord.word, 0.85);
                    }}
                    className="rounded-full p-2 text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-600"
                    title="Pronounce word"
                  >
                    <Icons.Volume2 className="h-5 w-5 text-sky-500" />
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
                className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-sm overflow-y-auto"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <Badge variant="success" className="absolute right-4 top-4 text-[9px] uppercase font-bold">
                  Definition
                </Badge>
                {currentWord.difficulty && (
                  <Badge variant="warning" className="absolute left-4 top-4 text-[9px] font-bold">
                    CEFR {currentWord.cefrLevel ?? cefrLevelFromDifficulty(currentWord.difficulty)}
                  </Badge>
                )}

                <p className="text-lg font-bold text-slate-900 max-w-sm leading-relaxed mt-2">{currentWord.definition}</p>
                {currentWord.definitionNative && (
                  <p className="text-sm text-[#0071E3] font-semibold mt-1">{currentWord.definitionNative}</p>
                )}

                <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-3 mt-3 text-left relative group">
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Usage Example</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(currentWord.example, 0.95);
                      }}
                      className="rounded-lg border border-slate-200 bg-white p-1 text-slate-400 shadow-sm transition-colors hover:border-sky-200 hover:text-sky-600"
                      title="Pronounce example sentence"
                    >
                      <Icons.Volume2 className="h-3.5 w-3.5 text-sky-500" />
                    </button>
                  </div>
                  <p className="text-xs italic text-slate-700 mt-1 leading-relaxed">"{currentWord.example}"</p>
                  {currentWord.exampleTranslation && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{currentWord.exampleTranslation}</p>
                  )}
                </div>

                {currentWord.collocations && currentWord.collocations.length > 0 && (
                  <div className="w-full max-w-sm mt-2.5 text-left">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Key Collocations (Cụm từ B2):</p>
                    <div className="flex flex-wrap gap-1">
                      {currentWord.collocations.map((col, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md bg-sky-50 border border-sky-100 text-[10px] font-semibold text-sky-800">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 mt-3 uppercase font-bold tracking-wider">
                  Tap to Flip Back
                </p>
              </div>
            </motion.div>
          </div>

          {/* Recall rating controls */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {vocabRatings.map((rating) => {
              const Icon = rating.icon;
              const selected = wordSelections.get(currentWord.id) === rating.value;
              const schedule = calculateReviewSchedule(vocabProgressMap.get(currentWord.id), rating.rating);
              const interval = schedule.intervalDays === 0 ? '10 min' : `${schedule.intervalDays}d`;
              return (
                <button
                  key={rating.value}
                  type="button"
                  disabled={!isFlipped}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleMark(currentWord.id, rating.value);
                  }}
                  className={`flex min-h-16 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-left transition-all disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-300 ${
                    selected ? 'border-slate-900 bg-slate-950 text-white shadow-sm' : rating.tone
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>
                    <span className="block text-xs font-black">{rating.label}</span>
                    <span className={`block text-[9px] font-bold ${selected ? 'text-slate-300' : 'opacity-70'}`}>{interval}</span>
                  </span>
                </button>
              );
            })}
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
                  <span>Mastered</span>
                  <span className="text-emerald-600">{masteredCount}</span>
                </div>
                <Progress value={words.length > 0 ? (masteredCount / words.length) * 100 : 0} height="sm" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>Learning</span>
                  <span className="text-amber-600">{learningCount}</span>
                </div>
                <Progress value={words.length > 0 ? (learningCount / words.length) * 100 : 0} height="sm" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>New</span>
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
