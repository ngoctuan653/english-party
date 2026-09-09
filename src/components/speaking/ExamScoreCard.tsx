import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { SpeakingExamResult } from '@/types/speaking';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { speakEnglishText } from '@/utils/speech';

interface ExamScoreCardProps {
  result: SpeakingExamResult;
  onRetry: () => void;
  onExit: () => void;
}

export function ExamScoreCard({ result, onRetry, onExit }: ExamScoreCardProps) {
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const { scores, detailedFeedback, sampleBand9Answer, xpEarned, question } = result;

  const handlePlaySample = () => {
    if (isPlayingSample) {
      window.speechSynthesis?.cancel();
      setIsPlayingSample(false);
      return;
    }
    setIsPlayingSample(true);
    speakEnglishText(sampleBand9Answer, {
      onEnd: () => setIsPlayingSample(false),
      onError: () => setIsPlayingSample(false),
    });
  };

  const criteria = [
    { label: 'Fluency & Coherence', score: scores.fluency, desc: 'Độ trôi chảy & liên kết ý' },
    { label: 'Lexical Resource', score: scores.lexical, desc: 'Vốn từ vựng & thành ngữ' },
    { label: 'Grammar Accuracy', score: scores.grammar, desc: 'Ngữ pháp & cấu trúc câu' },
    { label: 'Pronunciation', score: scores.pronunciation, desc: 'Ngữ điệu & phát âm ước lượng' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Banner: Overall Score & XP */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-lg sm:p-8"
      >
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-md bg-white/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-sky-300">
                Speaking Assessment
              </span>
              <Badge variant="default" className="border-white/20 text-white font-mono bg-white/10">
                CEFR {result.cefrEquivalent}
              </Badge>
            </div>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl text-white">
              Kết Quả Chấm Điểm Speaking AI
            </h2>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm max-w-md">
              Chủ đề: <span className="font-semibold text-white">{question.topic}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Overall Score Circle */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/10 min-w-28">
              <span className="text-[11px] font-bold uppercase text-slate-300">Band Score</span>
              <span className="text-4xl font-black text-sky-400">
                {scores.overall.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400">/ 9.0</span>
            </div>

            {/* XP Badge */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-500/20 p-4 border border-amber-500/30 min-w-28">
              <span className="text-[11px] font-bold uppercase text-amber-300">XP Thưởng</span>
              <span className="text-3xl font-black text-amber-400">+{xpEarned}</span>
              <span className="text-[10px] text-amber-200">Kinh nghiệm</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4 Assessment Criteria Progress */}
      <Card className="p-6 border border-slate-200 bg-white shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
          Chi tiết 4 tiêu chí chấm điểm
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {criteria.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-800">{item.label}</span>
                  <span className="block text-[11px] text-slate-500">{item.desc}</span>
                </div>
                <span className="text-lg font-black text-slate-900">
                  {item.score.toFixed(1)}
                </span>
              </div>
              <div className="mt-3">
                <Progress
                  value={(item.score / 9) * 100}
                  className="h-2 bg-slate-200"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Candidate Spoken Transcript */}
      <Card className="p-6 border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Icons.FileText className="h-4 w-4 text-sky-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Nội dung bài nói của bạn ({result.durationSeconds}s)
          </h3>
        </div>
        <p className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 italic border border-slate-100">
          "{result.userTranscript}"
        </p>
      </Card>

      {/* Feedback: Strengths & Improvements */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Strengths */}
        <Card className="p-6 border border-emerald-100 bg-emerald-50/30 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 mb-3">
            <Icons.CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-base">Điểm mạnh (Strengths)</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {detailedFeedback.strengths.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Improvements */}
        <Card className="p-6 border border-amber-100 bg-amber-50/30 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800 mb-3">
            <Icons.TrendingUp className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-base">Cần cải thiện (To Improve)</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {detailedFeedback.improvements.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Grammar Corrections Table (if any) */}
      {detailedFeedback.grammarCorrections.length > 0 && (
        <Card className="p-6 border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-rose-700">
            <Icons.AlertTriangle className="h-4 w-4" />
            <h3 className="font-bold text-base">Sửa lỗi ngữ pháp & diễn đạt</h3>
          </div>
          <div className="space-y-3">
            {detailedFeedback.grammarCorrections.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-rose-100 bg-rose-50/40 p-3.5 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="line-through text-rose-700 font-medium">"{item.original}"</span>
                  <Icons.ArrowRight className="hidden sm:inline h-3.5 w-3.5 text-slate-400" />
                  <span className="text-emerald-700 font-bold">"{item.corrected}"</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">{item.explanation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sample Band 9 Answer */}
      <Card className="p-6 border border-indigo-100 bg-indigo-50/30 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-indigo-900">
            <Icons.Sparkles className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-base">Bài mẫu tham khảo Band 9.0</h3>
          </div>
          <Button
            size="sm"
            onClick={handlePlaySample}
            variant="secondary"
            className="gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
          >
            {isPlayingSample ? (
              <>
                <Icons.Volume2 className="h-4 w-4 animate-pulse text-indigo-600" />
                <span>Dừng nghe</span>
              </>
            ) : (
              <>
                <Icons.Volume1 className="h-4 w-4" />
                <span>Nghe bài mẫu</span>
              </>
            )}
          </Button>
        </div>
        <p className="text-sm leading-relaxed text-slate-800 bg-white/80 rounded-xl p-4 border border-indigo-100/80">
          {sampleBand9Answer}
        </p>

        {detailedFeedback.advancedVocabularySuggestions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-indigo-100">
            <span className="text-xs font-bold uppercase text-indigo-800">
              Từ vựng đắt giá nên học:
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {detailedFeedback.advancedVocabularySuggestions.map((vocab, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/80 shadow-2xs"
                >
                  {vocab}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Button
          onClick={onRetry}
          variant="secondary"
          className="w-full sm:w-auto px-6 py-2.5 font-bold gap-2"
        >
          <Icons.RotateCcw className="h-4 w-4" />
          <span>Luyện tập câu khác</span>
        </Button>
        <Button
          onClick={onExit}
          className="w-full sm:w-auto px-8 py-2.5 font-bold bg-slate-950 text-white hover:bg-slate-800 gap-2"
        >
          <Icons.Check className="h-4 w-4" />
          <span>Hoàn tất phiên học</span>
        </Button>
      </div>
    </div>
  );
}
