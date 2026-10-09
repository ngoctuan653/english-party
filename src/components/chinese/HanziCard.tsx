import React, { useState } from 'react';
import { Volume2, RotateCw, Sparkles } from 'lucide-react';
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
        className={`relative min-h-[380px] rounded-3xl p-7 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between ${
          isFlipped
            ? 'bg-white border-2 border-rose-200 shadow-rose-100/50'
            : 'bg-white border border-slate-200/90 hover:border-rose-300'
        }`}
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 font-mono">
              {word.hskLevel.toUpperCase()}
            </span>
            {word.partOfSpeech && (
              <span className="text-[11px] text-slate-500 capitalize px-2 py-0.5 rounded bg-slate-100 font-medium">
                {word.partOfSpeech}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => handlePlayAudio(word.hanzi, e)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
              title="Phát âm"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <RotateCw className="h-3.5 w-3.5" />
              <span>Chạm để lật</span>
            </span>
          </div>
        </div>

        {/* Center Content */}
        {!isFlipped ? (
          // Mặt trước: Hán tự nổi bật
          <div className="my-auto text-center space-y-4 py-8">
            <div className="text-6xl sm:text-7xl font-black text-slate-900 tracking-wider font-sans">
              {word.hanzi}
            </div>

            {word.radicals && word.radicals.length > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                <span>
                  Bộ thủ: <strong className="text-rose-600">{word.radicals.join(', ')}</strong>
                </span>
                {word.strokeCount && (
                  <span>
                    • <strong className="text-slate-800">{word.strokeCount}</strong> nét
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          // Mặt sau: Pinyin, Nghĩa, Câu mẫu
          <div className="my-auto space-y-4 py-2">
            <div className="text-center">
              <div className="text-4xl font-black text-slate-900">{word.hanzi}</div>
              <div className="mt-1 flex items-center justify-center gap-2">
                <ToneColorText pinyin={word.pinyin} className="text-xl font-bold font-mono" />
                {word.sinoVietnamese && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                    HV: {word.sinoVietnamese}
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-center">
              <div className="text-sm font-bold text-rose-700">{word.meaningVi}</div>
              {word.meaningEn && (
                <div className="text-xs text-slate-500 mt-0.5 italic">{word.meaningEn}</div>
              )}
            </div>

            {word.examples && word.examples.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>Câu ví dụ:</span>
                </div>
                {word.examples.slice(0, 1).map((ex, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => handlePlayAudio(ex.hanzi, e)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200/80 hover:border-rose-200 transition-colors cursor-pointer"
                  >
                    <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
                      <span>{ex.hanzi}</span>
                      <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <div className="text-xs text-rose-600 font-mono mt-0.5">{ex.pinyin}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{ex.meaningVi}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom SRS Rating Buttons */}
        {isFlipped && showRatingButtons && (
          <div
            className="pt-4 border-t border-slate-100 grid grid-cols-4 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onRate?.('again')}
              className="px-2 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all text-center cursor-pointer"
            >
              <div className="leading-tight">Lặp lại</div>
              <div className="text-[10px] text-rose-500">&lt; 10m</div>
            </button>
            <button
              onClick={() => onRate?.('hard')}
              className="px-2 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-all text-center cursor-pointer"
            >
              <div className="leading-tight">Khó</div>
              <div className="text-[10px] text-amber-600">1 ngày</div>
            </button>
            <button
              onClick={() => onRate?.('good')}
              className="px-2 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all text-center cursor-pointer"
            >
              <div className="leading-tight">Tốt</div>
              <div className="text-[10px] text-blue-500">3 ngày</div>
            </button>
            <button
              onClick={() => onRate?.('easy')}
              className="px-2 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all text-center cursor-pointer"
            >
              <div className="leading-tight">Dễ</div>
              <div className="text-[10px] text-emerald-600">7 ngày</div>
            </button>
          </div>
        )}

        {!isFlipped && (
          <div className="text-center text-xs text-slate-400 py-1">
            Gợi ý: Nhấn vào thẻ để kiểm tra nghĩa và ví dụ câu
          </div>
        )}
      </div>
    </div>
  );
};
