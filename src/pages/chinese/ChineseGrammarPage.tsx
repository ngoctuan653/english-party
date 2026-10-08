import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Puzzle
} from 'lucide-react';
import { CHINESE_GRAMMAR_PATTERNS } from '@/data/chinese/grammar-patterns';
import type { ChineseGrammarPattern, HSKLevel } from '@/types/chinese';
import { ToneColorText } from '@/components/chinese/ToneColorText';
import { SentenceBuilder } from '@/components/chinese/SentenceBuilder';
import { speakChineseText } from '@/utils/chineseSpeech';

export default function ChineseGrammarPage() {
  const [selectedLevel, setSelectedLevel] = useState<'all' | HSKLevel>('all');
  const [selectedPatternId, setSelectedPatternId] = useState<string>(
    CHINESE_GRAMMAR_PATTERNS[0].id
  );
  const [activeTab, setActiveTab] = useState<'theory' | 'practice'>('theory');

  // Selected pattern
  const currentPattern =
    CHINESE_GRAMMAR_PATTERNS.find((p) => p.id === selectedPatternId) ||
    CHINESE_GRAMMAR_PATTERNS[0];

  const filteredPatterns = CHINESE_GRAMMAR_PATTERNS.filter(
    (p) => selectedLevel === 'all' || p.hskLevel === selectedLevel
  );

  const handlePlayAudio = (text: string) => {
    speakChineseText(text, { rate: 0.85 });
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
              Ngữ Pháp Trọng Tâm
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {filteredPatterns.length} Mẫu câu
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Ngữ Pháp Tiếng Trung Theo Cấp Độ HSK
          </h1>
        </div>

        {/* Level filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          {(['all', 'hsk1', 'hsk2', 'hsk3', 'hsk4'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lvl === 'all' ? 'Tất cả' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pattern Sidebar List (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Danh sách mẫu câu
          </div>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {filteredPatterns.map((pat) => {
              const isSelected = pat.id === currentPattern.id;
              return (
                <div
                  key={pat.id}
                  onClick={() => {
                    setSelectedPatternId(pat.id);
                    setActiveTab('theory');
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-50 border-rose-300 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded uppercase ${
                      isSelected ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {pat.hskLevel}
                    </span>
                  </div>
                  <div className={`font-bold text-sm mt-1.5 ${isSelected ? 'text-rose-700' : 'text-slate-800'}`}>{pat.title}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                    {pat.pattern}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pattern Detail Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tabs: Lý thuyết / Luyện tập */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'theory'
                  ? 'border-rose-500 text-rose-600 bg-rose-50/50'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Công Thức & Ví Dụ</span>
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'practice'
                  ? 'border-rose-500 text-rose-600 bg-rose-50/50'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Puzzle className="h-4 w-4" />
              <span>Bài Tập Tương Tác</span>
            </button>
          </div>

          {activeTab === 'theory' ? (
            /* TAB 1: THEORY & EXAMPLES */
            <div className="space-y-6">
              {/* Formula Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 font-mono">
                    {currentPattern.hskLevel.toUpperCase()}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    {currentPattern.title}
                  </h2>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-base sm:text-lg font-black text-rose-600 text-center">
                  {currentPattern.pattern}
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200/60 p-4">
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4" />
                    Mẹo so sánh & Giải thích (Tiếng Việt):
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">
                    {currentPattern.explanationVi}
                  </p>
                  <p className="text-xs text-amber-600 mt-1 font-semibold">
                    💡 {currentPattern.vietnameseEquivalent}
                  </p>
                </div>
              </div>

              {/* Examples Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Các câu ví dụ thực tế:</span>
                </div>

                <div className="space-y-3">
                  {currentPattern.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      onClick={() => handlePlayAudio(ex.hanzi)}
                      className="p-4 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200/80 hover:border-rose-200 transition-all cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-slate-800">{ex.hanzi}</div>
                        <div className="text-xs font-mono text-rose-500">{ex.pinyin}</div>
                        <div className="text-xs text-slate-500">{ex.meaningVi}</div>
                        {ex.breakdown && (
                          <div className="text-[11px] text-amber-600 font-mono mt-1">
                            {ex.breakdown}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="p-2.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200/60 text-slate-400 hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: INTERACTIVE PRACTICE */
            <div className="space-y-6">
              {(currentPattern.exercises || []).map((ex, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-sm"
                >
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Bài tập {idx + 1}: {ex.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Điền từ'}
                  </div>

                  <div className="text-base font-bold text-slate-800">{ex.question}</div>

                  {ex.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {ex.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => {
                            if (opt === ex.correctAnswer) {
                              alert('✅ Chính xác! Bạn đã hiểu mẫu ngữ pháp này.');
                            } else {
                              alert(`❌ Chưa đúng rồi! ${ex.explanationVi}`);
                            }
                          }}
                          className="p-3.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-300 text-slate-700 hover:text-slate-900 text-left font-bold text-sm transition-all cursor-pointer"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Interactive Sentence Builder for this pattern */}
              <div className="border-t border-slate-200 pt-4">
                <div className="text-center mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Thử thách ghép câu
                  </span>
                </div>

                <SentenceBuilder
                  vietnameseMeaning={currentPattern.examples[0].meaningVi}
                  correctSentence={currentPattern.examples[0].hanzi}
                  pinyin={currentPattern.examples[0].pinyin}
                  tokens={
                    currentPattern.examples[0].hanzi.length <= 6
                      ? Array.from(currentPattern.examples[0].hanzi)
                      : ['我', '是', '学生', '。']
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
