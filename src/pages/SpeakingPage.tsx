import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  LearningIntro,
  LearningModuleNav,
  LearningStats,
} from '@/components/study/LearningWorkspace';
import {
  SPEAKING_EXAM_QUESTIONS,
  SPEAKING_SCENARIOS,
} from '@/data/speakingContent';
import type {
  ConversationTurn,
  RoleplaySessionReport,
  SpeakingExamQuestion,
  SpeakingExamResult,
  SpeakingHistoryItem,
  SpeakingMode,
  SpeakingScenario,
} from '@/types/speaking';
import { calculateLevel } from '@/types/gamification';
import {
  evaluateRoleplaySession,
  evaluateSpeakingExam,
  hasGeminiApiKey,
  sendRoleplayMessage,
} from '@/services/gemini';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { speakEnglishText, stopSpeaking, type VoiceEngine, type VoiceGender } from '@/utils/speech';
import {
  deleteSpeakingHistoryItem,
  getSpeakingHistory,
  recordSpeakingSession,
  saveSpeakingHistoryItem,
} from '@/services/study';
import { Progress } from '@/components/ui/Progress';
import { VoiceVisualizer } from '@/components/speaking/VoiceVisualizer';
import { ConversationBubble } from '@/components/speaking/ConversationBubble';
import { ScenarioCard } from '@/components/speaking/ScenarioCard';
import { RandomTopicCard } from '@/components/speaking/RandomTopicCard';
import { ExamScoreCard } from '@/components/speaking/ExamScoreCard';
import { ApiKeyModal } from '@/components/speaking/ApiKeyModal';
import { SpeakingSessionReviewModal } from '@/components/speaking/SpeakingSessionReviewModal';
import { SpeakingHistoryModal } from '@/components/speaking/SpeakingHistoryModal';

