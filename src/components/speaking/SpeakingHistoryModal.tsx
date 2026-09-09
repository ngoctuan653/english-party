import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { RoleplaySessionReport, SpeakingHistoryItem } from '@/types/speaking';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface SpeakingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SpeakingHistoryItem[];
  onViewReport: (report: RoleplaySessionReport, title: string) => void;
  onRetryScenario?: (scenarioId: string) => void;
  onDeleteItem?: (id: string) => void;
}

export function SpeakingHistoryModal({
  isOpen,
  onClose,
  history,
  onViewReport,
  onRetryScenario,
  onDeleteItem,
}: SpeakingHistoryModalProps) {
  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.0) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 6.5) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (score >= 5.0) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 flex flex-col w-full max-w-2xl max-h-[88vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 shadow-xs">
                <Icons.History className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Lịch Sử Luyện Nói Speaking
                </h2>
                <p className="text-xs text-slate-500">
                  {history.length > 0
                    ? `Đã hoàn thành ${history.length} buổi luyện tập với AI`
                    : 'Chưa có buổi luyện tập nào'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
            >
              <Icons.X className="h-5 w-5" />
            </button>
          </div>

          {/* Body: List or Empty State */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 mb-3 border border-indigo-100">
                  <Icons.Mic className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Chưa có lịch sử luyện nói
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  Hãy chọn một kịch bản hoặc bấm "Tạo chủ đề ngẫu nhiên" để bắt đầu luyện phản xạ nói với AI!
                </p>
                <Button
                  onClick={onClose}
                  className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2"
                >
                  Bắt đầu luyện tập ngay
                </Button>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all"
                >
                  {/* Left: Icon, Title, Date, Meta */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-xl shadow-2xs">
                      {item.scenarioIcon || '🎙️'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 leading-snug truncate">
                          {item.scenarioTitle}
                        </h4>
                        <Badge variant="default" className="font-mono text-[10px] font-bold text-slate-700">
                          {item.level}
                        </Badge>
                      </div>

                      {/* Meta chips */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Icons.Calendar className="h-3 w-3" />
                          {formatDate(item.date)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Icons.Clock className="h-3 w-3" />
                          {formatDuration(item.durationSeconds)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Icons.MessageSquare className="h-3 w-3" />
                          {item.turnsCount} câu nói
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    {/* Score Badge */}
                    <div className="flex items-center gap-1.5">
                      <div className={`rounded-lg border px-2.5 py-1 text-center font-bold text-xs ${getScoreColor(item.overallScore)}`}>
                        <span className="text-sm font-black">{item.overallScore}</span>
                        <span className="text-[10px] text-slate-400">/10</span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                        +{item.xpEarned} XP
                      </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => onViewReport(item.report, item.scenarioTitle)}
                        className="gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5"
                      >
                        <Icons.FileText className="h-3.5 w-3.5" />
                        <span>Xem chi tiết</span>
                      </Button>

                      {onDeleteItem && (
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Xóa buổi này"
                        >
                          <Icons.Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 bg-slate-50/50">
            <p className="text-[11px] text-slate-500">
              💡 Bấm "Xem chi tiết" để ôn lại từng lỗi sai, câu sửa và nghe câu mẫu bản xứ.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Đóng
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
