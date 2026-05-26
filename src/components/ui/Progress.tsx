/**
 * @module Progress
 * @description Animated progress bar and circular progress components.
 * Features gradient fill (violet → blue → teal), Framer Motion spring
 * animation for value changes, percentage text, labels, and a glow effect.
 */

import { motion } from 'framer-motion';

/** Progress bar height variants */
export type ProgressHeight = 'sm' | 'md' | 'lg';

/* -------------------------------------------------------------------------- */
/*                              Linear Progress                               */
/* -------------------------------------------------------------------------- */

export interface ProgressProps {
  /** Current progress value (0–100) */
  value: number;
  /** Maximum value, defaults to 100 */
  max?: number;
  /** Height variant */
  height?: ProgressHeight;
  /** Show percentage text to the right */
  showPercent?: boolean;
  /** Label text rendered above the bar */
  label?: string;
  /** Enable glow effect on the fill */
  glow?: boolean;
  /** Additional class names for the wrapper */
  className?: string;
}

/** Height-specific classes */
const heightClasses: Record<ProgressHeight, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4 rounded-xl',
};

/**
 * An animated linear progress bar with gradient fill and optional glow.
 *
 * @example
 * ```tsx
 * <Progress value={72} label="Vocabulary" showPercent glow />
 * ```
 */
export function Progress({
  value,
  max = 100,
  height = 'md',
  showPercent = false,
  label,
  glow = false,
  className = '',
}: ProgressProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {/* Label row */}
      {(label || showPercent) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-slate-700">
              {label}
            </span>
          )}
          {showPercent && (
            <span className="text-sm tabular-nums font-semibold text-slate-500">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={[
          'w-full overflow-hidden rounded-full bg-slate-100',
          heightClasses[height],
        ].join(' ')}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {/* Fill */}
        <motion.div
          className={[
            'h-full rounded-full',
            'bg-gradient-to-r from-[#0071E3] to-[#3595FF]',
            glow ? 'shadow-[0_0_12px_rgba(0,113,227,0.3)]' : '',
          ].join(' ')}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Circular Progress                              */
/* -------------------------------------------------------------------------- */

export interface CircularProgressProps {
  /** Current progress value (0–100) */
  value: number;
  /** Maximum value, defaults to 100 */
  max?: number;
  /** Diameter of the circle in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Show percentage text in center */
  showPercent?: boolean;
  /** Enable glow effect */
  glow?: boolean;
  /** Center content (overrides showPercent) */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * An animated circular / donut progress indicator.
 *
 * @example
 * ```tsx
 * <CircularProgress value={85} size={80} showPercent glow />
 * ```
 */
export function CircularProgress({
  value,
  max = 100,
  size = 64,
  strokeWidth = 5,
  showPercent = false,
  glow = false,
  children,
  className = '',
}: CircularProgressProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-100"
          strokeWidth={strokeWidth}
        />

        {/* Animated fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          className={glow ? 'drop-shadow-[0_0_6px_rgba(0,113,227,0.4)]' : ''}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#0071E3" />
            <stop offset="50%" stopColor="#3595FF" />
            <stop offset="100%" stopColor="#34C759" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ?? (
          showPercent && (
            <span className="text-sm font-bold tabular-nums text-slate-800">
              {Math.round(percent)}%
            </span>
          )
        )}
      </div>
    </div>
  );
}
