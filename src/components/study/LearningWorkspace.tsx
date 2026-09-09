import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

type LearningModule = 'grammar' | 'vocabulary' | 'listening' | 'speaking';

const modules: Array<{
  id: LearningModule;
  label: string;
  description: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    id: 'grammar',
    label: 'Grammar & Reading',
    description: 'CEFR A1-C2 practice',
    path: '/study',
    icon: Icons.BookOpen,
  },
  {
    id: 'vocabulary',
    label: 'Vocabulary',
    description: 'Smart flashcards',
    path: '/study/vocabulary',
    icon: Icons.Layers3,
  },
  {
    id: 'listening',
    label: 'Listening',
    description: 'Audio comprehension',
    path: '/study/listening',
    icon: Icons.Headphones,
  },
  {
    id: 'speaking',
    label: 'Speaking AI',
    description: 'Voice coach & exam',
    path: '/study/speaking',
    icon: Icons.Mic,
  },
];

export function LearningModuleNav({ active }: { active: LearningModule }) {
  return (
    <nav
      aria-label="Learning modules"
      className="grid grid-cols-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-4"
    >
      {modules.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === active;

        return (
          <Link
            key={item.id}
            to={item.path}
            aria-current={isActive ? 'page' : undefined}
            className={`group flex min-h-16 items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${
              isActive
                ? 'bg-slate-950 text-white'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                isActive ? 'bg-white/10 text-sky-300' : 'bg-sky-50 text-sky-600'
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">{item.label}</span>
              <span className={`block text-[11px] ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                {item.description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

interface LearningIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  accent?: 'blue' | 'emerald' | 'violet';
  aside?: ReactNode;
}

const accentClasses = {
  blue: 'bg-sky-50 text-sky-700 border-sky-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
};

export function LearningIntro({
  eyebrow,
  title,
  description,
  icon: Icon,
  accent = 'blue',
  aside,
}: LearningIntroProps) {
  return (
    <section className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-h-44 items-center gap-5 p-6 sm:p-8">
        <div className={`hidden h-14 w-14 shrink-0 items-center justify-center rounded-lg border sm:flex ${accentClasses[accent]}`}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase text-sky-700">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      <div className="flex min-h-32 items-center border-t border-slate-200 bg-slate-50 p-5 lg:min-h-44 lg:border-l lg:border-t-0">
        {aside}
      </div>
    </section>
  );
}

interface StatItem {
  label: string;
  value: ReactNode;
  detail?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: 'blue' | 'emerald' | 'amber' | 'violet';
}

const statToneClasses = {
  blue: 'bg-sky-50 text-sky-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
};

export function LearningStats({ items }: { items: StatItem[] }) {
  return (
    <section className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex min-h-24 items-center gap-3 border-b border-slate-200 p-4 last:border-b-0 sm:[&:nth-child(odd)]:border-r xl:border-b-0 xl:border-r xl:last:border-r-0">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${statToneClasses[item.tone ?? 'blue']}`}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase text-slate-400">{item.label}</span>
              <span className="mt-0.5 block text-xl font-black text-slate-950">{item.value}</span>
              {item.detail && <span className="block truncate text-[10px] text-slate-400">{item.detail}</span>}
            </span>
          </div>
        );
      })}
    </section>
  );
}

export function LearningSectionHeading({
  title,
  count,
  icon: Icon,
}: {
  title: string;
  count?: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase text-sky-700">Library</p>
        <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
          <Icon className="h-5 w-5 text-sky-600" />
          {title}
        </h2>
      </div>
      {count && <span className="pb-0.5 text-xs font-semibold text-slate-400">{count}</span>}
    </div>
  );
}

export function WorkspaceSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <Icons.Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        placeholder={placeholder}
      />
    </label>
  );
}
