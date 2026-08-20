import { Fragment, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

export interface LearningPathNode {
  id: string;
  unit: number;
  unitTitle: string;
  title: string;
  description: string;
  detail: string;
  href: string;
  state?: Record<string, unknown>;
  icon: ComponentType<{ className?: string }>;
  tone: 'sky' | 'emerald' | 'violet' | 'amber';
}

const currentToneClasses = {
  sky: 'border-sky-700 bg-sky-500 shadow-[0_6px_0_#0369a1]',
  emerald: 'border-emerald-700 bg-emerald-500 shadow-[0_6px_0_#047857]',
  violet: 'border-violet-700 bg-violet-500 shadow-[0_6px_0_#6d28d9]',
  amber: 'border-amber-600 bg-amber-400 shadow-[0_6px_0_#d97706]',
};

export function LearningPath({
  nodes,
  completedCount,
}: {
  nodes: LearningPathNode[];
  completedCount: number;
}) {
  const currentIndex = Math.min(Math.max(0, completedCount), Math.max(0, nodes.length - 1));

  return (
    <div className="relative mx-auto w-full max-w-2xl pb-4">
      <div className="absolute bottom-10 left-7 top-20 w-1 -translate-x-1/2 rounded-full bg-slate-200 md:left-1/2" />

      {nodes.map((node, index) => {
        const Icon = node.icon;
        const isCompleted = index < completedCount;
        const isCurrent = index === currentIndex && !isCompleted;
        const isLocked = index > currentIndex;
        const showUnit = index === 0 || nodes[index - 1].unit !== node.unit;
        const nodeClasses = isCompleted
          ? 'border-emerald-700 bg-emerald-500 text-white shadow-[0_6px_0_#047857]'
          : isCurrent
            ? `${currentToneClasses[node.tone]} text-white`
            : 'border-slate-300 bg-slate-200 text-slate-400 shadow-[0_6px_0_#cbd5e1]';

        const nodeControl = (
          <span
            className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 transition-transform ${nodeClasses} ${
              isLocked ? '' : 'group-hover:-translate-y-0.5 group-active:translate-y-1 group-active:shadow-none'
            }`}
          >
            {isCompleted ? <Icons.Check className="h-6 w-6" strokeWidth={3} /> : isLocked ? <Icons.LockKeyhole className="h-5 w-5" /> : <Icon className="h-6 w-6" />}
          </span>
        );

        const copy = (
          <div className={`min-w-0 pt-0.5 ${isLocked ? 'opacity-55' : ''}`}>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black text-slate-950">{node.title}</p>
              {isCurrent && (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-black uppercase text-sky-700">Next</span>
              )}
              {isCompleted && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700">Mastered</span>
              )}
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">{node.description}</p>
            <p className="mt-1.5 text-[10px] font-bold uppercase text-slate-400">{node.detail}</p>
          </div>
        );

        return (
          <Fragment key={node.id}>
            {showUnit && (
              <div className="relative z-10 mb-5 mt-8 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 px-5 py-4 text-white first:mt-0">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase text-sky-300">Unit {node.unit}</p>
                    <h3 className="mt-1 text-base font-black">{node.unitTitle}</h3>
                  </div>
                  <Icons.Map className="h-6 w-6 text-slate-500" />
                </div>
              </div>
            )}

            {isLocked ? (
              <div className="relative grid min-h-24 grid-cols-[56px_minmax(0,1fr)] items-start gap-4 py-3 md:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] md:gap-0">
                <div className={index % 2 === 0 ? 'hidden md:block md:pr-6 md:text-right' : 'hidden'}>
                  {index % 2 === 0 && copy}
                </div>
                <div className="flex justify-center">{nodeControl}</div>
                <div className={index % 2 === 0 ? 'md:hidden' : 'md:pl-6'}>{copy}</div>
              </div>
            ) : (
              <Link
                to={node.href}
                state={node.state}
                className="group relative grid min-h-24 grid-cols-[56px_minmax(0,1fr)] items-start gap-4 py-3 md:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] md:gap-0"
              >
                <div className={index % 2 === 0 ? 'hidden md:block md:pr-6 md:text-right' : 'hidden'}>
                  {index % 2 === 0 && copy}
                </div>
                <div className="flex justify-center">{nodeControl}</div>
                <div className={index % 2 === 0 ? 'md:hidden' : 'md:pl-6'}>{copy}</div>
              </Link>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
