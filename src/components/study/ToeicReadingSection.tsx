import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Question } from '@/types/question';
import {
  getBundledToeicQuestions,
  getToeicTestStats,
  getToeicTopics,
} from '@/data/questionBank';

interface ToeicReadingSectionProps {
  onStartQuiz: (questions: Question[], filters?: { title?: string; count?: number }) => void;
  loadingQuestions: boolean;
  selectedTest?: number;
  onSelectTest?: (test: number) => void;
  activeTab?: 'tests' | 'topics';
  onSelectTab?: (tab: 'tests' | 'topics') => void;
}

export const TOEIC_TOPIC_LABELS: Record<string, { label: string; vi: string; icon: any }> = {
  'toeic-grammar': {
    label: 'Grammar Focus',
    vi: 'Ngữ pháp trọng điểm TOEIC',
    icon: Icons.BookmarkCheck,
  },
  'toeic-vocabulary': {
    label: 'Core Vocabulary',
    vi: 'Từ vựng cốt lõi thường gặp',
    icon: Icons.BookOpen,
  },
  'toeic-word-form': {
    label: 'Word Forms',
    vi: 'Cấu trúc & Biến thể từ loại',
    icon: Icons.Sparkles,
  },
  'toeic-prepositions-conjunctions': {
    label: 'Prepositions & Conjunctions',
    vi: 'Giới từ & Liên từ liên kết',
    icon: Icons.Link,
  },
  'toeic-text-completion': {
    label: 'Text Completion',
    vi: 'Điền từ đoạn văn (Part 6)',
    icon: Icons.FileText,
  },
  'toeic-business-notices': {
    label: 'Business Notices',
    vi: 'Thông báo & Bản ghi nhớ nội bộ',
    icon: Icons.BellRing,
  },
  'toeic-business-letters': {
    label: 'Business Emails & Letters',
    vi: 'Thư tín thương mại & Email trao đổi',
    icon: Icons.Mail,
  },
  'toeic-single-passage': {
    label: 'Single Passages',
    vi: 'Đoạn văn đơn (Part 7)',
    icon: Icons.Newspaper,
  },
  'toeic-multi-passage': {
    label: 'Double & Triple Passages',
    vi: 'Đoạn văn kép & đoạn ba (Part 7)',
    icon: Icons.Layers3,
  },
  'toeic-emails-memos': {
    label: 'Emails & Memorandums',
    vi: 'Thư điện tử & Thông điệp nội bộ',
    icon: Icons.Inbox,
  },
  'toeic-advertisements': {
    label: 'Advertisements & Marketing',
    vi: 'Quảng cáo, Tiếp thị & Dịch vụ',
    icon: Icons.Megaphone,
  },
  'toeic-articles-reports': {
    label: 'Articles & Reports',
    vi: 'Bài báo kinh tế & Báo cáo thị trường',
    icon: Icons.BarChart3,
  },
  'toeic-forms-invoices': {
    label: 'Forms, Invoices & Schedules',
    vi: 'Biểu mẫu, Hóa đơn & Lịch trình',
    icon: Icons.Receipt,
  },
  'toeic-chat-discussions': {
    label: 'Online Chat & Discussions',
    vi: 'Tin nhắn trực tuyến & Đàm thoại',
    icon: Icons.MessageSquareText,
  },
};

