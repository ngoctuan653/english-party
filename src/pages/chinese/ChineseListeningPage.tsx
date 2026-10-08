import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  Headphones,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { CHINESE_LISTENING_DIALOGUES } from '@/data/chinese/listening-dialogues';
import type { ChineseListeningDialogue } from '@/data/chinese/listening-dialogues';
import { speakChineseText } from '@/utils/chineseSpeech';
import { ToneColorText } from '@/components/chinese/ToneColorText';

export default function ChineseListeningPage() {
  const [selectedDialogueId, setSelectedDialogueId] = useState<string>(
    CHINESE_LISTENING_DIALOGUES[0].id
  );
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentDialogue =
    CHINESE_LISTENING_DIALOGUES.find((d) => d.id === selectedDialogueId) ||
    CHINESE_LISTENING_DIALOGUES[0];

  const handlePlayFullAudio = () => {
    const fullText = currentDialogue.turns.map((t) => `${t.speaker}：${t.hanzi}`).join('。 ');
    speakChineseText(fullText, { rate: 0.85 });
  };

  const handlePlayTurnAudio = (text: string) => {
    speakChineseText(text, { rate: 0.85 });
  };

  const handleSelectAnswer = (qId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleCheckAnswers = () => {
    setIsSubmitted(true);
    setShowTranscript(true);
  };

  const handleReset = (newDialogueId?: string) => {
    if (newDialogueId) setSelectedDialogueId(newDialogueId);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setShowTranscript(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200">
              Luyện Nghe Phản Xạ
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentDialogue.hskLevel.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Luyện Nghe Hội Thoại Phân Cấp HSK
          </h1>
        </div>

        {/* Dialogue selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {CHINESE_LISTENING_DIALOGUES.map((d) => (
            <button
              key={d.id}
              onClick={() => handleReset(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedDialogueId === d.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {d.titleVi}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Dialogue Card & Audio Player */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">{currentDialogue.titleVi}</h2>
              <p className="text-xs text-rose-500 font-medium mt-0.5">{currentDialogue.title}</p>
              <p className="text-xs text-slate-500 mt-1">{currentDialogue.situationVi}</p>
            </div>

            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-colors self-start sm:self-auto cursor-pointer"
            >
              {showTranscript ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{showTranscript ? 'Ẩn lời thoại' : 'Hiện lời thoại'}</span>
            </button>
          </div>

          {/* Big Audio Control Bar */}
          <div className="flex items-center justify-center py-4">
            <button
              onClick={handlePlayFullAudio}
              className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-base shadow-lg shadow-rose-200/50 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Volume2 className="h-6 w-6" />
              <span>Phát Toàn Bộ Đoạn Hội Thoại</span>
            </button>
          </div>

          {/* Transcript Area */}
          {showTranscript && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Lời thoại chi tiết (Nhấn vào từng câu để nghe lại):</span>
              </div>

              {currentDialogue.turns.map((turn, idx) => (
                <div
                  key={idx}
                  onClick={() => handlePlayTurnAudio(turn.hanzi)}
                  className="p-4 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200/80 hover:border-rose-200 cursor-pointer transition-all flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                      {turn.speaker}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-800">{turn.hanzi}</div>
                    <div className="text-xs font-mono text-amber-600">{turn.pinyin}</div>
                    <div className="text-xs text-slate-500">{turn.meaningVi}</div>
                  </div>

                  <button
                    type="button"
                    className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200/60 text-slate-400 hover:text-rose-500 transition-colors shrink-0 mt-1 cursor-pointer"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comprehension Questions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Headphones className="h-5 w-5 text-indigo-500" />
              <span>Câu hỏi kiểm tra khả năng nghe hiểu</span>
            </h3>
            {isSubmitted && (
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Đã kiểm tra
              </span>
            )}
          </div>

          <div className="space-y-6">
            {currentDialogue.questions.map((q, qIdx) => {
              const selectedIdx = selectedAnswers[q.id];
              return (
                <div key={q.id} className="space-y-3">
                  <div className="text-sm sm:text-base font-bold text-slate-800">
                    {qIdx + 1}. {q.question}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedIdx === optIdx;
                      let btnStyle =
                        'bg-slate-50 border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-100';

                      if (isSubmitted) {
                        if (optIdx === q.correctAnswerIndex) {
                          btnStyle =
                            'bg-emerald-50 border-emerald-300 text-emerald-700 ring-1 ring-emerald-300';
                        } else if (isSelected && optIdx !== q.correctAnswerIndex) {
                          btnStyle =
                            'bg-rose-50 border-rose-300 text-rose-700 ring-1 ring-rose-300';
                        }
                      } else if (isSelected) {
                        btnStyle =
                          'bg-rose-50 border-rose-400 text-slate-800 ring-1 ring-rose-400';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`p-3.5 rounded-xl border text-left font-medium text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && optIdx === q.correctAnswerIndex && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
                          )}
                          {isSubmitted && isSelected && optIdx !== q.correctAnswerIndex && (
                            <XCircle className="h-4 w-4 text-rose-500 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isSubmitted && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-slate-600">
                      <strong className="text-amber-600">Giải thích:</strong> {q.explanationVi}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            {!isSubmitted ? (
              <button
                onClick={handleCheckAnswers}
                disabled={
                  Object.keys(selectedAnswers).length < currentDialogue.questions.length
                }
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-40 text-white font-bold text-sm transition-all shadow-lg shadow-rose-200/50 cursor-pointer"
              >
                Kiểm tra câu trả lời
              </button>
            ) : (
              <button
                onClick={() => handleReset()}
                className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Nghe & làm lại</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
