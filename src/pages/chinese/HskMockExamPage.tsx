import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { HSK_MOCK_EXAMS } from '@/data/chinese/mock-exams';
import type { HskMockExam, HskMockQuestion } from '@/data/chinese/mock-exams';
import { speakChineseText } from '@/utils/chineseSpeech';

export default function HskMockExamPage() {
  const [selectedExamId, setSelectedExamId] = useState<string>(HSK_MOCK_EXAMS[0].id);
  const currentExam =
    HSK_MOCK_EXAMS.find((e) => e.id === selectedExamId) || HSK_MOCK_EXAMS[0];

  const [timeLeft, setTimeLeft] = useState(currentExam.totalTimeMinutes * 60);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

  // Countdown timer
  useEffect(() => {
    if (!isExamStarted || isExamSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExamSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isExamStarted, isExamSubmitted]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (isExamSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const calculateScore = () => {
    let earned = 0;
    currentExam.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        earned += q.points;
      }
    });
    return earned;
  };

  const handleResetExam = (examId?: string) => {
    if (examId) setSelectedExamId(examId);
    const target = HSK_MOCK_EXAMS.find((e) => e.id === (examId || selectedExamId)) || currentExam;
    setTimeLeft(target.totalTimeMinutes * 60);
    setIsExamStarted(false);
    setIsExamSubmitted(false);
    setUserAnswers({});
  };

  const totalScore = calculateScore();
  const isPassed = totalScore >= currentExam.passingScore;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-20">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                to="/chinese"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Mock Exam
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentExam.hskLevel.toUpperCase()}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  {currentExam.titleVi}
                </h1>
              </div>
            </div>

            {/* Timer and Exam selector */}
            <div className="flex items-center gap-3">
              <select
                value={selectedExamId}
                onChange={(e) => handleResetExam(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none"
              >
                {HSK_MOCK_EXAMS.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.titleVi}
                  </option>
                ))}
              </select>

              {isExamStarted && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm font-black text-rose-400">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {!isExamStarted ? (
          /* EXAM INTRODUCTION & START SCREEN */
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-8 sm:p-10 space-y-6 shadow-2xl text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto text-2xl">
              📝
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">{currentExam.titleVi}</h2>
              <p className="text-xs text-rose-400 font-medium mt-1">{currentExam.title}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Thời gian thi</span>
                <strong className="text-white font-mono text-sm">{currentExam.totalTimeMinutes} phút</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Tổng điểm</span>
                <strong className="text-white font-mono text-sm">{currentExam.totalScore} điểm</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Điểm đạt</span>
                <strong className="text-emerald-400 font-mono text-sm">{currentExam.passingScore} điểm</strong>
              </div>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed text-left p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <strong className="text-amber-400 block mb-1">Quy định thi:</strong>
              • Đề thi gồm các phần Nghe hiểu (听力) và Đọc hiểu (阅读).<br />
              • Thời gian làm bài sẽ tự động đếm ngược khi nhấn Bắt đầu.<br />
              • Đạt từ {currentExam.passingScore}/{currentExam.totalScore} điểm trở lên được cấp chứng chỉ ảo hoàn thành cấp độ!
            </div>

            <button
              onClick={() => setIsExamStarted(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-base shadow-xl shadow-rose-950/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Bắt đầu làm bài thi
            </button>
          </div>
        ) : (
          /* ACTIVE EXAM PAPER */
          <div className="space-y-6">
            {/* Exam Result Banner (After submission) */}
            {isExamSubmitted && (
              <div
                className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-4 ${
                  isPassed
                    ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/60'
                    : 'bg-gradient-to-br from-rose-950/60 to-slate-900 border-rose-500/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                        isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isPassed ? '🏆' : '💪'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">
                        {isPassed ? 'CHÚC MỪNG BẠN ĐÃ ĐỖ KỲ THI!' : 'BẠN CẦN ÔN TẬP THÊM MỘT CHÚT!'}
                      </h2>
                      <p className="text-xs text-slate-300 mt-1">
                        {isPassed
                          ? 'Điểm số của bạn vượt ngưỡng yêu cầu chuẩn HSK.'
                          : 'Hãy xem lại các câu chưa đúng và làm lại lượt mới nhé.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Kết quả tổng:</div>
                    <div className="text-3xl font-black font-mono text-white">
                      <span className={isPassed ? 'text-emerald-400' : 'text-rose-400'}>
                        {totalScore}
                      </span>{' '}
                      / {currentExam.totalScore}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleResetExam()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Làm lại đề thi</span>
                  </button>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {currentExam.questions.map((q, idx) => {
                const isSelected = userAnswers[q.id];
                return (
                  <div
                    key={q.id}
                    className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2.5">
                      <span className="font-bold text-rose-400 uppercase tracking-wider">
                        Phần {q.section === 'listening' ? '1: Nghe hiểu (听力)' : '2: Đọc hiểu (阅读)'} • Câu {idx + 1}
                      </span>
                      <span className="font-mono text-slate-400">{q.points} Điểm</span>
                    </div>

                    <div className="space-y-3">
                      <div className="text-base font-bold text-white">{q.prompt}</div>

                      {q.audioText && (
                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                          <button
                            type="button"
                            onClick={() => speakChineseText(q.audioText!, { rate: 0.85 })}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Volume2 className="h-4 w-4" />
                            <span>Bấm nghe đoạn phát âm</span>
                          </button>
                          {isExamSubmitted && (
                            <span className="text-xs font-mono text-slate-400">{q.audioText}</span>
                          )}
                        </div>
                      )}

                      {q.options && (
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = isSelected === optIdx;
                            let style =
                              'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';

                            if (isExamSubmitted) {
                              if (optIdx === q.correctAnswer) {
                                style =
                                  'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50';
                              } else if (isChosen && optIdx !== q.correctAnswer) {
                                style =
                                  'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/50';
                              }
                            } else if (isChosen) {
                              style =
                                'bg-rose-950/30 border-rose-500 text-white ring-1 ring-rose-500';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                className={`w-full p-3.5 rounded-xl border text-left font-medium text-xs sm:text-sm flex items-center justify-between transition-all ${style}`}
                              >
                                <span>{opt}</span>
                                {isExamSubmitted && optIdx === q.correctAnswer && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 ml-2" />
                                )}
                                {isExamSubmitted && isChosen && optIdx !== q.correctAnswer && (
                                  <XCircle className="h-4 w-4 text-rose-400 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {isExamSubmitted && (
                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                          <strong className="text-amber-400">Giải thích chi tiết:</strong>{' '}
                          {q.explanationVi}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Exam Action Bar */}
            {!isExamSubmitted && (
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-between gap-4 sticky bottom-4">
                <div className="text-xs text-slate-400">
                  Đã trả lời:{' '}
                  <strong className="text-white font-mono">
                    {Object.keys(userAnswers).length}
                  </strong>{' '}
                  / {currentExam.questions.length} câu
                </div>

                <button
                  onClick={() => setIsExamSubmitted(true)}
                  className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-950/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Nộp bài thi
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
