import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  Sparkles,
  Layers,
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import {
  HSK1_VOCAB,
  HSK2_VOCAB,
  HSK3_VOCAB,
  HSK4_VOCAB,
  CHINESE_MEASURE_WORDS
} from '@/data/chinese';
import type { ChineseVocabWord, HSKLevel } from '@/types/chinese';
import { HanziCard } from '@/components/chinese/HanziCard';
import { ToneColorText } from '@/components/chinese/ToneColorText';
import { speakChineseText } from '@/utils/chineseSpeech';

export default function ChineseVocabPage() {
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'hsk1' | 'hsk2' | 'hsk3' | 'hsk4'>('hsk1');
  const [viewMode, setViewMode] = useState<'flashcard' | 'list'>('flashcard');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);

  // Combined pool
  const allVocab: ChineseVocabWord[] = useMemo(() => {
    return [...HSK1_VOCAB, ...HSK2_VOCAB, ...HSK3_VOCAB, ...HSK4_VOCAB];
  }, []);

  // Filtered list
  const filteredList = useMemo(() => {
    return allVocab.filter((item) => {
      const matchLevel = selectedLevel === 'all' || item.hskLevel === selectedLevel;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.hanzi.includes(q) ||
        item.pinyin.toLowerCase().includes(q) ||
        item.meaningVi.toLowerCase().includes(q);
      return matchLevel && matchQuery;
    });
  }, [allVocab, selectedLevel, searchQuery]);

  const currentWord = filteredList[currentCardIndex] || filteredList[0];

  const handleNextCard = () => {
    if (currentCardIndex < filteredList.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    }
  };

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (currentWord && (rating === 'good' || rating === 'easy')) {
      if (!masteredIds.includes(currentWord.id)) {
        setMasteredIds((prev) => [...prev, currentWord.id]);
      }
    }
    handleNextCard();
  };

  const handlePlayAudio = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    speakChineseText(text, { rate: 0.8 });
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
              Flashcard SRS
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {filteredList.length} Từ vựng
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Kho Từ Vựng HSK & Flashcard
          </h1>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setViewMode('flashcard')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'flashcard'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Thẻ Flashcard</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Tra Cứu Danh Sách</span>
          </button>
        </div>
      </div>

      {/* Level Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setSelectedLevel('all');
              setCurrentCardIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedLevel === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/80'
            }`}
          >
            Tất cả ({allVocab.length})
          </button>
          <button
            onClick={() => {
              setSelectedLevel('hsk1');
              setCurrentCardIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedLevel === 'hsk1'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            HSK 1 ({HSK1_VOCAB.length})
          </button>
          <button
            onClick={() => {
              setSelectedLevel('hsk2');
              setCurrentCardIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedLevel === 'hsk2'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            HSK 2 ({HSK2_VOCAB.length})
          </button>
          <button
            onClick={() => {
              setSelectedLevel('hsk3');
              setCurrentCardIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedLevel === 'hsk3'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            HSK 3 ({HSK3_VOCAB.length})
          </button>
          <button
            onClick={() => {
              setSelectedLevel('hsk4');
              setCurrentCardIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedLevel === 'hsk4'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            HSK 4 ({HSK4_VOCAB.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm chữ Hán, pinyin, nghĩa..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentCardIndex(0);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'flashcard' ? (
        /* FLASHCARD SRS MODE */
        <div className="max-w-md mx-auto space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span>
              Thẻ <strong className="text-slate-800 font-mono">{currentCardIndex + 1}</strong> /{' '}
              {filteredList.length}
            </span>
            <span className="flex items-center gap-1 text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Đã thuộc: {masteredIds.length}
            </span>
          </div>

          {/* Flashcard Component */}
          {currentWord ? (
            <HanziCard word={currentWord} onRate={handleRate} />
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-lg font-bold text-slate-800">Không tìm thấy từ vựng phù hợp</h3>
              <p className="text-xs text-slate-500 mt-1">Hãy thử xóa bộ lọc tìm kiếm.</p>
            </div>
          )}

          {/* Card Navigation Controls */}
          {currentWord && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
                className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200/80 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
              >
                ← Thẻ trước
              </button>

              <button
                onClick={() => setCurrentCardIndex(0)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Về đầu danh sách"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={handleNextCard}
                className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200/80 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Thẻ kế tiếp</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* DICTIONARY LIST MODE */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => handlePlayAudio(item.hanzi)}
                className="group p-4 rounded-2xl bg-white hover:bg-white border border-slate-200/80 hover:border-rose-300 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl font-black text-slate-800 group-hover:text-rose-600 transition-colors">
                        {item.hanzi}
                      </span>
                      <ToneColorText pinyin={item.pinyin} className="text-xs font-mono font-bold" />
                      {item.sinoVietnamese && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-600 font-semibold">
                          {item.sinoVietnamese}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-rose-500 mt-1">
                      {item.meaningVi}
                    </div>
                    {item.meaningEn && (
                      <div className="text-[11px] text-slate-400 italic">{item.meaningEn}</div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handlePlayAudio(item.hanzi, e)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors border border-slate-200/60 cursor-pointer"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>

                {item.examples && item.examples.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600">
                    <div className="font-medium text-slate-800">{item.examples[0].hanzi}</div>
                    <div className="text-[11px] text-slate-400">{item.examples[0].meaningVi}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
