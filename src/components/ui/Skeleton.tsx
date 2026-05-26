/**
 * @module Skeleton
 * @description Loading skeleton placeholder components with dark-theme
 * shimmer animation. Supports text, circle, rect, and card variants
 * with configurable width and height.
 */

import { type CSSProperties, type ReactNode } from 'react';

/** Available skeleton shape variants */
export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'card';

export interface SkeletonProps {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Width — accepts CSS value string (e.g. '100%', '200px') or number (px) */
  width?: string | number;
  /** Height — accepts CSS value string or number (px) */
  height?: string | number;
  /** Number of text lines to render (only for text variant) */
  lines?: number;
  /** Border radius override */
  rounded?: string;
  /** Additional class names */
  className?: string;
  /** Children act as a template; the skeleton wraps them invisibly to preserve size */
  children?: ReactNode;
}

/** Shared shimmer animation class — relies on a Tailwind @keyframes defined in CSS */
const shimmerClass =
  'animate-pulse bg-gradient-to-r from-slate-100 via-slate-200/75 to-slate-100 bg-[length:200%_100%]';

/**
 * Resolves a width/height value to a CSS string.
 */
function toCss(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * A single skeleton block (the base building element).
 */
function SkeletonBlock({
  style,
  className = '',
}: {
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`${shimmerClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * A skeleton loading placeholder with shimmer animation.
 *
 * @example
 * ```tsx
 * // Single rectangle
 * <Skeleton variant="rect" width={200} height={40} />
 *
 * // Multiple text lines
 * <Skeleton variant="text" lines={3} />
 *
 * // Card placeholder
 * <Skeleton variant="card" height={180} />
 *
 * // Wrap children to mimic their size
 * <Skeleton>
 *   <Button>Invisible placeholder</Button>
 * </Skeleton>
 * ```
 */
export function Skeleton({
  variant = 'rect',
  width,
  height,
  lines = 1,
  rounded,
  className = '',
  children,
}: SkeletonProps) {
  // If children are provided, wrap them invisibly
  if (children) {
    return (
      <div className={`relative inline-block ${className}`}>
        <div className="invisible">{children}</div>
        <SkeletonBlock
          className="absolute inset-0 rounded-xl"
          style={{ borderRadius: rounded }}
        />
      </div>
    );
  }

  // --- Text variant: renders multiple lines ---
  if (variant === 'text') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBlock
            key={i}
            className="rounded-md"
            style={{
              width:
                // Make last line shorter for realism
                i === lines - 1 && lines > 1
                  ? '60%'
                  : toCss(width) ?? '100%',
              height: toCss(height) ?? '14px',
              borderRadius: rounded,
            }}
          />
        ))}
      </div>
    );
  }

  // --- Circle variant ---
  if (variant === 'circle') {
    const dim = toCss(width) ?? toCss(height) ?? '40px';
    return (
      <SkeletonBlock
        className={`rounded-full shrink-0 ${className}`}
        style={{ width: dim, height: dim }}
      />
    );
  }

  // --- Card variant ---
  if (variant === 'card') {
    return (
      <div
        className={[
          shimmerClass,
          'rounded-2xl border border-slate-200/50',
          className,
        ].join(' ')}
        style={{
          width: toCss(width) ?? '100%',
          height: toCss(height) ?? '160px',
          borderRadius: rounded,
        }}
        aria-hidden="true"
      />
    );
  }

  // --- Default rect variant ---
  return (
    <SkeletonBlock
      className={`rounded-xl ${className}`}
      style={{
        width: toCss(width) ?? '100%',
        height: toCss(height) ?? '40px',
        borderRadius: rounded,
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                           Composed Skeleton Rows                           */
/* -------------------------------------------------------------------------- */

/**
 * Pre-composed skeleton that mimics a common list-item pattern:
 * avatar + two text lines.
 *
 * @example
 * ```tsx
 * <SkeletonListItem />
 * ```
 */
export function SkeletonListItem({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Skeleton variant="circle" width={40} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="70%" height={12} />
        <Skeleton variant="text" width="40%" height={10} />
      </div>
    </div>
  );
}
