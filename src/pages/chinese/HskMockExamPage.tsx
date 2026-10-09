import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Award,
  HelpCircle
} from 'lucide-react';
import { HSK_MOCK_EXAMS } from '@/data/chinese/mock-exams';
import type { HskMockExam } from '@/types/chinese';
import { speakChineseText } from '@/utils/chineseSpeech';

export default function HskMockExamPage() {
  const [selectedExamId, setSelectedExamId] = useState<string>(HSK_MOCK_EXAMS[0].id);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(HSK_MOCK_EXAMS[0].totalTimeMinutes * 60);

  const currentExam =
    HSK_MOCK_EXAMS.find((e) => e.id === selectedExamId) || HSK_MOCK_EXAMS[0];

  // Timer countdown
  useEffect(() => {
    let timer: any = null;
    if (isExamStarted && !isExamSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsExamSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExamStarted, isExamSubmitted, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isExamSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    currentExam.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        score += q.points;
      }
    });
    return score;
  };

  const handleResetExam = (examId?: string) => {
    if (examId) setSelectedExamId(examId);
    const targetExam = examId
      ? HSK_MOCK_EXAMS.find((e) => e.id === examId) || HSK_MOCK_EXAMS[0]
      : currentExam;

    setTimeLeft(targetExam.totalTimeMinutes * 60);
    setIsExamStarted(false);
    setIsExamSubmitted(false);
    setUserAnswers({});
  };

  const totalScore = calculateScore();
  const isPassed = totalScore >= currentExam.passingScore;

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Header */}
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
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
                Mock Exam
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentExam.hskLevel.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentExam.titleVi}
            </h1>
          </div>
        </div>

        {/* Timer and Exam selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedExamId}
            onChange={(e) => handleResetExam(e.target.value)}
            className="bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:border-rose-400 cursor-pointer"
          >
            {HSK_MOCK_EXAMS.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.titleVi}
              </option>
            ))}
          </select>

          {isExamStarted && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-rose-200 shadow-sm font-mono text-sm font-black text-rose-600">
              <Clock className="h-4 w-4 animate-pulse text-rose-500" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-8">
        {!isExamStarted ? (
          /* EXAM INTRODUCTION & START SCREEN */
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 space-y-6 shadow-sm text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              📝
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">{currentExam.titleVi}</h2>
              <p className="text-xs text-rose-600 font-medium mt-1">{currentExam.title}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block">Thời gian thi</span>
                <strong className="text-slate-900 font-mono text-sm">{currentExam.totalTimeMinutes} phút</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Tổng điểm</span>
                <strong className="text-slate-900 font-mono text-sm">{currentExam.totalScore} điểm</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Điểm đạt</span>
                <strong className="text-emerald-600 font-mono text-sm">{currentExam.passingScore} điểm</strong>
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed text-left p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <strong className="text-amber-800 block mb-1">Quy định thi:</strong>
              • Đề thi gồm các phần Nghe hiểu (听力) và Đọc hiểu (阅读).<br />
              • Thời gian làm bài sẽ tự động đếm ngược khi nhấn Bắt đầu.<br />
              • Đạt từ {currentExam.passingScore}/{currentExam.totalScore} điểm trở lên được cấp chứng chỉ ảo hoàn thành cấp độ!
            </div>

            <button
              onClick={() => setIsExamStarted(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-base shadow-lg shadow-rose-200/50 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
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
                className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-4 ${
                  isPassed
                    ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-emerald-200'
                    : 'bg-gradient-to-br from-rose-50 via-white to-amber-50 border-rose-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                        isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {isPassed ? '🏆' : '💪'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">
                        {isPassed ? 'CHÚC MỪNG BẠN ĐÃ ĐỖ KỲ THI!' : 'BẠN CẦN ÔN TẬP THÊM MỘT CHÚT!'}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {isPassed
                          ? 'Điểm số của bạn vượt ngưỡng yêu cầu chuẩn HSK.'
                          : 'Hãy xem lại các câu chưa đúng và làm lại lượt mới nhé.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Kết quả tổng:</div>
                    <div className="text-3xl font-black font-mono text-slate-900">
                      <span className={isPassed ? 'text-emerald-600' : 'text-rose-600'}>
                        {totalScore}
                      </span>{' '}
                      / {currentExam.totalScore}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleResetExam()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-sm cursor-pointer"
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
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-2.5">
                      <span className="font-bold text-rose-600 uppercase tracking-wider">
                        Phần {q.section === 'listening' ? '1: Nghe hiểu (听力)' : '2: Đọc hiểu (阅读)'} • Câu {idx + 1}
                      </span>
                      <span className="font-mono text-slate-500 font-bold">{q.points} Điểm</span>
                    </div>

                    <div className="space-y-3">
                      <div className="text-base font-bold text-slate-900">{q.prompt}</div>

                      {q.audioText && (
                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => speakChineseText(q.audioText!, { rate: 0.85 })}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Volume2 className="h-4 w-4" />
                            <span>Bấm nghe đoạn phát âm</span>
                          </button>
                          {isExamSubmitted && (
                            <span className="text-xs font-mono text-slate-600">{q.audioText}</span>
                          )}
                        </div>
                      )}

                      {q.options && (
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = isSelected === optIdx;
                            let style =
                              'bg-slate-50 border-slate-200/80 text-slate-800 hover:border-slate-300 hover:bg-slate-100/60';

                            if (isExamSubmitted) {
                              if (optIdx === q.correctAnswer) {
                                style =
                                  'bg-emerald-50 border-emerald-400 text-emerald-900 ring-1 ring-emerald-400/40 font-bold';
                              } else if (isChosen && optIdx !== q.correctAnswer) {
                                style =
                                  'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400/40 font-bold';
                              }
                            } else if (isChosen) {
                              style =
                                'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400/40 font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                className={`w-full p-3.5 rounded-xl border text-left font-medium text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${style}`}
                              >
                                <span>{opt}</span>
                                {isExamSubmitted && optIdx === q.correctAnswer && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
                                )}
                                {isExamSubmitted && isChosen && optIdx !== q.correctAnswer && (
                                  <XCircle className="h-4 w-4 text-rose-600 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {isExamSubmitted && (
                        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                          <strong className="text-amber-800">Giải thích chi tiết:</strong>{' '}
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
              <div className="p-4 rounded-2xl bg-white/95 backdrop-blur border border-slate-200/80 shadow-lg flex items-center justify-between gap-4 sticky bottom-4">
                <div className="text-xs text-slate-500">
                  Đã trả lời:{' '}
                  <strong className="text-slate-900 font-mono text-sm">
                    {Object.keys(userAnswers).length}
                  </strong>{' '}
                  / {currentExam.questions.length} câu
                </div>

                <button
                  onClick={() => setIsExamSubmitted(true)}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm shadow-md shadow-rose-200/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Nộp bài thi
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
