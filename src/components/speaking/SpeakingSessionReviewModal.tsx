import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { RoleplaySessionReport, SpeakingScenario } from '@/types/speaking';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { speakEnglishText } from '@/utils/speech';

interface SpeakingSessionReviewModalProps {
  isOpen: boolean;
  report: RoleplaySessionReport | null;
  scenario: SpeakingScenario;
  onClose: () => void;
  onRetry: () => void;
}

export function SpeakingSessionReviewModal({
  isOpen,
  report,
  scenario,
  onClose,
  onRetry,
}: SpeakingSessionReviewModalProps) {
  const [playingTurnIndex, setPlayingTurnIndex] = useState<number | null>(null);

  if (!isOpen || !report) return null;

  const { overall_score, scores, summary_feedback, detailed_turns, xpEarned, durationSeconds } = report;

  const handlePlayAudio = (text: string, index: number) => {
    if (playingTurnIndex === index) {
      window.speechSynthesis?.cancel();
      setPlayingTurnIndex(null);
      return;
    }

    setPlayingTurnIndex(index);
    speakEnglishText(text, {
      onEnd: () => setPlayingTurnIndex(null),
      onError: () => setPlayingTurnIndex(null),
    });
  };

  const criteriaList = [
    { label: 'Ngữ pháp (Grammar)', score: scores.grammar, desc: 'Độ chính xác cấu trúc & thì' },
    { label: 'Từ vựng (Vocabulary)', score: scores.vocabulary, desc: 'Độ phong phú & chuẩn collocation' },
    { label: 'Mạch lạc & Phản xạ (Coherence)', score: scores.coherence, desc: 'Lưu loát & đúng trọng tâm' },
    { label: 'Phát âm (Pronunciation)', score: scores.pronunciation ?? overall_score, desc: 'Ngữ điệu & nhịp điệu tự nhiên' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        >
          {/* Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-6 text-white shrink-0">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{scenario.icon}</span>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-300">
                    Báo Cáo Tổng Kết Buổi Nói
                  </span>
                  <Badge variant="default" className="border-white/20 text-white font-mono text-[11px] bg-white/10">
                    {scenario.level}
                  </Badge>
                </div>
                <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">
                  {scenario.title}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Thời lượng: {durationSeconds}s • Tổng số lượt nói: {detailed_turns.length} câu
                </p>
              </div>

              {/* Overall Score + XP */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-sm border border-white/10 min-w-24">
                  <span className="text-[10px] font-bold uppercase text-slate-300">Điểm Overall</span>
                  <span className="text-3xl font-black text-sky-400">
                    {overall_score.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-400">/ 10.0</span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-500/20 px-4 py-2.5 border border-amber-500/30 min-w-24">
                  <span className="text-[10px] font-bold uppercase text-amber-300">XP Nhận Được</span>
                  <span className="text-2xl font-black text-amber-400">+{xpEarned}</span>
                  <span className="text-[10px] text-amber-200">Kinh nghiệm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* 1. 4 Criteria Progress Bars */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3.5">
                Đánh giá theo 4 tiêu chí chuẩn CEFR / IELTS
              </h3>
              <div className="grid gap-3.5 sm:grid-cols-2">
                {criteriaList.map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800">{item.label}</span>
                        <span className="block text-[10px] text-slate-500">{item.desc}</span>
                      </div>
                      <span className="text-base font-black text-slate-900">
                        {item.score.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Progress value={item.score * 10} height="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Summary Feedback */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-2">
                <Icons.MessageSquareQuote className="h-4 w-4 text-indigo-600" />
                <span>Nhận xét tổng quan từ AI Coach:</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                {summary_feedback}
              </p>
            </div>

            {/* 3. Detailed Per-Turn Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icons.SpellCheck className="h-4 w-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Mổ xẻ & Sửa lỗi chi tiết từng câu nói ({detailed_turns.length} câu)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Bấm loa để nghe phát âm mẫu chuẩn bản xứ
                </span>
              </div>

              <div className="space-y-3.5">
                {detailed_turns.map((turn, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
                  >
                    {/* Turn header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
                          {turn.turn_index}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Lượt nói {turn.turn_index}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          turn.score >= 8
                            ? 'bg-emerald-100 text-emerald-800'
                            : turn.score >= 6
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {turn.score.toFixed(1)}/10
                      </span>
                    </div>

                    {/* What user said */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Câu bạn đã nói:
                      </span>
                      <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-800 italic">
                        &ldquo;{turn.user_said}&rdquo;
                      </p>
                    </div>

                    {/* Grammar correction & explanation */}
                    <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-rose-600">Sửa lại:</span>
                        <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800 line-through border border-rose-200">
                          {turn.user_said}
                        </span>
                        <Icons.ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                          {turn.correction}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 pl-0.5">
                        💡 <span className="font-medium">{turn.explanation}</span>
                      </p>
                    </div>

                    {/* Better alternative with TTS audio */}
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-3 text-emerald-950">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-emerald-700">
                          Cách diễn đạt chuẩn bản xứ (Native Phrasing):
                        </span>
                        <p className="mt-0.5 text-xs sm:text-sm font-medium italic">
                          &ldquo;{turn.better_alternative}&rdquo;
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePlayAudio(turn.better_alternative, idx)}
                        title="Nghe phát âm bản xứ"
                        className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-700 hover:bg-emerald-100 shadow-2xs border border-emerald-200 transition-colors"
                      >
                        {playingTurnIndex === idx ? (
                          <Icons.Volume2 className="h-4 w-4 animate-pulse text-emerald-600" />
                        ) : (
                          <Icons.Volume1 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
            <Button
              variant="secondary"
              onClick={onRetry}
              className="w-full sm:w-auto gap-2 border-slate-300 font-bold"
            >
              <Icons.RotateCcw className="h-4 w-4" />
              <span>Luyện tập lại kịch bản này</span>
            </Button>
            <Button
              onClick={onClose}
              className="w-full sm:w-auto gap-2 bg-slate-950 text-white hover:bg-slate-800 font-bold px-6 shadow-sm"
            >
              <Icons.Check className="h-4 w-4" />
              <span>Hoàn tất & Về danh sách</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
