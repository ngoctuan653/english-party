import React from 'react';
import type { ToneNumber } from '@/types/chinese';

interface ToneColorTextProps {
  hanzi?: string;
  pinyin?: string;
  showPinyin?: boolean;
  className?: string;
  hanziClassName?: string;
  pinyinClassName?: string;
  onClick?: () => void;
}

export function detectTone(syllable: string): ToneNumber {
  if (/[āēīōūǖĀĒĪŌŪǕ]/.test(syllable)) return 1;
  if (/[áéíóúǘÁÉÍÓÚǗ]/.test(syllable)) return 2;
  if (/[ǎěǐǒǔǚǍĚǏǑǓǙ]/.test(syllable)) return 3;
  if (/[àèìòùǜÀÈÌÒÙǛ]/.test(syllable)) return 4;
  return 5;
}

export const TONE_COLORS: Record<ToneNumber, { text: string; bg: string; border: string }> = {
  1: { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  2: { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  3: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  4: { text: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
  5: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

export const ToneColorText: React.FC<ToneColorTextProps> = ({
  hanzi,
  pinyin,
  showPinyin = true,
  className = '',
  hanziClassName = '',
  pinyinClassName = '',
  onClick,
}) => {
  // If only pinyin is provided
  if (!hanzi && pinyin) {
    const syllables = pinyin.split(/\s+/);
    return (
      <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`} onClick={onClick}>
        {syllables.map((syl, i) => {
          const tone = detectTone(syl);
          const colorClass = TONE_COLORS[tone].text;
          return (
            <span key={i} className={`font-semibold tracking-wide ${colorClass} ${pinyinClassName}`}>
              {syl}
            </span>
          );
        })}
      </span>
    );
  }

  // If both hanzi and pinyin are provided, use ruby-like formatting
  if (hanzi && pinyin) {
    const pinyinWords = pinyin.trim().split(/\s+/);
    const hanziChars = Array.from(hanzi);

    // If characters match pinyin words 1:1
    if (hanziChars.length === pinyinWords.length) {
      return (
        <span className={`inline-flex items-end gap-1.5 ${className}`} onClick={onClick}>
          {hanziChars.map((char, index) => {
            const syl = pinyinWords[index] || '';
            const tone = detectTone(syl);
            const colorClass = TONE_COLORS[tone].text;

            return (
              <ruby key={index} className="inline-flex flex-col items-center leading-none">
                {showPinyin && (
                  <rt className={`text-[11px] font-medium tracking-normal mb-0.5 select-none ${colorClass} ${pinyinClassName}`}>
                    {syl}
                  </rt>
                )}
                <span className={`text-xl font-bold font-sans text-slate-100 ${hanziClassName}`}>
                  {char}
                </span>
              </ruby>
            );
          })}
        </span>
      );
    }

    // Fallback: render hanzi with full pinyin above
    const primaryTone = detectTone(pinyinWords[0] || '');
    const colorClass = TONE_COLORS[primaryTone].text;

    return (
      <span className={`inline-flex flex-col items-center ${className}`} onClick={onClick}>
        {showPinyin && (
          <span className={`text-xs font-medium mb-0.5 ${colorClass} ${pinyinClassName}`}>
            {pinyin}
          </span>
        )}
        <span className={`text-xl font-bold text-slate-100 ${hanziClassName}`}>
          {hanzi}
        </span>
      </span>
    );
  }

  // If only hanzi
  return (
    <span className={`font-bold text-slate-100 ${hanziClassName} ${className}`} onClick={onClick}>
      {hanzi}
    </span>
  );
};
