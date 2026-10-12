import React from 'react';
import { Crown, Sparkles, Zap, ChevronRight, Lock } from 'lucide-react';
import { useSpeakingQuota } from '@/hooks/useSpeakingQuota';

interface SpeakingQuotaWidgetProps {
  className?: string;
  language?: 'english' | 'chinese';
}

export const SpeakingQuotaWidget: React.FC<SpeakingQuotaWidgetProps> = ({
  className = '',
  language = 'english',
}) => {
  const {
    isPremium,
    remainingTurns,
    maxFreeTurns,
    turnsUsedToday,
    expiresAt,
    openUpgradeModal,
  } = useSpeakingQuota();

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Vĩnh viễn';

  if (isPremium) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50/60 border border-amber-200/80 p-4 shadow-sm ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-200/60 shrink-0">
              <Crown className="h-5 w-5 fill-amber-200 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200/80">
                  VIP Speaking Member
                </span>
                <span className="text-xs text-slate-500">
                  Hạn dùng: <strong className="text-slate-800">{formattedExpiry}</strong>
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>Không giới hạn lượt hội thoại & phân tích phát âm chuyên sâu (24/7)</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openUpgradeModal()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200/80 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <span>Quản lý gói</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Free Tier
  const isOutOfTurns = remainingTurns <= 0;

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition-all ${
        isOutOfTurns
          ? 'bg-rose-50/70 border-rose-200/90'
          : 'bg-white border-slate-200/80'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isOutOfTurns
                ? 'bg-rose-100 text-rose-600'
                : 'bg-amber-50 text-amber-600 border border-amber-200/60'
            }`}
          >
            {isOutOfTurns ? (
              <Lock className="h-5 w-5" />
            ) : (
              <Zap className="h-5 w-5 fill-amber-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isOutOfTurns
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Gói Miễn Phí
              </span>

              {/* Progress indicators */}
              <div className="flex items-center gap-1">
                {Array.from({ length: maxFreeTurns }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i < turnsUsedToday
                        ? 'bg-rose-400'
                        : 'bg-slate-200'
                    }`}
                    title={i < turnsUsedToday ? 'Đã sử dụng' : 'Chưa sử dụng'}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
              {isOutOfTurns ? (
                <span className="text-rose-700">
                  Bạn đã dùng hết {maxFreeTurns}/{maxFreeTurns} lượt nói AI miễn phí hôm nay.
                </span>
              ) : (
                <span>
                  Hôm nay bạn còn{' '}
                  <strong className="text-amber-600 font-mono text-base">
                    {remainingTurns}
                  </strong>
                  /{maxFreeTurns} lượt luyện nói AI {language === 'chinese' ? 'tiếng Trung' : 'tiếng Anh'}.
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openUpgradeModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-200/50 transition-all hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer"
        >
          <Crown className="h-4 w-4 fill-amber-200 text-white" />
          <span>{isOutOfTurns ? 'Nâng Cấp VIP Mở Khóa' : 'Nâng Cấp Không Giới Hạn'}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
