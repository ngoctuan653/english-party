import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { ExamSpeakingCategory, SpeakingScenario } from '@/types/speaking';
import { generateRandomSpeakingTopic } from '@/services/gemini';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

interface RandomTopicCardProps {
  onSelectScenario: (scenario: SpeakingScenario) => void;
}

export function RandomTopicCard({ onSelectScenario }: RandomTopicCardProps) {
  const [selectedExam, setSelectedExam] = useState<ExamSpeakingCategory>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenario, setGeneratedScenario] = useState<SpeakingScenario | null>(null);

  const handleGenerate = async (examType = selectedExam) => {
    setIsGenerating(true);
    try {
      const topic = await generateRandomSpeakingTopic(examType);
      setGeneratedScenario(topic);
      toast.success('Đã tạo chủ đề ngẫu nhiên thành công!', { icon: '🎲' });
    } catch (err) {
      toast.error('Có lỗi khi tạo chủ đề. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative col-span-full overflow-hidden rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-pink-50/40 p-5 shadow-sm hover:shadow-md transition-all sm:p-6"
    >
      {/* Background ambient decoration */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-gradient-to-br from-indigo-300/20 to-purple-400/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-gradient-to-br from-pink-300/20 to-indigo-300/10 blur-xl" />

      <div className="relative z-10 flex flex-col justify-between gap-5">
        {/* Top bar: Badge and Exam Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200 text-lg">
              🎲
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-slate-900">
                  AI Random Topic Challenge
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-xs">
                  <Icons.Sparkles className="h-2.5 w-2.5" /> AI Generator
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Tự động tạo kịch bản luyện nói chuẩn format đề thi quốc tế
              </p>
            </div>
          </div>

          {/* Exam Type Selector Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-white/90 p-1 border border-indigo-100 shadow-2xs backdrop-blur-xs">
            {(
              [
                { id: 'all', label: 'Tất cả' },
                { id: 'IELTS', label: 'IELTS' },
                { id: 'VSTEP', label: 'VSTEP' },
                { id: 'TOEIC', label: 'TOEIC' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedExam(tab.id);
                  if (generatedScenario) {
                    handleGenerate(tab.id);
                  }
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  selectedExam === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area: Either prompt to generate or show preview */}
        <AnimatePresence mode="wait">
          {generatedScenario ? (
            <motion.div
              key={generatedScenario.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-xl border border-indigo-100 bg-white/95 p-4 shadow-xs"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-2xl shadow-xs">
                    {generatedScenario.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-black text-slate-900 leading-snug">
                        {generatedScenario.title}
                      </h4>
                      <Badge variant="default" className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 border-indigo-200">
                        {generatedScenario.level}
                      </Badge>
                      <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 uppercase">
                        {selectedExam === 'all' ? 'AI Topic' : selectedExam}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-indigo-600">
                      {generatedScenario.viTitle}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {generatedScenario.description}
                    </p>

                    {/* AI persona hint */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Icons.UserCheck className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      <span className="italic truncate">{generatedScenario.aiPersona}</span>
                    </div>

                    {/* Starter phrase */}
                    {generatedScenario.suggestedPhrases?.length > 0 && (
                      <div className="mt-2.5 rounded-lg bg-indigo-50/50 p-2 border border-indigo-100/60 text-[11px] text-slate-600">
                        <span className="font-bold text-indigo-700">Mẫu câu gợi ý: </span>
                        <span className="italic">"{generatedScenario.suggestedPhrases[0]}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col items-center gap-2 shrink-0 justify-end">
                  <Button
                    onClick={() => onSelectScenario(generatedScenario)}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-200 text-xs px-4 py-2.5"
                  >
                    <span>Nói chuyện ngay</span>
                    <Icons.ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className="gap-1.5 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-3 py-2"
                  >
                    <Icons.RotateCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>Đổi chủ đề khác</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-indigo-100/80 bg-white/70 p-4 backdrop-blur-xs"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100/70 text-indigo-600">
                  <Icons.Shuffle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Chưa biết luyện chủ đề gì hôm nay?
                  </p>
                  <p className="text-xs text-slate-500">
                    Để AI bốc ngẫu nhiên một tình huống thực tế thường gặp trong bài thi{' '}
                    <span className="font-semibold text-indigo-600">
                      {selectedExam === 'all' ? 'IELTS, VSTEP, TOEIC' : selectedExam}
                    </span>
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-200 px-5 py-2.5 text-xs shrink-0"
              >
                {isGenerating ? (
                  <>
                    <Icons.RotateCw className="h-4 w-4 animate-spin" />
                    <span>AI đang tạo chủ đề...</span>
                  </>
                ) : (
                  <>
                    <Icons.Sparkles className="h-4 w-4" />
                    <span>Tạo chủ đề ngẫu nhiên</span>
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
