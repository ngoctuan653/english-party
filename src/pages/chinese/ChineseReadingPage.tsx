import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { CHINESE_READING_PASSAGES } from '@/data/chinese/reading-passages';
import type { ChineseReadingPassage } from '@/data/chinese/reading-passages';
import { speakChineseText } from '@/utils/chineseSpeech';
import { ToneColorText } from '@/components/chinese/ToneColorText';

export default function ChineseReadingPage() {
  const [selectedPassageId, setSelectedPassageId] = useState<string>(
    CHINESE_READING_PASSAGES[0].id
  );
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  const currentPassage =
    CHINESE_READING_PASSAGES.find((p) => p.id === selectedPassageId) ||
    CHINESE_READING_PASSAGES[0];

  const handlePlayFullAudio = () => {
    speakChineseText(currentPassage.content, { rate: 0.85 });
  };

  const handlePlaySentence = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    speakChineseText(text, { rate: 0.85 });
  };

  const handleSelectAnswer = (qId: string, optIdx: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleResetPassage = (newId: string) => {
    setSelectedPassageId(newId);
    setSelectedSentenceIdx(null);
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
              Đọc Hiểu Phân Cấp
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentPassage.hskLevel.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {currentPassage.titleVi}
          </h1>
        </div>

        {/* Passage Selection Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {CHINESE_READING_PASSAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => handleResetPassage(p.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedPassageId === p.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {p.titleVi} ({p.hskLevel.toUpperCase()})
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Reading Article Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{currentPassage.title}</h2>
              <span className="text-xs text-slate-500 font-medium">Chủ đề: {currentPassage.topic}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPinyin(!showPinyin)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  showPinyin ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {showPinyin ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span>Pinyin: {showPinyin ? 'BẬT' : 'TẮT'}</span>
              </button>

              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  showTranslation ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span>Bản dịch: {showTranslation ? 'HIỆN' : 'ẨN'}</span>
              </button>

              <button
                onClick={handlePlayFullAudio}
                className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                title="Đọc toàn bộ bài"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Interactive Text Body */}
          <div className="space-y-3 text-base sm:text-lg leading-relaxed pt-2">
            {currentPassage.sentences.map((sent, idx) => {
              const isSelected = selectedSentenceIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSentenceIdx(isSelected ? null : idx)}
                  className={`p-3 rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-rose-50 border-rose-200 shadow-sm'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {showPinyin && (
                        <div className="text-xs font-mono text-rose-500 mb-1">
                          {sent.pinyin}
                        </div>
                      )}
                      <div className="text-lg sm:text-xl font-bold text-slate-800 tracking-wide">
                        {sent.hanzi}
                      </div>
                      {showTranslation && (
                        <div className="text-xs text-slate-500 mt-1 italic">
                          {sent.meaningVi}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handlePlaySentence(sent.hanzi, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Sentence Inspector */}
          {selectedSentenceIdx !== null && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                Chi tiết câu được chọn:
              </span>
              <div className="text-lg font-bold text-slate-800">
                {currentPassage.sentences[selectedSentenceIdx].hanzi}
              </div>
              <div className="text-xs font-mono text-rose-500">
                {currentPassage.sentences[selectedSentenceIdx].pinyin}
              </div>
              <div className="text-xs text-slate-600">
                {currentPassage.sentences[selectedSentenceIdx].meaningVi}
              </div>
            </div>
          )}
        </div>

        {/* Vocabulary Deck */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Từ vựng trọng điểm trong bài:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentPassage.vocabulary.map((vocab, vIdx) => (
              <div
                key={vIdx}
                onClick={() => speakChineseText(vocab.hanzi, { rate: 0.8 })}
                className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200/80 hover:border-rose-200 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-lg font-bold text-slate-800 flex items-center justify-between">
                    <span>{vocab.hanzi}</span>
                    <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="text-xs text-rose-500 font-mono mt-0.5">{vocab.pinyin}</div>
                </div>
                <div className="text-xs text-slate-500 mt-2">{vocab.meaningVi}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Comprehension Quiz */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <span>Câu hỏi đọc hiểu</span>
            </h3>
            {isQuizSubmitted && (
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Đã hoàn thành
              </span>
            )}
          </div>

          <div className="space-y-6">
            {currentPassage.questions.map((q, qIdx) => {
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

                      if (isQuizSubmitted) {
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
                          {isQuizSubmitted && optIdx === q.correctAnswerIndex && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
                          )}
                          {isQuizSubmitted && isSelected && optIdx !== q.correctAnswerIndex && (
                            <XCircle className="h-4 w-4 text-rose-500 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isQuizSubmitted && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-slate-600">
                      <strong className="text-amber-600">Giải thích:</strong> {q.explanationVi}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100">
            {!isQuizSubmitted ? (
              <button
                onClick={() => setIsQuizSubmitted(true)}
                disabled={
                  Object.keys(selectedAnswers).length < currentPassage.questions.length
                }
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-40 text-white font-bold text-sm transition-all shadow-lg shadow-rose-200/50 cursor-pointer"
              >
                Nộp bài đọc hiểu
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setIsQuizSubmitted(false);
                }}
                className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
              >
                Làm lại bài này
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
