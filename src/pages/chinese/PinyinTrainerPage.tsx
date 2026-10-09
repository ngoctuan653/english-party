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
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/chinese"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
            title="Quay lại Trung tâm Tiếng Trung"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                Giai đoạn 0 (Tuần 1–2)
              </span>
              <span className="text-xs text-slate-400 font-mono">0 → HSK 1</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Khóa Luyện Phát Âm Pinyin & Thanh Điệu
            </h1>
          </div>
        </div>

        {/* Quick stats badge */}
        <div className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl p-3 px-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-slate-600">Tiến độ Pinyin:</span>
          </div>
          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-rose-600 font-mono">{progressPercent}%</span>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Thanh mẫu đã thuộc</div>
            <div className="text-sm font-bold text-slate-900">
              <strong className="text-rose-600 font-mono text-base">{masteredInitials.length}</strong> / {totalInitials}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Vận mẫu đã thuộc</div>
            <div className="text-sm font-bold text-slate-900">
              <strong className="text-amber-600 font-mono text-base">{masteredFinals.length}</strong> / {totalFinals}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Thanh điệu vững chắc</div>
            <div className="text-sm font-bold text-slate-900">
              <strong className="text-emerald-600 font-mono text-base">{masteredTones.length}</strong> / {totalTones}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
        <button
          onClick={() => setActiveMainTab('chart')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${
            activeMainTab === 'chart'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Bảng Pinyin Tương Tác</span>
        </button>
        <button
          onClick={() => setActiveMainTab('tones')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${
            activeMainTab === 'tones'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Volume2 className="h-4 w-4" />
          <span>Luyện Thanh Điệu & Biến Điệu</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeMainTab === 'chart' ? <PinyinChart /> : <ToneTrainer />}
      </div>
    </div>
  );
}
