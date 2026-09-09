import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { SpeakingScenario } from '@/types/speaking';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ScenarioCardProps {
  scenario: SpeakingScenario;
  onSelect: (scenario: SpeakingScenario) => void;
}

const categoryStyles: Record<string, { label: string; tone: string }> = {
  daily: { label: 'Đời sống', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  business: { label: 'Công việc', tone: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  travel: { label: 'Du lịch', tone: 'bg-sky-50 text-sky-700 border-sky-200' },
  academic: { label: 'Học thuật', tone: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export function ScenarioCard({ scenario, onSelect }: ScenarioCardProps) {
  const cat = categoryStyles[scenario.category] || { label: scenario.category, tone: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col justify-between p-5 border border-slate-200 bg-white transition-shadow hover:shadow-md hover:border-slate-300">
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-2xl border border-slate-100 shadow-sm">
              {scenario.icon}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${cat.tone}`}>
                {cat.label}
              </span>
              <Badge variant="default" className="font-mono text-xs font-bold text-slate-700">
                {scenario.level}
              </Badge>
            </div>
          </div>

          {/* Title & Description */}
          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {scenario.title}
            </h3>
            <p className="mt-0.5 text-xs font-semibold text-sky-600">
              {scenario.viTitle}
            </p>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-600 line-clamp-3">
              {scenario.description}
            </p>
          </div>

          {/* Sample phrase chip */}
          {scenario.suggestedPhrases.length > 0 && (
            <div className="mt-3 rounded-lg bg-slate-50 p-2 border border-slate-100 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Mẫu câu: </span>
              <span className="italic">"{scenario.suggestedPhrases[0]}"</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-3 border-t border-slate-100">
          <Button
            onClick={() => onSelect(scenario)}
            className="w-full justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white shadow-sm"
          >
            <span>Bắt đầu hội thoại</span>
            <Icons.ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
