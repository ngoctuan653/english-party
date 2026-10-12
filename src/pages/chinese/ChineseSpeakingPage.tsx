import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Award,
  BookOpen,
  MessageSquare,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CHINESE_SPEAKING_SCENARIOS } from '@/data/chinese/speaking-scenarios';
import type { ChineseSpeakingScenario } from '@/data/chinese/speaking-scenarios';
import { sendChineseSpeakingMessage, type ChineseRoleplayReply } from '@/services/chineseGemini';
import { speakChineseText } from '@/utils/chineseSpeech';
import { useSpeakingQuota } from '@/hooks/useSpeakingQuota';
import { SpeakingQuotaWidget } from '@/components/payment/SpeakingQuotaWidget';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  hanzi: string;
  pinyin?: string;
  meaningVi?: string;
  evaluation?: {
    accuracyScore: number;
    pinyinFeedback: string;
    grammarFeedback: string;
    suggestedImprovement: string;
  };
}

export default function ChineseSpeakingPage() {
  const { canSpeak, consumeTurn, openUpgradeModal } = useSpeakingQuota();

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    CHINESE_SPEAKING_SCENARIOS[0].id
  );
  const currentScenario =
    CHINESE_SPEAKING_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    CHINESE_SPEAKING_SCENARIOS[0];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoadingReply, setIsLoadingReply] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize conversation with the scenario's initial AI message
  useEffect(() => {
    setMessages([
      {
        id: 'init_ai',
        sender: 'ai',
        hanzi: currentScenario.initialAiMessage.hanzi,
        pinyin: currentScenario.initialAiMessage.pinyin,
        meaningVi: currentScenario.initialAiMessage.meaningVi,
      },
    ]);
  }, [selectedScenarioId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingReply]);

  // Setup Web Speech API for zh-CN
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa hỗ trợ Web Speech API tiếng Trung. Bạn có thể gõ trực tiếp văn bản.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoadingReply) return;

    // Check Quota Guard
    if (!canSpeak) {
      toast.error('Bạn đã dùng hết số lượt nói AI miễn phí hôm nay! Vui lòng nâng cấp VIP hoặc nhập Voucher để tiếp tục.');
      openUpgradeModal();
      return;
    }

    // Consume 1 turn if free user
    consumeTurn('chinese');

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      hanzi: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoadingReply(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'ai' ? ('model' as const) : ('user' as const),
        text: m.hanzi,
      }));

      const reply: ChineseRoleplayReply = await sendChineseSpeakingMessage({
        scenarioTitle: currentScenario.title,
        scenarioRole: currentScenario.aiRole,
        hskLevel: currentScenario.hskLevel,
        userSpeechText: textToSend,
        conversationHistory: history,
      });

      // Attach evaluation to user message
      if (reply.evaluation) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsg.id ? { ...m, evaluation: reply.evaluation } : m
          )
        );
      }

      // Add AI reply message
      const aiReplyMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        hanzi: reply.aiMessageHanzi,
        pinyin: reply.aiMessagePinyin,
        meaningVi: reply.aiMessageMeaningVi,
      };

      setMessages((prev) => [...prev, aiReplyMsg]);

      // Speak AI message
      speakChineseText(reply.aiMessageHanzi, { rate: 0.85 });
    } catch (err) {
      console.error('Error getting AI reply:', err);
    } finally {
      setIsLoadingReply(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'init_ai',
        sender: 'ai',
        hanzi: currentScenario.initialAiMessage.hanzi,
        pinyin: currentScenario.initialAiMessage.pinyin,
        meaningVi: currentScenario.initialAiMessage.meaningVi,
      },
    ]);
    setInputText('');
  };

  const handlePlayAudio = (text: string) => {
    speakChineseText(text, { rate: 0.85 });
  };

  return (
    <div className="space-y-4 pb-8 flex flex-col" style={{ minHeight: 'calc(100vh - 10rem)' }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-200">
              AI Speaking Tutor
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentScenario.hskLevel.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {currentScenario.titleVi}
          </h1>
        </div>

        {/* Scenario dropdown selector */}
        <select
          value={selectedScenarioId}
          onChange={(e) => setSelectedScenarioId(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30"
        >
          {CHINESE_SPEAKING_SCENARIOS.map((scen) => (
            <option key={scen.id} value={scen.id}>
              {scen.titleVi} ({scen.hskLevel.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Speaking Quota VIP Widget */}
      <SpeakingQuotaWidget language="chinese" />

      {/* Scenario Info Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="font-bold text-amber-600 block mb-0.5">Bối cảnh:</span>
          {currentScenario.situation}
        </div>
        <div className="shrink-0 text-right">
          <span className="text-slate-400 block">Vai của bạn:</span>
          <span className="font-bold text-slate-800">{currentScenario.userRole}</span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="space-y-4 flex-1 overflow-y-auto pb-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} space-y-1.5`}
            >
              <div className="text-[10px] text-slate-400 px-1 font-bold">
                {isAi ? currentScenario.aiRole : 'Bạn'}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl space-y-1.5 shadow-sm ${
                  isAi
                    ? 'bg-white border border-slate-200/80 rounded-tl-sm text-slate-800'
                    : 'bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-tr-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-base sm:text-lg font-bold">{msg.hanzi}</div>
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(msg.hanzi)}
                    className={`p-1.5 rounded-lg shrink-0 transition-colors cursor-pointer ${
                      isAi
                        ? 'bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-200/60'
                        : 'bg-rose-700/60 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {msg.pinyin && (
                  <div className={`text-xs font-mono ${isAi ? 'text-rose-500' : 'text-rose-100'}`}>
                    {msg.pinyin}
                  </div>
                )}

                {msg.meaningVi && (
                  <div
                    className={`text-xs ${
                      isAi ? 'text-slate-500 border-t border-slate-100 pt-1' : 'text-rose-100'
                    }`}
                  >
                    {msg.meaningVi}
                  </div>
                )}
              </div>

              {/* AI Turn Evaluation Card */}
              {msg.evaluation && (
                <div className="max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-2 text-xs shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-amber-600 flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" /> Đánh giá phản xạ
                    </span>
                    <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {msg.evaluation.accuracyScore} / 100 Điểm
                    </span>
                  </div>

                  <div className="text-slate-600">
                    <strong>Phát âm:</strong> {msg.evaluation.pinyinFeedback}
                  </div>

                  <div className="text-slate-600">
                    <strong>Ngữ pháp:</strong> {msg.evaluation.grammarFeedback}
                  </div>

                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-600 font-medium">
                    💡 <strong>Gợi ý câu tự nhiên hơn:</strong> {msg.evaluation.suggestedImprovement}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {isLoadingReply && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-3 bg-white rounded-2xl w-fit border border-slate-200/80 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>Gia sư AI đang lắng nghe và suy nghĩ...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sample Prompt Suggestions */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>Gợi ý câu trả lời nhanh:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentScenario.sampleResponses.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sample.hanzi)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-xs text-slate-600 hover:text-slate-800 transition-all text-left cursor-pointer"
            >
              <span>{sample.hanzi}</span>
              <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({sample.meaningVi})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Controls Bar */}
      <div className="p-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-2">
        {/* Mic Button */}
        <button
          onClick={toggleListening}
          className={`p-3 rounded-xl transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-200/50'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
          }`}
          title={isListening ? 'Đang lắng nghe... bấm để dừng' : 'Bấm để nói tiếng Trung'}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          placeholder={
            isListening ? 'Đang nghe tiếng Trung...' : 'Nhập câu tiếng Trung hoặc bấm mic nói...'
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoadingReply}
          className="p-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-40 text-white transition-colors cursor-pointer"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
