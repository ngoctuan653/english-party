import React, { useState } from 'react';
import { Volume2, RotateCw, CheckCircle, Sparkles, BookOpen } from 'lucide-react';
import type { ChineseVocabWord } from '@/types/chinese';
import { ToneColorText } from './ToneColorText';
import { speakChineseText } from '@/utils/chineseSpeech';

interface HanziCardProps {
  word: ChineseVocabWord;
  onRate?: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
  showRatingButtons?: boolean;
}

export const HanziCard: React.FC<HanziCardProps> = ({
  word,
  onRate,
  showRatingButtons = true,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handlePlayAudio = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    speakChineseText(text, { rate: 0.8 });
  };

  return (
    <div className="w-full max-w-md mx-auto perspective-1000 select-none">
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`relative min-h-[360px] rounded-3xl border border-slate-800 p-7 cursor-pointer transition-all duration-500 shadow-2xl flex flex-col justify-between ${
          isFlipped
            ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-rose-500/40 shadow-rose-950/20'
            : 'bg-gradient-to-b from-slate-900/90 to-slate-950 border-slate-800 hover:border-slate-700'
        }`}
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
              {word.hskLevel.toUpperCase()}
            </span>
            {word.partOfSpeech && (
              <span className="text-[11px] text-slate-400 capitalize px-2 py-0.5 rounded bg-slate-800">
                {word.partOfSpeech}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => handlePlayAudio(word.hanzi, e)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-white transition-colors"
              title="Phát âm"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <RotateCw className="h-3.5 w-3.5" />
              <span>Chạm để lật</span>
            </span>
          </div>
        </div>

        {/* Center Content */}
        {!isFlipped ? (
          // Mặt trước: Hán tự nổi bật
          <div className="my-auto text-center space-y-4 py-8">
            <div className="text-6xl sm:text-7xl font-black text-white tracking-wider font-sans drop-shadow-md">
              {word.hanzi}
            </div>

            {word.radicals && word.radicals.length > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
                <span>Bộ thủ: <strong className="text-amber-400">{word.radicals.join(', ')}</strong></span>
                {word.strokeCount && (
                  <span>• <strong className="text-slate-300">{word.strokeCount}</strong> nét</span>
                )}
              </div>
            )}
          </div>
        ) : (
          // Mặt sau: Pinyin, Nghĩa, Câu mẫu
          <div className="my-auto space-y-4 py-2">
            <div className="text-center">
              <div className="text-4xl font-black text-white">{word.hanzi}</div>
              <div className="mt-1 flex items-center justify-center gap-2">
                <ToneColorText pinyin={word.pinyin} className="text-xl font-bold font-mono" />
                {word.sinoVietnamese && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    HV: {word.sinoVietnamese}
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center">
              <div className="text-sm font-bold text-rose-300">{word.meaningVi}</div>
              {word.meaningEn && (
                <div className="text-xs text-slate-400 mt-0.5 italic">{word.meaningEn}</div>
              )}
            </div>

            {word.examples && word.examples.length > 0 && (
              <div className="space-y-2 border-t border-slate-800/80 pt-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Câu ví dụ:</span>
                </div>
                {word.examples.slice(0, 1).map((ex, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => handlePlayAudio(ex.hanzi, e)}
                    className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="text-sm font-bold text-white flex items-center justify-between">
                      <span>{ex.hanzi}</span>
                      <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <div className="text-xs text-rose-300 font-mono mt-0.5">{ex.pinyin}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{ex.meaningVi}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom SRS Rating Buttons (Chỉ hiện khi đã lật mặt sau) */}
        {isFlipped && showRatingButtons && (
          <div
            className="pt-4 border-t border-slate-800 grid grid-cols-4 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onRate?.('again')}
              className="px-2 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 text-xs font-bold transition-all text-center"
            >
              <div className="leading-tight">Lặp lại</div>
              <div className="text-[10px] text-rose-400/80">&lt; 10m</div>
            </button>
            <button
              onClick={() => onRate?.('hard')}
              className="px-2 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/50 text-xs font-bold transition-all text-center"
            >
              <div className="leading-tight">Khó</div>
              <div className="text-[10px] text-amber-400/80">1 ngày</div>
            </button>
            <button
              onClick={() => onRate?.('good')}
              className="px-2 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/50 text-xs font-bold transition-all text-center"
            >
              <div className="leading-tight">Tốt</div>
              <div className="text-[10px] text-blue-400/80">3 ngày</div>
            </button>
            <button
              onClick={() => onRate?.('easy')}
              className="px-2 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 text-xs font-bold transition-all text-center"
            >
              <div className="leading-tight">Dễ</div>
              <div className="text-[10px] text-emerald-400/80">7 ngày</div>
            </button>
          </div>
        )}

        {!isFlipped && (
          <div className="text-center text-xs text-slate-500 py-1">
            Gợi ý: Nhấn vào thẻ để kiểm tra nghĩa và ví dụ câu
          </div>
        )}
      </div>
    </div>
  );
};
