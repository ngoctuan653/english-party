import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, Sparkles, BookOpen, Layers, ArrowLeft, Trophy, Flame } from 'lucide-react';
import { PinyinChart } from '@/components/chinese/PinyinChart';
import { ToneTrainer } from '@/components/chinese/ToneTrainer';
import { useChineseStudyStore } from '@/stores/chineseStudyStore';
import { PINYIN_INITIALS, PINYIN_FINALS } from '@/data/chinese/pinyin';

export default function PinyinTrainerPage() {
  const [activeMainTab, setActiveMainTab] = useState<'chart' | 'tones'>('chart');

  const {
    masteredInitials,
    masteredFinals,
    masteredTones,
  } = useChineseStudyStore();

  const totalInitials = PINYIN_INITIALS.length;
  const totalFinals = PINYIN_FINALS.length;
  const totalTones = 4;

  const totalMastered = masteredInitials.length + masteredFinals.length + masteredTones.length;
  const totalItems = totalInitials + totalFinals + totalTones;
  const progressPercent = Math.min(100, Math.round((totalMastered / totalItems) * 100));

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-20">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/chinese"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Quay lại Trung tâm Tiếng Trung"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Giai đoạn 0 (Tuần 1–2)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">0 → HSK 1</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Khóa Luyện Phát Âm Pinyin & Thanh Điệu
                </h1>
              </div>
            </div>

            {/* Quick stats badge */}
            <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 px-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-slate-300">Tiến độ Pinyin:</span>
              </div>
              <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-rose-400 font-mono">{progressPercent}%</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/60">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Layers className="h-4 w-4 text-rose-400" />
              <span>
                Thanh mẫu: <strong className="text-white font-mono">{masteredInitials.length}</strong> / {totalInitials}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>
                Vận mẫu: <strong className="text-white font-mono">{masteredFinals.length}</strong> / {totalFinals}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Trophy className="h-4 w-4 text-emerald-400" />
              <span>
                Thanh điệu: <strong className="text-white font-mono">{masteredTones.length}</strong> / {totalTones}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveMainTab('chart')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeMainTab === 'chart'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Bảng Pinyin Tương Tác</span>
          </button>
          <button
            onClick={() => setActiveMainTab('tones')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeMainTab === 'tones'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="h-4 w-4" />
            <span>Luyện Thanh Điệu & Biến Điệu</span>
          </button>
        </div>

        {/* Tab Panels */}
        {activeMainTab === 'chart' ? <PinyinChart /> : <ToneTrainer />}
      </main>
    </div>
  );
}