export default function ToeicReadingSection({
  onStartQuiz,
  loadingQuestions,
  selectedTest: controlledTest,
  onSelectTest,
  activeTab: controlledTab,
  onSelectTab,
}: ToeicReadingSectionProps) {
  const [internalTest, setInternalTest] = useState<number>(1);
  const [internalTab, setInternalTab] = useState<'tests' | 'topics'>('tests');

  const selectedTest = controlledTest ?? internalTest;
  const activeTab = controlledTab ?? internalTab;

  const setSelectedTest = (t: number) => {
    setInternalTest(t);
    onSelectTest?.(t);
  };

  const setActiveTab = (tab: 'tests' | 'topics') => {
    setInternalTab(tab);
    onSelectTab?.(tab);
  };

  const testStats = useMemo(() => getToeicTestStats(), []);
  const toeicTopics = useMemo(() => getToeicTopics(), []);

  const currentStats = useMemo(() => {
    return testStats.find((s) => s.testNumber === selectedTest) || {
      testNumber: selectedTest,
      total: 0,
      p5: 0,
      p6: 0,
      p7: 0,
    };
  }, [testStats, selectedTest]);

  const totalLoadedQuestions = useMemo(() => {
    return testStats.reduce((acc, curr) => acc + curr.total, 0);
  }, [testStats]);

  const handleStartPart = (part: number) => {
    const qList = getBundledToeicQuestions({ test: selectedTest, part });
    if (qList.length === 0) return;
    const partTitle =
      part === 5
        ? 'Part 5 · Sentence Completion'
        : part === 6
          ? 'Part 6 · Text Completion'
          : 'Part 7 · Reading Comprehension';
    onStartQuiz(qList, {
      title: `TOEIC 2026 Test ${String(selectedTest).padStart(2, '0')} · ${partTitle}`,
      count: qList.length,
    });
  };

  const handleStartFullTest = () => {
    const qList = getBundledToeicQuestions({ test: selectedTest });
    if (qList.length === 0) return;
    onStartQuiz(qList, {
      title: `TOEIC 2026 Test ${String(selectedTest).padStart(2, '0')} · Full Test (100 câu)`,
      count: qList.length,
    });
  };

  const handleStartTopic = (topic: string) => {
    const qList = getBundledToeicQuestions({ topic });
    if (qList.length === 0) return;
    const meta = TOEIC_TOPIC_LABELS[topic];
    onStartQuiz(qList, {
      title: `TOEIC 2026 · ${meta ? meta.vi : topic}`,
      count: Math.min(qList.length, 20),
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-amber-50/20 p-6 shadow-sm sm:p-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 border-b border-indigo-100/80 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-sm">
              <Icons.Award className="h-3.5 w-3.5" /> TOEIC Reading 2026
            </span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black text-amber-800 border border-amber-200">
              ETS Official 10 Tests
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 border border-emerald-200">
              Song ngữ 100%
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
            Luyện đề TOEIC Reading 2026 (Test 01 – 10)
          </h2>
          <p className="max-w-2xl text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
            Học cá nhân trọn bộ câu hỏi gốc từ 10 đề thi ETS TOEIC Reading 2026 mới nhất, đầy đủ Part 5, 6, 7 kèm bản dịch và giải thích ngữ pháp, từ vựng chi tiết.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="rounded-xl border border-indigo-200/80 bg-white/80 p-3 shadow-xs backdrop-blur-xs text-right">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Câu hỏi đã nạp</p>
            <p className="text-xl font-black text-indigo-700 sm:text-2xl">{totalLoadedQuestions} / 1.000</p>
            <p className="text-[10px] font-semibold text-slate-500">10 đề thi chuẩn</p>
          </div>
        </div>
      </div>

      {/* Mode Switcher: Theo Đề vs Theo Chủ Điểm */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl bg-slate-100/90 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-black transition-all ${
              activeTab === 'tests'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icons.BookOpen className="h-3.5 w-3.5" /> Luyện theo Đề thi (10 Tests)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('topics')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-black transition-all ${
              activeTab === 'topics'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icons.Sparkles className="h-3.5 w-3.5" /> Luyện theo Chủ điểm ({toeicTopics.length})
          </button>
        </div>

        {activeTab === 'tests' && currentStats.total > 0 && (
          <Button
            onClick={handleStartFullTest}
            disabled={loadingQuestions}
            className="border-amber-400 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black hover:from-amber-600 hover:to-amber-700 shadow-sm"
          >
            <Icons.Play className="h-4 w-4 fill-white" /> Thi thử Full Test {String(selectedTest).padStart(2, '0')} (100 câu)
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'tests' ? (
          <motion.div
            key="tests-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-6 space-y-6"
          >
            {/* 10 Test Buttons Horizontal List */}
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((tNum) => {
                const isSelected = selectedTest === tNum;
                const stat = testStats.find((s) => s.testNumber === tNum);
                const hasData = (stat?.total || 0) > 0;

                return (
                  <button
                    key={tNum}
                    type="button"
                    onClick={() => setSelectedTest(tNum)}
                    className={`group relative flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : hasData
                          ? 'border-indigo-200 bg-white text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/50'
                          : 'border-slate-200 bg-slate-50/60 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Test</span>
                    <span className="text-base font-black sm:text-lg">{String(tNum).padStart(2, '0')}</span>
                    <span
                      className={`mt-1 rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : hasData
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-200/70 text-slate-500'
                      }`}
                    >
                      {stat?.total || 0} Q
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Test Action Cards */}
            <div className="rounded-2xl border border-indigo-100/90 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Đang chọn</span>
                  <h3 className="text-lg font-black text-slate-900 sm:text-xl">
                    ETS TOEIC Reading 2026 — RC TEST {String(selectedTest).padStart(2, '0')}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">Part 5: {currentStats.p5} câu</Badge>
                  <Badge variant="purple">Part 6: {currentStats.p6} câu</Badge>
                  <Badge variant="warning">Part 7: {currentStats.p7} câu</Badge>
                </div>
              </div>

              {currentStats.total === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Icons.LoaderCircle className="h-8 w-8 animate-spin text-indigo-600" />
                  <p className="mt-3 text-sm font-bold text-slate-700">
                    Đề Test {String(selectedTest).padStart(2, '0')} đang được tự động trích xuất trong nền...
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Hệ thống sẽ cập nhật ngay khi hoàn tất. Bạn có thể luyện tập Test 01 ngay bây giờ!
                  </p>
                  <Button
                    onClick={() => setSelectedTest(1)}
                    variant="secondary"
                    className="mt-4"
                  >
                    Chuyển sang Test 01 (100 câu sẵn sàng)
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Part 5 Card */}
                  <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                          <Icons.FileText className="h-5 w-5" />
                        </span>
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-black text-sky-700">
                          {currentStats.p5} Câu (101-130)
                        </span>
                      </div>
                      <h4 className="mt-3 text-base font-black text-slate-900">Part 5: Incomplete Sentences</h4>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        30 câu điền từ vào chỗ trống câu đơn: kiểm tra từ loại, thì động từ, giới từ & từ vựng công sở.
                      </p>
                    </div>
                    <Button
                      onClick={() => handleStartPart(5)}
                      disabled={loadingQuestions || currentStats.p5 === 0}
                      className="mt-4 w-full justify-center font-bold"
                    >
                      Luyện Part 5 ({currentStats.p5} câu)
                    </Button>
                  </div>

                  {/* Part 6 Card */}
                  <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                          <Icons.BookOpen className="h-5 w-5" />
                        </span>
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-black text-violet-700">
                          {currentStats.p6} Câu (131-146)
                        </span>
                      </div>
                      <h4 className="mt-3 text-base font-black text-slate-900">Part 6: Text Completion</h4>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        16 câu thuộc 4 bài đọc ngắn (thông báo, email, bài báo): điền từ và chọn câu văn phù hợp ngữ cảnh.
                      </p>
                    </div>
                    <Button
                      onClick={() => handleStartPart(6)}
                      disabled={loadingQuestions || currentStats.p6 === 0}
                      className="mt-4 w-full justify-center bg-violet-600 font-bold hover:bg-violet-700"
                    >
                      Luyện Part 6 ({currentStats.p6} câu)
                    </Button>
                  </div>

                  {/* Part 7 Card */}
                  <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                          <Icons.Newspaper className="h-5 w-5" />
                        </span>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">
                          {currentStats.p7} Câu (147-200)
                        </span>
                      </div>
                      <h4 className="mt-3 text-base font-black text-slate-900">Part 7: Reading Comprehension</h4>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        54 câu đọc hiểu văn bản đơn, đoạn kép & đoạn ba: emails, thông báo, hóa đơn, lịch trình & tin nhắn chat.
                      </p>
                    </div>
                    <Button
                      onClick={() => handleStartPart(7)}
                      disabled={loadingQuestions || currentStats.p7 === 0}
                      className="mt-4 w-full justify-center bg-amber-600 font-bold hover:bg-amber-700"
                    >
                      Luyện Part 7 ({currentStats.p7} câu)
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Topics Tab */
          <motion.div
            key="topics-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {toeicTopics.map(({ topic, count }) => {
              const meta = TOEIC_TOPIC_LABELS[topic] || {
                label: topic.replace('toeic-', '').replace(/-/g, ' '),
                vi: topic,
                icon: Icons.Bookmark,
              };
              const TopicIcon = meta.icon;

              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleStartTopic(topic)}
                  disabled={loadingQuestions || count === 0}
                  className="group flex min-h-28 items-start gap-3.5 rounded-xl border border-slate-200/90 bg-white p-4 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <TopicIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase tracking-wider text-indigo-600">
                      {meta.label}
                    </span>
                    <span className="mt-0.5 block text-sm font-black text-slate-900 leading-snug">
                      {meta.vi}
                    </span>
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500">{count} câu hỏi</span>
                      <span className="inline-flex items-center gap-1 font-black text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                        Luyện ngay <Icons.ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