export default function SpeakingPage() {
  const { profile, setProfile } = useAuthStore();
  const { setStudySessionActive } = useUIStore();

  // Mode & Navigation State
  const [activeTab, setActiveTab] = useState<SpeakingMode>('roleplay');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(() => hasGeminiApiKey());

  // Roleplay State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeScenario, setActiveScenario] = useState<SpeakingScenario | null>(null);
  const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([]);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const [sessionReport, setSessionReport] = useState<RoleplaySessionReport | null>(null);
  const [reviewScenario, setReviewScenario] = useState<SpeakingScenario | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEvaluatingSession, setIsEvaluatingSession] = useState(false);
  const sessionStartTimeRef = useRef<number>(Date.now());
  // Conversation Turn Length: 6 (Short), 10 (Medium - default), 14 (Long)
  const [targetTurns, setTargetTurns] = useState<number>(() => {
    const saved = localStorage.getItem('ep_speaking_target_turns');
    return saved ? Number(saved) : 10;
  });

  const handleSelectTargetTurns = (turns: number) => {
    setTargetTurns(turns);
    localStorage.setItem('ep_speaking_target_turns', String(turns));
    toast.success(
      turns === 6
        ? 'Đã chọn: Hội thoại ngắn (6 lượt - ~3-5 phút)'
        : turns === 10
        ? 'Đã chọn: Hội thoại vừa (10 lượt - ~7-10 phút)'
        : 'Đã chọn: Hội thoại chuyên sâu (14 lượt - ~12-15 phút)'
    );
  };

  // Voice Engine: 'gemini' | 'browser'
  const [voiceEngine, setVoiceEngine] = useState<VoiceEngine>(() => {
    const saved = localStorage.getItem('ep_speaking_voice_engine') as VoiceEngine | null;
    return saved || 'gemini';
  });

  const handleSelectVoiceEngine = (engine: VoiceEngine) => {
    setVoiceEngine(engine);
    localStorage.setItem('ep_speaking_voice_engine', engine);
    toast.success(
      engine === 'gemini'
        ? 'Đã chọn: ✨ Gemini AI Studio (Giọng thật Aoede / Puck)'
        : 'Đã chọn: ⚡ Browser Native (Phát tức thì)'
    );
  };

  // Voice Gender: 'random' | 'male' | 'female'
  const [voiceGenderChoice, setVoiceGenderChoice] = useState<VoiceGender>(() => {
    const saved = localStorage.getItem('ep_speaking_voice_gender') as VoiceGender | null;
    return saved || 'random';
  });
  const [sessionVoiceGender, setSessionVoiceGender] = useState<'male' | 'female'>('female');
  const sessionVoiceGenderRef = useRef<'male' | 'female'>('female');

  const handleSelectVoiceGender = (gender: VoiceGender) => {
    setVoiceGenderChoice(gender);
    localStorage.setItem('ep_speaking_voice_gender', gender);
    const resolved: 'male' | 'female' =
      gender === 'random' ? (Math.random() < 0.5 ? 'male' : 'female') : gender;
    setSessionVoiceGender(resolved);
    sessionVoiceGenderRef.current = resolved;
    toast.success(
      gender === 'random'
        ? `Đã chọn: Giọng ngẫu nhiên (hiện tại: ${resolved === 'male' ? '👨 Giọng Nam' : '👩 Giọng Nữ'})`
        : gender === 'male'
        ? 'Đã chọn: 👨 Giọng đọc Nam'
        : 'Đã chọn: 👩 Giọng đọc Nữ'
    );
  };

  // History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [speakingHistory, setSpeakingHistory] = useState<SpeakingHistoryItem[]>([]);

  useEffect(() => {
    const uid = profile?.uid || 'guest';
    setSpeakingHistory(getSpeakingHistory(uid));
  }, [profile?.uid]);

  // VAD (Voice Activity Detection) — real-time conversation state machine
  type VadPhase = 'idle' | 'listening' | 'processing' | 'speaking' | 'paused';
  const [vadPhase, setVadPhase] = useState<VadPhase>('idle');
  const vadPhaseRef = useRef<VadPhase>('idle');
  const autoListenActiveRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  // Always-fresh ref to the roleplay handler so VAD timer never uses stale closure
  const handleSendRoleplayMessageRef = useRef<(text: string) => Promise<void>>(async () => {});

  // VAD Silence Pause Config & Countdown (in milliseconds)
  const [silenceTolerance, setSilenceTolerance] = useState<number>(() => {
    const saved = localStorage.getItem('ep_speaking_silence_delay');
    return saved ? Number(saved) : 3500;
  });
  const [remainingSilenceSeconds, setRemainingSilenceSeconds] = useState<number | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSetSilenceTolerance = (ms: number) => {
    setSilenceTolerance(ms);
    localStorage.setItem('ep_speaking_silence_delay', String(ms));
    toast.success(
      ms >= 4500
        ? 'Đã đổi: Chờ thong thả (4.5s - rất nhiều thời gian suy nghĩ)'
        : ms >= 3500
        ? 'Đã đổi: Tiêu chuẩn tự nhiên (3.5s - thoải mái phản xạ)'
        : 'Đã đổi: Phản xạ nhanh (2.2s - cho người nói lưu loát)'
    );
  };

  const handleManualSubmitSpeech = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setRemainingSilenceSeconds(null);

    const toSend = (transcriptRef.current + ' ' + interimTranscriptRef.current).trim();
    if (toSend && vadPhaseRef.current === 'listening') {
      handleSendRoleplayMessageRef.current(toSend);
    }
  };

  const updateVadPhase = (phase: VadPhase) => {
    vadPhaseRef.current = phase;
    setVadPhase(phase);
  };

  const toggleMic = () => {
    if (vadPhase === 'paused') {
      autoListenActiveRef.current = true;
      updateVadPhase('listening');
      resetTranscript();
      startListening();
    } else if (vadPhase === 'listening') {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setRemainingSilenceSeconds(null);
      autoListenActiveRef.current = false;
      updateVadPhase('paused');
      stopListening();
    }
  };

  // Exam State
  type ExamPhase = 'select' | 'prep' | 'speaking' | 'evaluating' | 'result';
  const [examPhase, setExamPhase] = useState<ExamPhase>('select');
  const [selectedExamQuestion, setSelectedExamQuestion] = useState<SpeakingExamQuestion>(
    SPEAKING_EXAM_QUESTIONS[0]
  );
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(30);
  const [speakingSecondsLeft, setSpeakingSecondsLeft] = useState(60);
  const [examResult, setExamResult] = useState<SpeakingExamResult | null>(null);
  const examTranscriptAccumulatorRef = useRef('');

  // Speech Recognition Hook
  const {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript,
    audioLevel,
    isSupported: speechSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'en-US',
    continuous: true,
    interimResults: true,
  });

  // Sync Study Session active state with UI store to suppress extraneous headers
  useEffect(() => {
    const isSessionActive = Boolean(activeScenario || (activeTab === 'exam' && examPhase !== 'select' && examPhase !== 'result'));
    setStudySessionActive(isSessionActive);
    return () => setStudySessionActive(false);
  }, [activeScenario, activeTab, examPhase, setStudySessionActive]);

  // Clean speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [stopListening]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [conversationTurns, isAiResponding]);

  // Keep transcript refs fresh for VAD timer callbacks (avoid stale closures)
  useEffect(() => {
    transcriptRef.current = transcript;
    interimTranscriptRef.current = interimTranscript;
    handleSendRoleplayMessageRef.current = handleSendRoleplayMessage;
  });

  // VAD: auto-submit after smart silence once user starts speaking
  useEffect(() => {
    if (!activeScenario || vadPhaseRef.current !== 'listening') {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setRemainingSilenceSeconds(null);
      return;
    }
    const currentCombined = (transcript + ' ' + interimTranscript).trim();
    if (!currentCombined) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setRemainingSilenceSeconds(null);
      return;
    }

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Smart sentence completeness analysis:
    // If fewer than 3 words or ends with prepositions/conjunctions/hesitations, give extra buffer!
    const words = currentCombined.split(/\s+/).filter(Boolean);
    const isTrailingConjunctionOrIncomplete =
      words.length < 3 ||
      /(and|but|or|so|because|although|if|when|while|since|that|which|who|like|uh|um|er|ah|well|to|in|at|on|for|with|about|of|as)$/i.test(
        currentCombined
      );

    const effectiveDelay = isTrailingConjunctionOrIncomplete
      ? Math.max(silenceTolerance + 1500, 4800)
      : silenceTolerance;

    const startTime = Date.now();
    setRemainingSilenceSeconds(Math.ceil(effectiveDelay / 1000));

    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const left = Math.max(0, Math.ceil((effectiveDelay - elapsed) / 1000));
      setRemainingSilenceSeconds(left);
      if (left <= 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 200);

    silenceTimerRef.current = setTimeout(() => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setRemainingSilenceSeconds(null);

      const toSend = (transcriptRef.current + ' ' + interimTranscriptRef.current).trim();
      if (toSend && vadPhaseRef.current === 'listening' && autoListenActiveRef.current) {
        handleSendRoleplayMessageRef.current(toSend);
      }
    }, effectiveDelay);

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, interimTranscript, activeScenario, silenceTolerance]);

  // VAD: auto-restart mic when Chrome kills recognition mid-session
  useEffect(() => {
    if (!isListening && autoListenActiveRef.current && vadPhaseRef.current === 'listening') {
      const t = setTimeout(() => {
        if (autoListenActiveRef.current && vadPhaseRef.current === 'listening') {
          startListening();
        }
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isListening, startListening]);

  // Countdown timer for Exam Prep and Speaking
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (examPhase === 'prep') {
      interval = setInterval(() => {
        setPrepSecondsLeft((prev) => {
          if (prev <= 1) {
            // Auto move to speaking
            startExamSpeakingPhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (examPhase === 'speaking') {
      interval = setInterval(() => {
        setSpeakingSecondsLeft((prev) => {
          if (prev <= 1) {
            // Time up for speaking
            handleFinishExamSpeaking();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [examPhase]);

  // ============================================
  // ROLEPLAY LOGIC
  // ============================================

  const handleStartScenario = (scenario: SpeakingScenario) => {
    setActiveScenario(scenario);
    resetTranscript();
    setSessionReport(null);
    setIsReviewModalOpen(false);
    setIsEvaluatingSession(false);
    sessionStartTimeRef.current = Date.now();

    // Pick session voice gender (randomize per session if choice is 'random')
    const initialGender: 'male' | 'female' =
      voiceGenderChoice === 'random' ? (Math.random() < 0.5 ? 'male' : 'female') : voiceGenderChoice;
    setSessionVoiceGender(initialGender);
    sessionVoiceGenderRef.current = initialGender;

    const starterTurn: ConversationTurn = {
      id: `ai_${Date.now()}`,
      role: 'ai',
      text: scenario.starterPrompt,
      timestamp: Date.now(),
    };

    setConversationTurns([starterTurn]);

    // Start VAD auto-listen loop: speak opener → mic on → listen → submit → repeat
    autoListenActiveRef.current = true;
    updateVadPhase('speaking');
    speakEnglishText(scenario.starterPrompt, {
      engine: voiceEngine,
      gender: sessionVoiceGenderRef.current,
      onEnd: () => {
        if (autoListenActiveRef.current) {
          updateVadPhase('listening');
          resetTranscript();
          startListening();
        }
      },
      onError: () => {
        if (autoListenActiveRef.current) {
          updateVadPhase('listening');
          startListening();
        }
      },
    });
  };

  const handleSendRoleplayMessage = async (userText: string) => {
    const text = userText.trim();
    if (!text || !activeScenario || isAiResponding) return;

    // Cancel any pending silence timer & countdown
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setRemainingSilenceSeconds(null);

    stopListening();
    resetTranscript();
    setManualInput('');
    updateVadPhase('processing');

    const userTurn: ConversationTurn = {
      id: `user_${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    const updatedHistory = [...conversationTurns, userTurn];
    setConversationTurns(updatedHistory);
    setIsAiResponding(true);

    // Detect user ending intent (e.g. "stop here", "let's end here", "enough", "bye")
    const isUserEnding = /let'?s\s+(end|stop|finish|wrap)|stop\s+here|end\s+the\s+conversation|that'?s\s+all|enough\s+for\s+today|bye|goodbye|let\s+let\s+and/i.test(text);

    try {
      const { aiReply, isFinished } = await sendRoleplayMessage(
        activeScenario,
        updatedHistory,
        text
      );

      const aiTurn: ConversationTurn = {
        id: `ai_${Date.now()}`,
        role: 'ai',
        text: aiReply,
        timestamp: Date.now(),
      };

      const allTurns = [...updatedHistory, aiTurn];
      setConversationTurns(allTurns);

      const userTurnsCount = allTurns.filter((t) => t.role === 'user').length;
      const shouldAutoEnd = isFinished || isUserEnding || userTurnsCount >= targetTurns;

      // Speak AI reply → when done, either trigger end review or continue VAD
      updateVadPhase('speaking');
      speakEnglishText(aiReply, {
        engine: voiceEngine,
        gender: sessionVoiceGenderRef.current,
        onEnd: () => {
          if (shouldAutoEnd) {
            handleCompleteAndReviewSession(allTurns);
          } else if (autoListenActiveRef.current) {
            updateVadPhase('listening');
            resetTranscript();
            startListening();
          } else {
            updateVadPhase('idle');
          }
        },
        onError: () => {
          if (shouldAutoEnd) {
            handleCompleteAndReviewSession(allTurns);
          } else if (autoListenActiveRef.current) {
            updateVadPhase('listening');
            startListening();
          } else {
            updateVadPhase('idle');
          }
        },
      });
    } catch (err) {
      toast.error('Không thể kết nối với AI. Vui lòng thử lại.');
      // Restart mic after error if still in session
      if (autoListenActiveRef.current) {
        updateVadPhase('listening');
        resetTranscript();
        startListening();
      } else {
        updateVadPhase('idle');
      }
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleCompleteAndReviewSession = async (turnsOverride?: ConversationTurn[]) => {
    if (!activeScenario) return;

    // Tear down VAD
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setRemainingSilenceSeconds(null);
    autoListenActiveRef.current = false;
    updateVadPhase('idle');
    stopSpeaking();
    stopListening();

    const turnsToAnalyze = turnsOverride || conversationTurns;
    const userTurns = turnsToAnalyze.filter((t) => t.role === 'user');

    if (userTurns.length === 0) {
      setActiveScenario(null);
      setConversationTurns([]);
      return;
    }

    setIsEvaluatingSession(true);

    const durationSeconds = Math.max(
      15,
      Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
    );

    try {
      const report = await evaluateRoleplaySession(
        activeScenario,
        turnsToAnalyze,
        durationSeconds
      );

      setSessionReport(report);
      setReviewScenario(activeScenario);
      setIsReviewModalOpen(true);

      // Award XP & save to study_sessions
      if (profile?.uid) {
        const prevXP = profile.xp || 0;
        const nextXP = prevXP + report.xpEarned;
        setProfile({
          ...profile,
          xp: nextXP,
          level: calculateLevel(nextXP),
        });

        await recordSpeakingSession(profile.uid, {
          mode: 'roleplay',
          title: activeScenario.title,
          xpEarned: report.xpEarned,
          durationSeconds,
          turnsCount: report.turnsCount,
          score: report.overall_score,
          reportData: report,
          scenarioIcon: activeScenario.icon,
        });
        toast.success(`🎉 Xuất sắc! Bạn nhận được +${report.xpEarned} XP từ buổi nói chuyện!`);
      }

      // Save to local speaking history
      const historyItem: SpeakingHistoryItem = {
        id: `speaking_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        scenarioId: activeScenario.id,
        scenarioTitle: activeScenario.title,
        scenarioIcon: activeScenario.icon,
        level: activeScenario.level,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        durationSeconds,
        turnsCount: report.turnsCount,
        overallScore: report.overall_score,
        xpEarned: report.xpEarned,
        report,
      };
      const uid = profile?.uid || 'guest';
      const updatedHistory = saveSpeakingHistoryItem(uid, historyItem);
      setSpeakingHistory(updatedHistory);
    } catch (err) {
      console.error('Lỗi phân tích buổi nói:', err);
      toast.error('Không thể hoàn tất phân tích buổi nói. Vui lòng thử lại.');
    } finally {
      setIsEvaluatingSession(false);
    }
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setActiveScenario(null);
    setReviewScenario(null);
    setConversationTurns([]);
    setSessionReport(null);
  };

  const handleRetryScenario = () => {
    setIsReviewModalOpen(false);
    setSessionReport(null);
    const scenarioToRetry = activeScenario || reviewScenario;
    if (scenarioToRetry) {
      handleStartScenario(scenarioToRetry);
    }
  };

  // ============================================
  // EXAM LOGIC
  // ============================================

  const handleStartExamPrep = (q: SpeakingExamQuestion) => {
    setSelectedExamQuestion(q);
    setPrepSecondsLeft(q.prepTimeSeconds);
    setSpeakingSecondsLeft(q.speakingTimeSeconds);
    examTranscriptAccumulatorRef.current = '';
    resetTranscript();
    setExamResult(null);
    setExamPhase('prep');
  };

  const startExamSpeakingPhase = () => {
    setExamPhase('speaking');
    resetTranscript();
    startListening();
  };

  const handleFinishExamSpeaking = async () => {
    stopListening();
    setExamPhase('evaluating');

    const spokenText = fullTranscript.trim() || examTranscriptAccumulatorRef.current.trim();
    const duration = selectedExamQuestion.speakingTimeSeconds - speakingSecondsLeft;

    try {
      const result = await evaluateSpeakingExam(
        selectedExamQuestion,
        spokenText || 'I would like to discuss this topic in detail...',
        Math.max(15, duration)
      );

      setExamResult(result);
      setExamPhase('result');

      // Award XP
      if (profile?.uid) {
        const prevXP = profile.xp || 0;
        const nextXP = prevXP + result.xpEarned;
        setProfile({
          ...profile,
          xp: nextXP,
          level: calculateLevel(nextXP),
        });

        await recordSpeakingSession(profile.uid, {
          mode: 'exam',
          title: `Exam: ${selectedExamQuestion.topic}`,
          xpEarned: result.xpEarned,
          durationSeconds: duration,
          turnsCount: 1,
          score: (result.scores.overall / 9) * 10,
        });
        toast.success(`🎉 Chúc mừng! Bạn nhận được +${result.xpEarned} XP!`);
      }
    } catch (err) {
      toast.error('Lỗi khi chấm điểm. Vui lòng thử lại.');
      setExamPhase('select');
    }
  };

  // Filter scenarios
  const filteredScenarios =
    selectedCategory === 'all'
      ? SPEAKING_SCENARIOS
      : SPEAKING_SCENARIOS.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-6 pb-14">
      {/* 1. Module Navigation */}
      <LearningModuleNav active="speaking" />

      {/* 2. Intro Section (Hidden during active session to maximize chat vertical room) */}
      {!activeScenario && examPhase === 'select' && (
        <LearningIntro
          eyebrow="AI Speaking Studio"
          title="Luyện Nói & Thi Thử Với AI"
          description="Giao tiếp phản xạ tự nhiên cùng AI Partner theo tình huống thực tế hoặc thử sức với phòng thi Speaking mô phỏng chuẩn CEFR / IELTS."
          icon={Icons.Mic}
          accent="violet"
          aside={
            <div className="flex w-full flex-col justify-between gap-3 text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Gemini AI Engine
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`flex h-2.5 w-2.5 rounded-full ${
                      apiKeySet ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-800">
                    {apiKeySet ? 'Gemini 3.5 Flash (Online)' : 'Chế độ mô phỏng thông minh'}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsApiKeyModalOpen(true)}
                className="w-full justify-center gap-1.5 border-slate-200 text-xs font-semibold"
              >
                <Icons.Settings className="h-3.5 w-3.5" />
                <span>{apiKeySet ? 'Cấu hình Key' : 'Thêm Gemini Key'}</span>
              </Button>
            </div>
          }
        />
      )}

      {/* Browser Speech Warning (if not supported) */}
      {!speechSupported && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-center gap-3">
          <Icons.AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <strong>Lưu ý trình duyệt:</strong> Trình duyệt của bạn hiện chưa hỗ trợ đầy đủ Web Speech API. Bạn nên sử dụng <strong>Google Chrome</strong> hoặc <strong>Microsoft Edge</strong> trên máy tính hoặc điện thoại Android để trải nghiệm nhận diện giọng nói mượt mà nhất.
          </div>
        </div>
      )}

      {/* 3. Speaking Mode Tabs (Only when not in active exam/roleplay session) */}
      {!activeScenario && examPhase === 'select' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('roleplay')}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'roleplay'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Icons.MessagesSquare className="h-4 w-4 text-sky-600" />
              <span>AI Roleplay Partner</span>
            </button>
            <button
              onClick={() => setActiveTab('exam')}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'exam'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Icons.Award className="h-4 w-4 text-violet-600" />
              <span>Speaking Exam Studio</span>
            </button>
          </div>

          {/* Quick Actions & History */}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsHistoryModalOpen(true)}
              className="gap-2 border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-2xs text-xs px-3.5 py-1.5"
            >
              <Icons.History className="h-4 w-4 text-indigo-600" />
              <span>Lịch sử luyện nói</span>
              {speakingHistory.length > 0 && (
                <span className="rounded-full bg-indigo-600 px-1.5 py-0.2 text-[10px] font-black text-white">
                  {speakingHistory.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4A. ROLEPLAY MODE                                   */}
      {/* ==================================================== */}
      {activeTab === 'roleplay' && !activeScenario && (
        <div className="space-y-6">
          {/* Header Row: Category Filter Pills + Turn Length Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'Tất cả chủ đề' },
                { id: 'daily', label: '☕ Đời sống & Giao tiếp' },
                { id: 'business', label: '💼 Công việc & Phỏng vấn' },
                { id: 'travel', label: '✈️ Du lịch & Sân bay' },
                { id: 'academic', label: '🎓 Thảo luận & Tranh luận' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Turn Count Length Picker (6 - 10 - 14) */}
            <div className="flex items-center gap-1.5 self-start md:self-auto rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
              <span className="px-2 text-[11px] font-bold text-slate-500">Độ dài:</span>
              {[
                { count: 6, label: 'Ngắn (6)', desc: '6 lượt • ~3-5p' },
                { count: 10, label: 'Vừa (10)', desc: '10 lượt • ~7-10p' },
                { count: 14, label: 'Dài (14)', desc: '14 lượt • ~12-15p' },
              ].map((item) => (
                <button
                  key={item.count}
                  type="button"
                  onClick={() => handleSelectTargetTurns(item.count)}
                  title={item.desc}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    targetTurns === item.count
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Voice Engine Picker (Gemini AI vs Browser Native) */}
            <div className="flex items-center gap-1 self-start md:self-auto rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
              <span className="px-2 text-[11px] font-bold text-slate-500">Giọng AI:</span>
              {[
                { id: 'gemini', label: '✨ Gemini HD', desc: 'Giọng biểu cảm tự nhiên (Aoede / Puck)' },
                { id: 'browser', label: '⚡ Siêu tốc', desc: 'Giọng đọc có sẵn của trình duyệt (0ms)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectVoiceEngine(item.id as VoiceEngine)}
                  title={item.desc}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    voiceEngine === item.id
                      ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Voice Gender Picker (Random / Male / Female) */}
            <div className="flex items-center gap-1 self-start md:self-auto rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
              <span className="px-2 text-[11px] font-bold text-slate-500">Giới tính:</span>
              {[
                { id: 'random', label: '🎲 Ngẫu nhiên', desc: 'Tự động đổi giọng Nam/Nữ sinh động' },
                { id: 'male', label: '👨 Nam', desc: 'Cố định giọng Nam tự nhiên' },
                { id: 'female', label: '👩 Nữ', desc: 'Cố định giọng Nữ tự nhiên' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectVoiceGender(item.id as VoiceGender)}
                  title={item.desc}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    voiceGenderChoice === item.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* AI Random Topic Card: prominent card at top */}
            <RandomTopicCard onSelectScenario={handleStartScenario} />

            {filteredScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onSelect={handleStartScenario}
              />
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE ROLEPLAY CHAT SCREEN */}
      {activeTab === 'roleplay' && activeScenario && (
        <div className="mx-auto max-w-4xl space-y-4">
          {/* Scenario Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                {activeScenario.icon}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    {activeScenario.title}
                  </h2>
                  <Badge variant="default" className="font-mono text-xs">
                    {activeScenario.level}
                  </Badge>
                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/70">
                    {voiceEngine === 'gemini'
                      ? `✨ Gemini ${sessionVoiceGender === 'male' ? '👨 Puck' : '👩 Aoede'}`
                      : `⚡ Browser ${sessionVoiceGender === 'male' ? '👨 Nam' : '👩 Nữ'}`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Vai trò AI: {activeScenario.aiPersona}
                </p>
              </div>
            </div>

            {/* Turn Progress & Action */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                  <span>Lượt: {conversationTurns.filter((t) => t.role === 'user').length}/{targetTurns}</span>
                  {/* Quick toggle between 6, 10, 14 during session */}
                  <div className="hidden sm:inline-flex items-center rounded-md bg-slate-100 p-0.5 border border-slate-200 text-[10px]">
                    {[6, 10, 14].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleSelectTargetTurns(n)}
                        className={`rounded px-1.5 py-0.2 font-bold transition-all cursor-pointer ${
                          targetTurns === n
                            ? 'bg-white text-indigo-700 shadow-2xs'
                            : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title={`Đổi sang ${n} lượt`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-24 sm:w-28 mt-1">
                  <Progress
                    value={Math.min(
                      100,
                      (conversationTurns.filter((t) => t.role === 'user').length / targetTurns) * 100
                    )}
                    height="sm"
                  />
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                disabled={isEvaluatingSession}
                onClick={() => handleCompleteAndReviewSession()}
                className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs"
              >
                <Icons.LogOut className="h-4 w-4" />
                <span>Kết thúc & Nhận xét</span>
              </Button>
            </div>
          </div>

          {/* Suggested phrases pill bar */}
          {activeScenario.suggestedPhrases.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="shrink-0 font-bold text-slate-400 uppercase text-[10px]">
                Gợi ý mở đầu:
              </span>
              {activeScenario.suggestedPhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => setManualInput(phrase)}
                  className="shrink-0 rounded-full border border-sky-100 bg-sky-50/70 px-3 py-1 font-medium text-sky-800 hover:bg-sky-100 transition-colors"
                >
                  "{phrase}"
                </button>
              ))}
            </div>
          )}

          {/* Chat Transcript Area */}
          <Card className="relative flex flex-col border border-slate-200 bg-slate-50/50 shadow-inner h-[580px] sm:h-[640px]">
            {/* Evaluation Loading Overlay */}
            {isEvaluatingSession && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xs p-6 text-center space-y-4 rounded-2xl">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <Icons.Sparkles className="h-8 w-8 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    AI Đang Phân Tích Toàn Bộ Buổi Nói...
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                    Đang tổng hợp 4 tiêu chí CEFR (Ngữ pháp, Từ vựng, Mạch lạc, Phát âm) và mổ xẻ chi tiết từng câu bạn đã nói.
                  </p>
                </div>
              </div>
            )}

            <div
              ref={chatScrollRef}
              className="flex-1 space-y-3.5 overflow-y-auto p-4 sm:p-6"
            >
              {conversationTurns.map((turn) => (
                <ConversationBubble
                  key={turn.id}
                  turn={turn}
                  userAvatar={profile?.avatarUrl}
                  voiceGender={sessionVoiceGender}
                  voiceEngine={voiceEngine}
                />
              ))}

              {/* AI Typing indicator */}
              {isAiResponding && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs font-semibold text-sky-600 pl-2"
                >
                  <Icons.Sparkles className="h-4 w-4 animate-spin text-sky-500" />
                  <span>AI đang phản hồi siêu tốc...</span>
                </motion.div>
              )}
            </div>

            {/* ── Real-time VAD Status Panel ── */}
            <div className="border-t border-slate-200 bg-white p-4 space-y-3">

              {/* Dynamic status indicator */}
              <AnimatePresence mode="wait">
                {vadPhase === 'listening' && (
                  <motion.div
                    key="listening"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50/80 p-3"
                  >
                    <VoiceVisualizer isListening={isListening} audioLevel={audioLevel} size="md" />
                    <p className="text-xs font-bold text-sky-700">
                      🎤 Đang lắng nghe — hãy nói tiếng Anh thong thả
                    </p>
                    {(transcript || interimTranscript) ? (
                      <div className="flex flex-col items-center gap-2 w-full max-w-lg">
                        <p className="max-w-lg text-center text-xs text-slate-700 font-medium italic bg-white/80 px-3.5 py-1.5 rounded-xl border border-sky-100 shadow-2xs">
                          &ldquo;{(transcript + ' ' + interimTranscript).trim()}&rdquo;
                        </p>
                        <div className="flex items-center justify-between gap-3 w-full px-2">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-800">
                            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                            <span>
                              {remainingSilenceSeconds !== null && remainingSilenceSeconds > 0
                                ? `Đang chờ bạn nói tiếp (${remainingSilenceSeconds}s)...`
                                : 'Đang xử lý gửi...'}
                            </span>
                          </span>

                          <button
                            type="button"
                            onClick={handleManualSubmitSpeech}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-sky-700 transition-all cursor-pointer"
                          >
                            <span>Nói xong, gửi luôn</span>
                            <Icons.ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-sky-600">
                        Bạn cứ suy nghĩ và nói thoải mái • AI sẽ đợi {silenceTolerance / 1000}s trước khi gửi
                      </p>
                    )}
                  </motion.div>
                )}

                {vadPhase === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center justify-center gap-3 rounded-2xl border border-violet-200 bg-violet-50/80 p-3"
                  >
                    <Icons.Sparkles className="h-5 w-5 animate-spin text-violet-600" />
                    <div>
                      <p className="text-xs font-bold text-violet-800">AI đang phản hồi siêu tốc...</p>
                      <p className="text-[11px] text-violet-500">Gemini Flash-Lite đang đối đáp tức thì (&lt; 1s)</p>
                    </div>
                  </motion.div>
                )}

                {vadPhase === 'speaking' && (
                  <motion.div
                    key="speaking"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3"
                  >
                    <div className="flex items-end gap-0.5">
                      {[4, 7, 10, 7, 4].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ scaleY: [1, 2.5, 1] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1, ease: 'easeInOut' }}
                          style={{ height: h }}
                          className="w-1 rounded-full bg-emerald-500 origin-bottom"
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-800">AI đang nói...</p>
                      <p className="text-[11px] text-emerald-600">Mic sẽ bật tự động sau khi AI nói xong</p>
                    </div>
                  </motion.div>
                )}

                {vadPhase === 'paused' && (
                  <motion.div
                    key="paused"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-100/80 p-3"
                  >
                    <Icons.MicOff className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Mic đã tắt</p>
                      <p className="text-[11px] text-slate-500">Nhấn nút mic để bật lại và tiếp tục cuộc trò chuyện</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {speechError && (
                <p className="text-center text-xs font-semibold text-rose-600">{speechError}</p>
              )}

              {/* Controls: mic mute toggle + text fallback */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={vadPhase === 'processing' || vadPhase === 'speaking' || vadPhase === 'idle'}
                  title={vadPhase === 'paused' ? 'Bật mic' : 'Tắt mic'}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all shadow-sm ${
                    vadPhase === 'listening'
                      ? 'bg-sky-500 text-white shadow-sky-500/30 ring-4 ring-sky-100'
                      : vadPhase === 'paused'
                      ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  {vadPhase === 'paused' ? (
                    <Icons.MicOff className="h-4 w-4" />
                  ) : (
                    <Icons.Mic className="h-4 w-4" />
                  )}
                </button>

                {/* Text fallback input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && manualInput.trim()) {
                        handleSendRoleplayMessage(manualInput);
                      }
                    }}
                    placeholder="Hoặc gõ câu trả lời tại đây..."
                    disabled={isAiResponding || vadPhase === 'speaking' || vadPhase === 'processing'}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-10 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendRoleplayMessage(manualInput)}
                    disabled={!manualInput.trim() || isAiResponding}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-slate-400 hover:text-sky-600 disabled:opacity-30 transition-colors"
                  >
                    <Icons.Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Toolbar: Voice Engine, Voice Gender & Silence Delay Switchers */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Voice Engine Switcher */}
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-semibold">Nguồn:</span>
                    {[
                      { id: 'gemini', label: '✨ Gemini AI' },
                      { id: 'browser', label: '⚡ Siêu tốc' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectVoiceEngine(opt.id as VoiceEngine)}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                          voiceEngine === opt.id
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Voice Gender Switcher */}
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-semibold">Giọng AI:</span>
                    {(
                      [
                        { id: 'random', label: '🎲 Tự đổi' },
                        { id: 'male', label: '👨 Nam' },
                        { id: 'female', label: '👩 Nữ' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectVoiceGender(opt.id)}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                          voiceGenderChoice === opt.id
                            ? 'bg-sky-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Silence Delay Switcher */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-semibold">Chờ nói:</span>
                  {(
                    [
                      { ms: 4500, label: 'Thong thả (4.5s)' },
                      { ms: 3500, label: 'Chuẩn (3.5s)' },
                      { ms: 2200, label: 'Nhanh (2.2s)' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.ms}
                      type="button"
                      onClick={() => handleSetSilenceTolerance(opt.ms)}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                        silenceTolerance === opt.ms
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4B. EXAM MODE                                        */}
      {/* ==================================================== */}
      {activeTab === 'exam' && (
        <div>
          {/* EXAM SELECT PHASE */}
          {examPhase === 'select' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Chọn chủ đề bài thi Speaking
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mô phỏng thi IELTS Speaking & CEFR Interview
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SPEAKING_EXAM_QUESTIONS.map((q) => (
                  <Card
                    key={q.id}
                    className="flex flex-col justify-between p-5 border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-100">
                          Part {q.part}
                        </span>
                        <Badge variant="default" className="font-mono text-xs">
                          {q.level}
                        </Badge>
                      </div>

                      <h4 className="mt-3 text-base font-bold text-slate-900">
                        {q.topic}
                      </h4>
                      <p className="text-xs font-semibold text-sky-600">{q.viTopic}</p>

                      <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3 italic">
                        "{q.question}"
                      </p>

                      <div className="mt-4 flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Icons.Clock className="h-3.5 w-3.5 text-slate-400" />
                          Chuẩn bị: {q.prepTimeSeconds}s
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Mic className="h-3.5 w-3.5 text-slate-400" />
                          Nói: {q.speakingTimeSeconds}s
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100">
                      <Button
                        onClick={() => handleStartExamPrep(q)}
                        className="w-full justify-center gap-2 bg-slate-950 text-white hover:bg-slate-800 font-bold"
                      >
                        <span>Bắt đầu thi</span>
                        <Icons.ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* EXAM PREPARATION PHASE */}
          {examPhase === 'prep' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-2xl space-y-6"
            >
              <Card className="p-6 sm:p-8 text-center border border-slate-200 bg-white shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
                  <Icons.Hourglass className="h-8 w-8 animate-spin" />
                </div>

                <h2 className="mt-4 text-2xl font-black text-slate-900">
                  Thời Gian Chuẩn Bị
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Đọc kỹ câu hỏi và sắp xếp các ý chính trong đầu
                </p>

                {/* Big Countdown Clock */}
                <div className="my-6">
                  <span className="font-mono text-6xl font-black text-sky-600">
                    00:{String(prepSecondsLeft).padStart(2, '0')}
                  </span>
                </div>

                {/* Question Box */}
                <div className="rounded-2xl bg-slate-50 p-5 text-left border border-slate-200">
                  <span className="text-[11px] font-bold uppercase text-sky-700">
                    Câu hỏi của bạn (Part {selectedExamQuestion.part}):
                  </span>
                  <p className="mt-2 text-base font-bold text-slate-900 leading-relaxed">
                    {selectedExamQuestion.question}
                  </p>

                  {selectedExamQuestion.cuePoints && (
                    <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600">
                      <span className="font-bold text-slate-800">Các gợi ý cần nêu:</span>
                      <ul className="mt-2 space-y-1 list-disc pl-5">
                        {selectedExamQuestion.cuePoints.map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setExamPhase('select')}
                  >
                    Hủy bài thi
                  </Button>
                  <Button
                    onClick={startExamSpeakingPhase}
                    className="bg-slate-950 text-white hover:bg-slate-800 font-bold px-6"
                  >
                    Bắt đầu nói ngay (Bỏ qua đếm ngược)
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* EXAM SPEAKING PHASE */}
          {examPhase === 'speaking' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto max-w-2xl space-y-6"
            >
              <Card className="p-6 sm:p-8 text-center border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <Badge variant="default" className="font-mono text-xs">
                    {selectedExamQuestion.topic}
                  </Badge>
                  <div className="flex items-center gap-2 text-rose-600 font-mono font-bold text-sm">
                    <Icons.Circle className="h-3 w-3 fill-rose-600 animate-ping" />
                    <span>00:{String(speakingSecondsLeft).padStart(2, '0')}</span>
                  </div>
                </div>

                <div className="my-6">
                  <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                    "{selectedExamQuestion.question}"
                  </p>
                </div>

                {/* Voice Visualizer */}
                <div className="my-8 flex flex-col items-center justify-center">
                  <div className="h-20 flex items-center justify-center">
                    <VoiceVisualizer isListening={isListening} audioLevel={audioLevel} size="lg" />
                  </div>
                  <p className="mt-4 text-xs font-semibold text-slate-500">
                    {isListening
                      ? 'Micro đang thu âm... Hãy nói to, rõ ràng và tự nhiên'
                      : 'Đang tạm dừng thu âm'}
                  </p>
                </div>

                {/* Live Transcript View */}
                <div className="rounded-xl bg-slate-50 p-4 text-left border border-slate-100 min-h-24">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Live Transcript:
                  </span>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed italic">
                    "{fullTranscript || 'Chưa ghi nhận từ nào... hãy cất tiếng nói!'}"
                  </p>
                </div>

                <div className="mt-6 flex justify-center gap-3">
                  <Button
                    onClick={handleFinishExamSpeaking}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-8 py-2.5 shadow-sm"
                  >
                    <Icons.Check className="h-4 w-4 mr-2" />
                    <span>Nộp bài & Chấm điểm</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* EXAM EVALUATING / GRADING PHASE */}
          {examPhase === 'evaluating' && (
            <div className="mx-auto max-w-md py-12 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Icons.Sparkles className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Giám khảo AI đang chấm bài...
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Đang đối chiếu transcript với 4 tiêu chí CEFR: Fluency, Lexical Resource, Grammatical Accuracy và Pronunciation.
              </p>
            </div>
          )}

          {/* EXAM RESULT PHASE */}
          {examPhase === 'result' && examResult && (
            <ExamScoreCard
              result={examResult}
              onRetry={() => {
                setExamPhase('select');
                resetTranscript();
              }}
              onExit={() => {
                setExamPhase('select');
                setActiveTab('roleplay');
              }}
            />
          )}
        </div>
      )}

      {/* 5. API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={() => setApiKeySet(hasGeminiApiKey())}
      />

      {/* 6. End-of-Session Comprehensive Review Modal */}
      {(reviewScenario || activeScenario) && (
        <SpeakingSessionReviewModal
          isOpen={isReviewModalOpen}
          report={sessionReport}
          scenario={reviewScenario || activeScenario!}
          onClose={handleCloseReviewModal}
          onRetry={handleRetryScenario}
        />
      )}

      {/* 7. Speaking History Modal */}
      <SpeakingHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={speakingHistory}
        onViewReport={(report, title) => {
          setSessionReport(report);
          const foundScenario = SPEAKING_SCENARIOS.find((s) => s.title === title);
          setReviewScenario(
            foundScenario || {
              id: 'history_item',
              title,
              viTitle: title,
              description: '',
              icon: '🎙️',
              level: 'B2',
              category: 'daily',
              starterPrompt: '',
              aiPersona: '',
              suggestedPhrases: [],
            }
          );
          setIsHistoryModalOpen(false);
          setIsReviewModalOpen(true);
        }}
        onDeleteItem={(id) => {
          const uid = profile?.uid || 'guest';
          const updated = deleteSpeakingHistoryItem(uid, id);
          setSpeakingHistory(updated);
        }}
      />
    </div>
  );
}
