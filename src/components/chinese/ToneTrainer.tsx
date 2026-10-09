import React, { useState } from 'react';
import { Volume2, CheckCircle2, XCircle, RotateCcw, Award, Lightbulb, ArrowRight } from 'lucide-react';
import { CHINESE_TONES, TONE_EXERCISES, TONE_SANDHI_RULES } from '@/data/chinese/tones';
import { speakChineseText } from '@/utils/chineseSpeech';
import { useChineseStudyStore } from '@/stores/chineseStudyStore';

export const ToneTrainer: React.FC = () => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'quiz' | 'sandhi'>('overview');

  const { quizScore, recordQuizResult, resetQuizScore } = useChineseStudyStore();

  const currentExercise = TONE_EXERCISES[currentExerciseIndex];

  const handlePlayAudio = (text: string) => {
    speakChineseText(text, { rate: 0.75 });
  };

  const handleSelectOption = (id: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(id);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isAnswerSubmitted) return;
    const selected = currentExercise.options.find((o) => o.id === selectedOptionId);
    const isCorrect = !!selected?.isCorrect;
    recordQuizResult(isCorrect);
    setIsAnswerSubmitted(true);
  };

  const handleNextExercise = () => {
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    if (currentExerciseIndex < TONE_EXERCISES.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      setCurrentExerciseIndex(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex flex-wrap border-b border-slate-200/80 pb-3 gap-2">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Nhận Diện 4 Thanh Điệu
          </button>
          <button
            onClick={() => setActiveSubTab('sandhi')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'sandhi'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Quy Tắc Biến Điệu (3+3, 不, 一)
          </button>
          <button
            onClick={() => setActiveSubTab('quiz')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'quiz'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Thử Thách Luyện Tai (Quiz)
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHINESE_TONES.filter((t) => t.tone <= 4).map((tone) => (
              <div
                key={tone.tone}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono"
                      style={{ color: tone.color, backgroundColor: tone.bgLight }}
                    >
                      Cao độ: {tone.pitch}
                    </span>
                    <button
                      onClick={() => handlePlayAudio(tone.examples[0].pinyin)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Nghe mẫu"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-base font-bold text-slate-900">{tone.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{tone.chineseName}</p>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      Mẹo nhớ (Tiếng Việt):
                    </div>
                    <div className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                      {tone.vietnameseComparison}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Ví dụ minh hoạ:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {tone.examples.slice(0, 2).map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => handlePlayAudio(ex.pinyin)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50/50 text-left border border-slate-200/80 transition-colors cursor-pointer"
                      >
                        <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
                          <span>{ex.hanzi}</span>
                          <span style={{ color: tone.color }}>{ex.pinyin}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{ex.meaningVi}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Neutral Tone Explanation */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Thanh phụ:
              </span>
              <h4 className="text-lg font-bold text-slate-900 mt-0.5">Thanh Nhẹ (Khinh Thanh - 轻声)</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Không đánh dấu thanh, phát âm lướt nhẹ, ngắn gọn như hạt mưa rơi. Ví dụ: 妈妈 (māma -
                từ "ma" sau đọc nhẹ lướt), 爸爸 (bàba), 你的 (nǐ de), 好吗 (hǎo ma).
              </p>
            </div>
            <button
              onClick={() => handlePlayAudio('māma')}
              className="flex items-center gap-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-600 transition-colors shrink-0 cursor-pointer"
            >
              <Volume2 className="h-4 w-4" />
              <span>Nghe ví dụ: 妈妈 (māma)</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: SANDHI RULES */}
      {activeSubTab === 'sandhi' && (
        <div className="space-y-6">
          {TONE_SANDHI_RULES.map((rule) => (
            <div
              key={rule.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">{rule.title}</h3>
                  <p className="text-xs text-rose-600 font-medium">{rule.chineseTitle}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 w-fit">
                  Quy tắc bắt buộc
                </span>
              </div>

              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4" />
                  Quy luật cốt lõi:
                </span>
                <p className="text-sm font-bold text-amber-950 mt-1">{rule.rule}</p>
                <p className="text-xs text-amber-900/80 mt-2 leading-relaxed">{rule.explanationVi}</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Ví dụ thực tế:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rule.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      onClick={() => handlePlayAudio(ex.hanzi)}
                      className="group p-3 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200/80 hover:border-rose-200 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-slate-900">{ex.hanzi}</span>
                          <span className="text-xs line-through text-slate-400">
                            {ex.originalPinyin}
                          </span>
                          <span className="text-xs font-bold text-emerald-600">
                            → {ex.spokenPinyin}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{ex.meaningVi}</div>
                        {ex.note && (
                          <div className="text-[11px] text-amber-700 mt-1 font-mono">
                            {ex.note}
                          </div>
                        )}
                      </div>
                      <Volume2 className="h-4 w-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: QUIZ */}
      {activeSubTab === 'quiz' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Score Header */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Điểm số luyện tập</div>
                <div className="text-lg font-black text-slate-900">
                  {quizScore.correct} / {quizScore.total}{' '}
                  <span className="text-xs text-slate-400 font-normal">
                    (
                    {quizScore.total > 0
                      ? Math.round((quizScore.correct / quizScore.total) * 100)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={resetQuizScore}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Làm lại từ đầu</span>
            </button>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-3">
              <span>
                Câu hỏi {currentExerciseIndex + 1} / {TONE_EXERCISES.length}
              </span>
              <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                Độ khó: {currentExercise.difficulty}
              </span>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {currentExercise.question}
              </h3>

              {/* Audio Prompt Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => handlePlayAudio(currentExercise.audioPromptText)}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-base shadow-lg shadow-rose-200/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Volume2 className="h-5 w-5" />
                  <span>Phát âm thanh mẫu</span>
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentExercise.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                let optionStyle =
                  'bg-slate-50 border-slate-200/80 text-slate-800 hover:border-slate-300 hover:bg-slate-100/60';

                if (isAnswerSubmitted) {
                  if (option.isCorrect) {
                    optionStyle =
                      'bg-emerald-50 border-emerald-400 text-emerald-800 ring-1 ring-emerald-400/40 font-bold';
                  } else if (isSelected && !option.isCorrect) {
                    optionStyle =
                      'bg-rose-50 border-rose-400 text-rose-800 ring-1 ring-rose-400/40 font-bold';
                  }
                } else if (isSelected) {
                  optionStyle =
                    'bg-rose-50 border-rose-400 text-rose-800 ring-1 ring-rose-400/40 font-bold';
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full p-4 rounded-xl border text-left font-medium text-sm flex items-center justify-between transition-all cursor-pointer ${optionStyle}`}
                  >
                    <span>{option.text}</span>
                    {isAnswerSubmitted && option.isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 ml-2" />
                    )}
                    {isAnswerSubmitted && isSelected && !option.isCorrect && (
                      <XCircle className="h-5 w-5 text-rose-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Actions */}
            {isAnswerSubmitted ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-amber-700 block mb-1">Giải thích chi tiết:</span>
                  {currentExercise.explanation}
                </div>

                <button
                  onClick={handleNextExercise}
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <span>
                    {currentExerciseIndex < TONE_EXERCISES.length - 1
                      ? 'Câu tiếp theo'
                      : 'Hoàn thành lượt luyện'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOptionId}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-40 text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-rose-200/50"
              >
                Kiểm tra đáp án
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
