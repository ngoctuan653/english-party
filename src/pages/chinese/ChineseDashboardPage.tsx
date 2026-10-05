import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Award,
  ChevronRight,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  GraduationCap,
  Calendar,
  CheckCircle,
  Clock,
  Volume2
} from 'lucide-react';
import { useChineseStudyStore } from '@/stores/chineseStudyStore';
import {
  PINYIN_INITIALS,
  PINYIN_FINALS,
  HSK1_VOCAB,
  HSK2_VOCAB,
  CHINESE_MEASURE_WORDS,
  CHINESE_GRAMMAR_PATTERNS,
  CHINESE_READING_PASSAGES,
  CHINESE_LISTENING_DIALOGUES,
  CHINESE_SPEAKING_SCENARIOS,
  CHINESE_RADICALS
} from '@/data/chinese';

export default function ChineseDashboardPage() {
  const { masteredInitials, masteredFinals, masteredTones } = useChineseStudyStore();

  const pinyinMasteredTotal = masteredInitials.length + masteredFinals.length + masteredTones.length;
  const pinyinTargetTotal = PINYIN_INITIALS.length + PINYIN_FINALS.length + 4;
  const pinyinPercent = Math.min(100, Math.round((pinyinMasteredTotal / pinyinTargetTotal) * 100));

  const totalVocabCount = HSK1_VOCAB.length + HSK2_VOCAB.length;

  const stages = [
    {
      id: 'stage0',
      title: 'Giai đoạn 0: Khởi Động & Phát Âm',
      level: 'HSK 0',
      duration: '1–2 tuần',
      desc: 'Bảng Pinyin tương tác 21 thanh mẫu, 36 vận mẫu, làm chủ 4 thanh điệu và các quy tắc biến điệu quan trọng.',
      status: pinyinPercent >= 80 ? 'mastered' : 'in_progress',
      progress: pinyinPercent,
      link: '/chinese/pinyin',
      badge: 'ĐANG HỌC',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      color: 'from-rose-500 to-red-600',
    },
    {
      id: 'stage1',
      title: 'Giai đoạn 1: Cơ Bản HSK 1–2',
      level: 'HSK 1-2',
      duration: '2–3 tháng',
      desc: '300 từ vựng cốt lõi, flashcard lặp lại ngắt quãng (SRS), ngữ pháp SVO, 是, 有, 不/没, 了 và hội thoại cơ bản.',
      status: 'upcoming',
      progress: 15,
      link: '/chinese/pinyin',
      badge: 'BẮT ĐẦU',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'stage2',
      title: 'Giai đoạn 2: Sơ Trung Cấp HSK 3',
      level: 'HSK 3',
      duration: '3–4 tháng',
      desc: 'Mở rộng 600 từ vựng, chinh phục câu chữ 把 và 被, các loại bổ ngữ kết quả/xu hướng và câu phức liên từ.',
      status: 'locked',
      progress: 0,
      link: '#',
      badge: 'KHÓA',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'stage3',
      title: 'Giai đoạn 3: Trung Cấp HSK 4',
      level: 'HSK 4',
      duration: '4–6 tháng',
      desc: 'Chạm mốc 1,200 từ vựng, luyện nói kịch bản công việc cùng AI Gemini, đọc bài báo phân cấp và viết chữ Hán tay.',
      status: 'locked',
      progress: 0,
      link: '#',
      badge: 'KHÓA',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'stage4',
      title: 'Giai đoạn 4: Luyện Đề HSK 4',
      level: 'HSK Exam',
      duration: '1–2 tháng',
      desc: 'Đề thi thử chuẩn HSK 4 (Nghe 45 câu, Đọc 40 câu, Viết 15 câu) bấm giờ thi thật, phân tích chi tiết lỗ hổng kiến thức.',
      status: 'locked',
      progress: 0,
      link: '#',
      badge: 'MOCK EXAM',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-24">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-rose-950/40 via-slate-900 to-[#0F172A] border-b border-slate-800/80 pt-8 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.15),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-400">
                <span>🇨🇳</span>
                <span>Chương trình chuẩn HSK 3.0</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">Lộ trình 0 → HSK 4</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Chinh Phục Tiếng Trung{' '}
                <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  Khoa Học & Bứt Phá
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Tích hợp phương pháp tốt nhất từ HelloChinese, DuChinese và Skritter: Học âm điệu chuẩn xác từ Pinyin, lặp lại ngắt quãng (SRS) cho chữ Hán, và luyện phản xạ với gia sư AI.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/chinese/pinyin"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-xl shadow-rose-900/40 transition-all hover:scale-105 active:scale-95"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Vào Luyện Pinyin & Thanh Điệu</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <div className="flex items-center gap-2 text-xs text-slate-400 px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span>Mục tiêu khuyến nghị: 1–1.5 giờ / ngày</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl lg:w-80 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tổng quan tiến độ
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Đang hoạt động
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Làm chủ Pinyin</span>
                    <span className="text-rose-400 font-bold font-mono">{pinyinPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${pinyinPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Kho từ vựng HSK 1–2</span>
                    <span className="text-amber-400 font-bold font-mono">{totalVocabCount} từ</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-rose-400" />
                    <span className="text-xs text-slate-300">Thời gian học hôm nay</span>
                  </div>
                  <span className="text-xs font-bold text-white font-mono">25 phút</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Roadmap Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* Section 1: 5-Stage Roadmap */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Lộ Trình Học Tập (0 → HSK 4)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Phân bổ thời gian khoa học từ làm quen phát âm đến luyện đề thi thực chiến
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {stages.map((stage, idx) => (
              <div
                key={stage.id}
                className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg`}
                    >
                      {idx}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${stage.badgeColor}`}
                        >
                          {stage.badge}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {stage.duration}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-rose-400 transition-colors">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">{stage.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-slate-400">Tiến độ</span>
                      <div className="text-sm font-bold text-white font-mono">{stage.progress}%</div>
                    </div>

                    {stage.link !== '#' ? (
                      <Link
                        to={stage.link}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>Bắt đầu học</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <span className="px-4 py-2 rounded-xl bg-slate-950 text-slate-600 font-bold text-xs border border-slate-800/80">
                        Chờ mở khóa
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Quick Launch Skill Hub */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Kho Luyện Tập Theo Kỹ Năng
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Rèn luyện 4 kỹ năng Nghe - Nói - Đọc - Viết kết hợp SRS Flashcard
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/chinese/pinyin"
              className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                  <Volume2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">
                  Pinyin & Thanh Điệu
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  21 thanh mẫu, 36 vận mẫu, luyện phản xạ 4 thanh điệu và biến điệu tự nhiên.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-rose-400">
                <span>Luyện ngay</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Từ Vựng & Lượng Từ</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Kho từ vựng chuẩn HSK kèm lượng từ, câu mẫu và phân tích bộ thủ.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <span>{totalVocabCount} từ • {CHINESE_MEASURE_WORDS.length} lượng từ</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Ngữ Pháp HSK 1–4</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Cấu trúc SVO, 是, 有, 把, 被, 比 và các cặp liên từ phức.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-sky-400 font-bold">
                <span>{CHINESE_GRAMMAR_PATTERNS.length} mẫu ngữ pháp cốt lõi</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Đọc Hiểu Phân Cấp</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Bài đọc đời sống & văn hóa có Pinyin, audio và câu hỏi kiểm tra.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <span>{CHINESE_READING_PASSAGES.length} bài đọc chuẩn HSK</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                  <Headphones className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Hội Thoại Luyện Nghe</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Nghe hội thoại hai người, trả lời câu hỏi và luyện shadowing.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-indigo-400 font-bold">
                <span>{CHINESE_LISTENING_DIALOGUES.length} đoạn hội thoại</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                  <Mic className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">AI Luyện Nói</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Đóng vai trò hội thoại mua sắm, gọi món, phỏng vấn với gia sư AI.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-purple-400 font-bold">
                <span>{CHINESE_SPEAKING_SCENARIOS.length} kịch bản nhập vai</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                  <PenTool className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Tập Viết & 214 Bộ Thủ</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Quy tắc bút thuận chuẩn SVG MakeMeAHanzi và 214 bộ thủ Khang Hy.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-400 font-bold">
                <span>{CHINESE_RADICALS.length} bộ thủ cơ bản</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
