import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, RotateCcw, ArrowRight, HelpCircle } from 'lucide-react';
import { speakChineseText } from '@/utils/chineseSpeech';
import { ToneColorText } from './ToneColorText';

interface SentenceBuilderProps {
  vietnameseMeaning: string;
  correctSentence: string; // e.g. "我是学生。"
  pinyin: string;
  tokens: string[]; // e.g. ["是", "我", "学生", "。"]
  onComplete?: (isCorrect: boolean) => void;
}

export const SentenceBuilder: React.FC<SentenceBuilderProps> = ({
  vietnameseMeaning,
  correctSentence,
  pinyin,
  tokens,
  onComplete,
}) => {
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    // Shuffle tokens initially
    const shuffled = [...tokens].sort(() => Math.random() - 0.5);
    setAvailableTokens(shuffled);
    setSelectedTokens([]);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
  }, [correctSentence, tokens]);

  const handlePickToken = (token: string, index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedTokens((prev) => [...prev, token]);
    setAvailableTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveToken = (token: string, index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedTokens((prev) => prev.filter((_, i) => i !== index));
    setAvailableTokens((prev) => [...prev, token]);
  };

  const handleReset = () => {
    setAvailableTokens([...tokens].sort(() => Math.random() - 0.5));
    setSelectedTokens([]);
    setIsAnswerSubmitted(false);
  };

  const handleCheck = () => {
    const assembled = selectedTokens.join('').replace(/\s+/g, '');
    const target = correctSentence.replace(/\s+/g, '');
    const correct = assembled === target;
    setIsCorrect(correct);
    setIsAnswerSubmitted(true);
    if (correct) {
      speakChineseText(correctSentence, { rate: 0.85 });
    }
    onComplete?.(correct);
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-xl max-w-xl mx-auto">
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
          <span>Sắp xếp từ thành câu đúng:</span>
        </div>
        <div className="text-lg font-bold text-white mt-1">{vietnameseMeaning}</div>
      </div>

      {/* Assembly Area */}
      <div
        className={`min-h-[70px] p-4 rounded-2xl border-2 flex flex-wrap items-center gap-2 transition-all ${
          isAnswerSubmitted
            ? isCorrect
              ? 'border-emerald-500/80 bg-emerald-950/20'
              : 'border-rose-500/80 bg-rose-950/20'
            : selectedTokens.length > 0
            ? 'border-rose-500/40 bg-slate-950'
            : 'border-dashed border-slate-800 bg-slate-950/50'
        }`}
      >
        {selectedTokens.length === 0 && !isAnswerSubmitted && (
          <span className="text-xs text-slate-500 italic">
            Chạm vào các từ bên dưới để ghép câu...
          </span>
        )}

        {selectedTokens.map((tok, idx) => (
          <button
            key={idx}
            onClick={() => handleRemoveToken(tok, idx)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-transform active:scale-95 cursor-pointer"
          >
            {tok}
          </button>
        ))}
      </div>

      {/* Available Word Bank */}
      <div className="flex flex-wrap gap-2.5 justify-center min-h-[50px]">
        {availableTokens.map((tok, idx) => (
          <button
            key={idx}
            onClick={() => handlePickToken(tok, idx)}
            className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-slate-200 hover:text-white font-bold text-base border border-slate-800 hover:border-rose-500/50 transition-all active:scale-95 cursor-pointer shadow-md"
          >
            {tok}
          </button>
        ))}
      </div>

      {/* Result feedback */}
      {isAnswerSubmitted && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Chính xác tuyệt vời!</span>
                </>
              ) : (
                <span>Chưa chính xác, đáp án đúng:</span>
              )}
            </div>
            <div className="text-sm font-bold text-white mt-1">{correctSentence}</div>
            <div className="text-xs text-rose-300 font-mono mt-0.5">{pinyin}</div>
          </div>

          <button
            onClick={() => speakChineseText(correctSentence, { rate: 0.8 })}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleReset}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Xếp lại"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {!isAnswerSubmitted ? (
          <button
            onClick={handleCheck}
            disabled={selectedTokens.length === 0}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-sm transition-all shadow-lg shadow-rose-950/40 cursor-pointer"
          >
            Kiểm tra
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm transition-all cursor-pointer shadow-md"
          >
            Làm lại câu này
          </button>
        )}
      </div>
    </div>
  );
};
