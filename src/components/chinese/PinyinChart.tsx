import React, { useState } from 'react';
import { Volume2, CheckCircle2, Circle, Sparkles, BookOpen, Layers } from 'lucide-react';
import { PINYIN_INITIALS, PINYIN_FINALS, CORE_SYLLABLES } from '@/data/chinese/pinyin';
import type { PinyinInitial, PinyinFinal } from '@/types/chinese';
import { speakChineseText } from '@/utils/chineseSpeech';
import { useChineseStudyStore } from '@/stores/chineseStudyStore';
import { ToneColorText } from './ToneColorText';

export const PinyinChart: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'initials' | 'finals' | 'matrix'>('initials');
  const [selectedInitial, setSelectedInitial] = useState<PinyinInitial | null>(PINYIN_INITIALS[0]);
  const [selectedFinal, setSelectedFinal] = useState<PinyinFinal | null>(null);
  const [selectedSyllableIdx, setSelectedSyllableIdx] = useState<number>(0);

  const {
    masteredInitials,
    masteredFinals,
    toggleInitialMastered,
    toggleFinalMastered,
  } = useChineseStudyStore();

  const handlePlayAudio = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    speakChineseText(text, { rate: 0.75 });
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            onClick={() => setActiveCategory('initials')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
              activeCategory === 'initials'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Thanh Mẫu ({PINYIN_INITIALS.length})</span>
          </button>
          <button
            onClick={() => setActiveCategory('finals')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
              activeCategory === 'finals'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Vận Mẫu ({PINYIN_FINALS.length})</span>
          </button>
          <button
            onClick={() => setActiveCategory('matrix')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
              activeCategory === 'matrix'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Bảng Ghép Âm & 4 Thanh Điệu</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Nhấn vào ô để nghe phát âm chuẩn giọng Bắc Kinh</span>
        </div>
      </div>

      {/* VIEW 1: THANH MẪU (INITIALS) */}
      {activeCategory === 'initials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Initials Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {PINYIN_INITIALS.map((init) => {
                const isMastered = masteredInitials.includes(init.symbol);
                const isSelected = selectedInitial?.id === init.id;

                return (
                  <div
                    key={init.id}
                    onClick={() => {
                      setSelectedInitial(init);
                      handlePlayAudio(init.audioSample);
                    }}
                    className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-rose-50/60 border-rose-400 ring-1 ring-rose-400/40 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-rose-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-2xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                        {init.symbol}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleInitialMastered(init.symbol);
                          }}
                          className="text-slate-400 hover:text-emerald-500 p-1 transition-colors"
                          title={isMastered ? 'Đã nắm vững' : 'Đánh dấu đã thuộc'}
                        >
                          {isMastered ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handlePlayAudio(init.audioSample, e)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400 line-clamp-1 font-mono">
                      {init.ipa}
                    </div>
                    <div className="mt-1 text-xs text-rose-600 font-medium truncate">
                      {init.vietnameseEquivalent.split('(')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Initial Detail Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm h-fit sticky top-6">
            {selectedInitial ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-4xl font-black text-rose-600">
                      {selectedInitial.symbol}
                    </span>
                    <span className="ml-3 text-sm font-mono text-slate-400">
                      {selectedInitial.ipa}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePlayAudio(selectedInitial.audioSample)}
                    className="flex items-center gap-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Nghe âm: {selectedInitial.audioSample}</span>
                  </button>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                    Nhóm âm
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedInitial.groupNameVi}</p>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3.5">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    💡 So sánh tiếng Việt:
                  </span>
                  <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                    {selectedInitial.vietnameseEquivalent}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Khẩu hình & Cách phát âm
                  </span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                    {selectedInitial.mouthShape}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {selectedInitial.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Từ vựng mẫu
                  </span>
                  <div className="space-y-2">
                    {selectedInitial.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        onClick={() => handlePlayAudio(ex.hanzi)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200/80 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-900">{ex.hanzi}</span>
                          <ToneColorText pinyin={ex.pinyin} className="text-xs" />
                        </div>
                        <span className="text-xs text-slate-500">{ex.meaningVi}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                Chọn một thanh mẫu bất kỳ để xem hướng dẫn chi tiết
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: VẬN MẪU (FINALS) */}
      {activeCategory === 'finals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {PINYIN_FINALS.map((fin) => {
                const isMastered = masteredFinals.includes(fin.symbol);
                const isSelected = selectedFinal?.id === fin.id;

                return (
                  <div
                    key={fin.id}
                    onClick={() => {
                      setSelectedFinal(fin);
                      handlePlayAudio(fin.audioSample);
                    }}
                    className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-rose-50/60 border-rose-400 ring-1 ring-rose-400/40 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-rose-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-2xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                        {fin.symbol}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFinalMastered(fin.symbol);
                          }}
                          className="text-slate-400 hover:text-emerald-500 p-1 transition-colors"
                          title={isMastered ? 'Đã nắm vững' : 'Đánh dấu đã thuộc'}
                        >
                          {isMastered ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handlePlayAudio(fin.audioSample, e)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400 line-clamp-1 font-mono">
                      {fin.ipa}
                    </div>
                    <div className="mt-1 text-xs text-rose-600 font-medium truncate">
                      {fin.vietnameseEquivalent.split('(')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Detail Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm h-fit sticky top-6">
            {selectedFinal ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-4xl font-black text-rose-600">
                      {selectedFinal.symbol}
                    </span>
                    <span className="ml-3 text-sm font-mono text-slate-400">
                      {selectedFinal.ipa}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePlayAudio(selectedFinal.audioSample)}
                    className="flex items-center gap-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Nghe âm: {selectedFinal.audioSample}</span>
                  </button>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                    Phân loại
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedFinal.categoryNameVi}</p>
                </div>

                <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 p-3.5">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    💡 Hướng dẫn phát âm:
                  </span>
                  <p className="text-xs text-emerald-900/90 mt-1 leading-relaxed">
                    {selectedFinal.vietnameseEquivalent}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Mô tả
                  </span>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {selectedFinal.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Từ vựng mẫu
                  </span>
                  <div className="space-y-2">
                    {selectedFinal.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        onClick={() => handlePlayAudio(ex.hanzi)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200/80 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-900">{ex.hanzi}</span>
                          <ToneColorText pinyin={ex.pinyin} className="text-xs" />
                        </div>
                        <span className="text-xs text-slate-500">{ex.meaningVi}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                Chọn một vận mẫu để xem chi tiết
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: GHÉP ÂM & 4 THANH ĐIỆU (SYLLABLE MATRIX) */}
      {activeCategory === 'matrix' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {CORE_SYLLABLES.map((syl, i) => (
              <button
                key={syl.pinyin}
                onClick={() => setSelectedSyllableIdx(i)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  selectedSyllableIdx === i
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {syl.initial} + {syl.final} = <span className="underline">{syl.pinyin}</span>
              </button>
            ))}
          </div>

          {/* Interactive Tone Cards for the selected syllable */}
          {CORE_SYLLABLES[selectedSyllableIdx] && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Luyện 4 Thanh Điệu Với Âm:{' '}
                    <span className="text-rose-600 text-2xl font-mono">
                      {CORE_SYLLABLES[selectedSyllableIdx].pinyin}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Nhấn vào từng thẻ để nghe sự khác biệt rõ rệt giữa 4 thanh điệu tiếng Trung.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {([1, 2, 3, 4] as const).map((toneNum) => {
                  const pinyinTone = CORE_SYLLABLES[selectedSyllableIdx].tones[toneNum];
                  const sample = CORE_SYLLABLES[selectedSyllableIdx].sampleHanzi?.[toneNum];

                  const toneMeta = {
                    1: { name: 'Thanh 1 (55)', desc: 'Cao & Phẳng', border: 'border-rose-200 hover:border-rose-400 bg-rose-50/30', text: 'text-rose-600' },
                    2: { name: 'Thanh 2 (35)', desc: 'Vút lên cao', border: 'border-amber-200 hover:border-amber-400 bg-amber-50/30', text: 'text-amber-600' },
                    3: { name: 'Thanh 3 (214)', desc: 'Trầm lượn sóng', border: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/30', text: 'text-emerald-600' },
                    4: { name: 'Thanh 4 (51)', desc: 'Rơi dứt khoát', border: 'border-sky-200 hover:border-sky-400 bg-sky-50/30', text: 'text-sky-600' },
                  }[toneNum];

                  return (
                    <div
                      key={toneNum}
                      onClick={() => handlePlayAudio(pinyinTone)}
                      className={`group p-5 rounded-2xl border ${toneMeta.border} cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold uppercase tracking-wider ${toneMeta.text}`}>
                            {toneMeta.name}
                          </span>
                          <Volume2 className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                        </div>
                        <div className="mt-4 text-center">
                          <div className={`text-4xl font-black ${toneMeta.text} font-mono tracking-wider`}>
                            {pinyinTone}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{toneMeta.desc}</div>
                        </div>
                      </div>

                      {sample && (
                        <div className="mt-6 pt-3 border-t border-slate-100 text-center">
                          <div className="text-xl font-bold text-slate-900">{sample.hanzi}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{sample.meaningVi}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
