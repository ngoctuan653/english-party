/**
 * @module Badge
 * @description Status and info badge component with glass-morphism styling.
 * Supports multiple color variants, optional dot indicator, icon support,
 * and pill-shaped (rounded-full) design.
 */

import { type ReactNode } from 'react';

/** Available badge color variants */
export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'default';

/** Available badge sizes */
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** Badge content text */
  children: ReactNode;
  /** Color variant */
  variant?: BadgeVariant;
  /** Size */
  size?: BadgeSize;
  /** Show a small colored dot indicator before the text */
  dot?: boolean;
  /** Optional icon rendered before the text */
  icon?: ReactNode;
  /** Additional class names */
  className?: string;
}

/** Variant-specific color classes */
const variantClasses: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200/50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200/50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  danger: {
    bg: 'bg-rose-50 border-rose-200/50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200/50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  purple: {
    bg: 'bg-violet-50 border-violet-200/50',
    text: 'text-violet-700',
    dot: 'bg-violet-500',
  },
  default: {
    bg: 'bg-slate-100 border-slate-200/60',
    text: 'text-slate-600',
    dot: 'bg-slate-500',
  },
};

/** Size-specific classes */
const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

/**
 * A pill-shaped status badge with glass background.
 *
 * @example
 * ```tsx
 * <Badge variant="success" dot>Online</Badge>
 * <Badge variant="info" icon={<Star className="h-3 w-3" />}>Featured</Badge>
 * ```
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  className = '',
}: BadgeProps) {
  const colors = variantClasses[variant];

  return (
    <span
      className={[
        'inline-flex items-center font-medium',
        'rounded-full border backdrop-blur-sm',
        colors.bg,
        colors.text,
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Dot indicator */}
      {dot && (
        <span
          className={[
            'shrink-0 rounded-full',
            size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
            colors.dot,
          ].join(' ')}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      {icon && !dot && (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}

      {children}
    </span>
  );
}
