/**
 * @module Tabs
 * @description Animated tab component with Framer Motion layoutId indicator,
 * icon + badge/count support, gradient underline highlight, and mobile
 * horizontal scrolling.
 */

import { type ReactNode, useId } from 'react';
import { motion } from 'framer-motion';

/** A single tab item definition */
export interface TabItem {
  /** Unique key for the tab */
  key: string;
  /** Display label */
  label: string;
  /** Optional icon rendered before the label */
  icon?: ReactNode;
  /** Optional count badge rendered after the label */
  count?: number;
  /** Disable this tab */
  disabled?: boolean;
}

export interface TabsProps {
  /** Array of tab definitions */
  items: TabItem[];
  /** Currently active tab key */
  activeKey: string;
  /** Callback when a tab is selected */
  onChange: (key: string) => void;
  /** Layout mode: 'full' stretches tabs to fill width, 'auto' sizes to content */
  variant?: 'full' | 'auto';
  /** Additional class names for the wrapper */
  className?: string;
}

/**
 * Animated tab bar with gradient underline indicator.
 *
 * @example
 * ```tsx
 * const [tab, setTab] = useState('vocab');
 *
 * <Tabs
 *   items={[
 *     { key: 'vocab', label: 'Vocabulary', icon: <BookOpen />, count: 24 },
 *     { key: 'grammar', label: 'Grammar', icon: <PenTool /> },
 *     { key: 'listening', label: 'Listening', icon: <Headphones /> },
 *   ]}
 *   activeKey={tab}
 *   onChange={setTab}
 * />
 * ```
 */
export function Tabs({
  items,
  activeKey,
  onChange,
  variant = 'auto',
  className = '',
}: TabsProps) {
  const layoutId = useId();

  return (
    <div
      className={[
        // Scrollable on mobile
        'overflow-x-auto scrollbar-none -mx-1',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <nav
        role="tablist"
        className={[
          'flex min-w-max gap-1',
          'rounded-xl bg-slate-100 p-1',
          variant === 'full' ? 'w-full' : 'w-auto inline-flex',
        ].join(' ')}
      >
        {items.map((item) => {
          const isActive = item.key === activeKey;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.key}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange(item.key)}
              className={[
                'relative flex items-center justify-center gap-2',
                'rounded-lg px-4 py-2 text-sm font-medium',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]',
                variant === 'full' ? 'flex-1' : '',
                isActive
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-800',
                isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* Active indicator background */}
              {isActive && (
                <motion.div
                  layoutId={`tab-indicator-${layoutId}`}
                  className="absolute inset-0 rounded-lg bg-white border border-slate-200/50 shadow-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {/* Tab content – above the indicator */}
              <span className="relative z-10 flex items-center gap-2">
                {item.icon && (
                  <span className="inline-flex shrink-0">{item.icon}</span>
                )}

                <span>{item.label}</span>

                {item.count !== undefined && (
                  <span
                    className={[
                      'inline-flex items-center justify-center',
                      'min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold',
                      isActive
                        ? 'bg-[#0071E3]/10 text-[#0071E3]'
                        : 'bg-slate-200 text-slate-600',
                    ].join(' ')}
                  >
                    {item.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Gradient underline accent for the active tab */}
      <div className="mt-0.5 h-0.5 w-full overflow-hidden rounded-full bg-white/5">
        {/* This is a decorative accent line below the tab bar */}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Tab Panel                                  */
/* -------------------------------------------------------------------------- */

export interface TabPanelProps {
  /** The tab key this panel belongs to */
  tabKey: string;
  /** Currently active tab key */
  activeKey: string;
  /** Panel content */
  children: ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * Content panel that renders only when its tab is active.
 * Includes a Framer Motion fade entrance animation.
 *
 * @example
 * ```tsx
 * <TabPanel tabKey="vocab" activeKey={tab}>
 *   <VocabularyList />
 * </TabPanel>
 * ```
 */
export function TabPanel({
  tabKey,
  activeKey,
  children,
  className = '',
}: TabPanelProps) {
  if (tabKey !== activeKey) return null;

  return (
    <motion.div
      role="tabpanel"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
