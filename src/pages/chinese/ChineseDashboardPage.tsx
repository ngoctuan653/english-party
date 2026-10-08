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
  HSK3_VOCAB,
  HSK4_VOCAB,
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

  const totalVocabCount =
    HSK1_VOCAB.length + HSK2_VOCAB.length + HSK3_VOCAB.length + HSK4_VOCAB.length;

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
      badgeColor: 'bg-rose-50 text-rose-600 border-rose-200',
      color: 'from-rose-500 to-red-500',
      iconBg: 'bg-rose-50 border-rose-200/60',
      iconColor: 'text-rose-500',
    },
    {
      id: 'stage1',
      title: 'Giai đoạn 1: Cơ Bản HSK 1–2',
      level: 'HSK 1-2',
      duration: '2–3 tháng',
      desc: '300 từ vựng cốt lõi, flashcard lặp lại ngắt quãng (SRS), ngữ pháp SVO, 是, 有, 不/没, 了 và hội thoại cơ bản.',
      status: 'in_progress',
      progress: 35,
      link: '/chinese/vocab',
      badge: 'SẴN SÀNG',
      badgeColor: 'bg-amber-50 text-amber-600 border-amber-200',
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-50 border-amber-200/60',
      iconColor: 'text-amber-500',
    },
    {
      id: 'stage2',
      title: 'Giai đoạn 2: Sơ Trung Cấp HSK 3',
      level: 'HSK 3',
      duration: '3–4 tháng',
      desc: 'Mở rộng 600 từ vựng, chinh phục câu chữ 把 và 被, các loại bổ ngữ kết quả/xu hướng và câu phức liên từ.',
      status: 'in_progress',
      progress: 20,
      link: '/chinese/grammar',
      badge: 'SẴN SÀNG',
      badgeColor: 'bg-purple-50 text-purple-600 border-purple-200',
      color: 'from-purple-500 to-indigo-500',
      iconBg: 'bg-purple-50 border-purple-200/60',
      iconColor: 'text-purple-500',
    },
    {
      id: 'stage3',
      title: 'Giai đoạn 3: Trung Cấp HSK 4',
      level: 'HSK 4',
      duration: '4–6 tháng',
      desc: 'Chạm mốc 1,200 từ vựng, luyện nói kịch bản công việc cùng AI Gemini, đọc bài báo phân cấp và viết chữ Hán tay.',
      status: 'in_progress',
      progress: 10,
      link: '/chinese/speaking',
      badge: 'SẴN SÀNG',
      badgeColor: 'bg-blue-50 text-blue-600 border-blue-200',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-50 border-blue-200/60',
      iconColor: 'text-blue-500',
    },
    {
      id: 'stage4',
      title: 'Giai đoạn 4: Luyện Đề HSK 4',
      level: 'HSK Exam',
      duration: '1–2 tháng',
      desc: 'Đề thi thử chuẩn HSK (Nghe, Đọc, Sắp xếp câu) bấm giờ thi thật, phân tích chi tiết lỗ hổng kiến thức.',
      status: 'in_progress',
      progress: 15,
      link: '/chinese/mock',
      badge: 'MOCK EXAM',
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      color: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-50 border-emerald-200/60',
      iconColor: 'text-emerald-500',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Hero Banner — Light card variant */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 via-white to-amber-50 border border-rose-200/60 p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.06),transparent_50%)]" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100/80 border border-rose-200/80 px-3 py-1 text-xs font-semibold text-rose-600">
              <span>🇨🇳</span>
              <span>Chương trình chuẩn HSK 3.0</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">Lộ trình 0 → HSK 4</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Chinh Phục Tiếng Trung{' '}
              <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                Khoa Học & Bứt Phá
              </span>
            </h1>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Tích hợp phương pháp tốt nhất từ HelloChinese, DuChinese và Skritter: Học âm điệu chuẩn xác từ Pinyin, lặp lại ngắt quãng (SRS) cho chữ Hán, và luyện phản xạ với gia sư AI.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/chinese/pinyin"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm shadow-lg shadow-rose-200/50 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Volume2 className="h-4 w-4" />
                <span>Vào Luyện Pinyin & Thanh Điệu</span>
                <ChevronRight className="h-4 w-4" />
              </Link>

              <div className="flex items-center gap-2 text-xs text-slate-500 px-3 py-2 bg-white/80 rounded-xl border border-slate-200/80">
                <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>Mục tiêu khuyến nghị: 1–1.5 giờ / ngày</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm lg:w-80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tổng quan tiến độ
              </span>
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> Đang hoạt động
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Làm chủ Pinyin</span>
                  <span className="text-rose-500 font-bold font-mono">{pinyinPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pinyinPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Kho từ vựng HSK 1–4</span>
                  <span className="text-amber-500 font-bold font-mono">{totalVocabCount} / 1,200 từ</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" style={{ width: `${Math.min(100, Math.round((totalVocabCount / 1200) * 100))}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-rose-400" />
                  <span className="text-xs text-slate-500">Thời gian học hôm nay</span>
                </div>
                <span className="text-xs font-bold text-slate-800 font-mono">25 phút</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: 5-Stage Roadmap */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Lộ Trình Học Tập (0 → HSK 4)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Phân bổ thời gian khoa học từ làm quen phát âm đến luyện đề thi thực chiến
          </p>
        </div>

        <div className="space-y-3">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className="group bg-white hover:bg-white border border-slate-200/80 hover:border-rose-200 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md`}
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
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">{stage.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-slate-400">Tiến độ</span>
                    <div className="text-sm font-bold text-slate-800 font-mono">{stage.progress}%</div>
                  </div>

                  {stage.link !== '#' ? (
                    <Link
                      to={stage.link}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-gradient-to-r hover:from-rose-600 hover:to-rose-500 text-slate-600 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Bắt đầu học</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <span className="px-4 py-2 rounded-xl bg-slate-50 text-slate-400 font-bold text-xs border border-slate-200/80">
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
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Kho Luyện Tập Theo Kỹ Năng
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rèn luyện 4 kỹ năng Nghe - Nói - Đọc - Viết kết hợp SRS Flashcard
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/chinese/pinyin"
            className="group p-5 rounded-2xl bg-white hover:bg-white border border-slate-200/80 hover:border-rose-300 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-500 flex items-center justify-center mb-3">
                <Volume2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                Pinyin & Thanh Điệu
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                21 thanh mẫu, 36 vận mẫu, luyện phản xạ 4 thanh điệu và biến điệu tự nhiên.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-rose-500">
              <span>Luyện ngay</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to="/chinese/vocab"
            className="group p-5 rounded-2xl bg-white hover:bg-white border border-slate-200/80 hover:border-amber-300 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-500 flex items-center justify-center mb-3">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                Từ Vựng & Lượng Từ
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Kho từ vựng chuẩn HSK kèm lượng từ, câu mẫu và phân tích bộ thủ.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-amber-500 font-bold">
              <span>{totalVocabCount} từ • {CHINESE_MEASURE_WORDS.length} lượng từ</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to="/chinese/grammar"
            className="group p-5 rounded-2xl bg-white hover:bg-white border border-slate-200/80 hover:border-sky-300 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-sky-50 border border-sky-200/60 text-sky-500 flex items-center justify-center mb-3">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                Ngữ Pháp HSK 1–4
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Cấu trúc SVO, 是, 有, 把, 被, 比 và các cặp liên từ phức.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-sky-500 font-bold">
              <span>{CHINESE_GRAMMAR_PATTERNS.length} mẫu ngữ pháp</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to="/chinese/reading"
            className="group p-5 rounded-2xl bg-white hover:bg-white border border-slate-200/80 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-500 flex items-center justify-center mb-3">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                Đọc Hiểu Phân Cấp
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bài đọc đời sống & văn hóa có Pinyin, audio và câu hỏi kiểm tra.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-emerald-500 font-bold">
              <span>{CHINESE_READING_PASSAGES.length} bài đọc chuẩn HSK</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to="/chinese/listening"
            className="group p-5 rounded-2xl bg-white hover:bg-white border border-slate-200/80 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-500 flex items-center justify-center mb-3">
                <Headphones className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                Hội Thoại Luyện Nghe
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Nghe hội thoại hai người, trả lời câu hỏi và luyện shadowing.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-indigo-500 font-bold">
              <span>{CHINESE_LISTENING_DIALOGUES.length} đoạn hội thoại</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to="/chinese/speaking"
            className="group p-5 rounded-2xl bg-white hover:bg-white border border-slate-200/80 hover:border-purple-300 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-500 flex items-center justify-center mb-3">
                <Mic className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                AI Luyện Nói
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Đóng vai trò hội thoại mua sắm, gọi món, phỏng vấn với gia sư AI.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-purple-500 font-bold">
              <span>{CHINESE_SPEAKING_SCENARIOS.length} kịch bản nhập vai</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to="/chinese/writing"
            className="group p-5 rounded-2xl bg-white hover:bg-white border border-slate-200/80 hover:border-rose-300 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-500 flex items-center justify-center mb-3">
                <PenTool className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                Tập Viết & 214 Bộ Thủ
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Quy tắc bút thuận chuẩn SVG MakeMeAHanzi và 214 bộ thủ Khang Hy.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-rose-500 font-bold">
              <span>{CHINESE_RADICALS.length} bộ thủ cơ bản</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
