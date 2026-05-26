/**
 * @module Card
 * @description A glassmorphism card component with premium dark-mode styling.
 * Features translucent backdrop-blur, optional hover glow effects,
 * configurable padding, optional header, and Framer Motion entrance animation.
 */

import { type ReactNode, type HTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

/** Available card padding sizes */
export type CardPadding = 'sm' | 'md' | 'lg' | 'none';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'title'> {
  /** Card contents */
  children: ReactNode;
  /** Padding size inside the card */
  padding?: CardPadding;
  /** Enable subtle glow effect on hover */
  hoverable?: boolean;
  /** Enable gradient border on hover */
  gradientBorder?: boolean;
  /** Header title text */
  title?: ReactNode;
  /** Action element rendered in the header (e.g. a button) */
  headerAction?: ReactNode;
  /** Disable the default entrance animation */
  noAnimation?: boolean;
  /** Additional class names */
  className?: string;
}

/** Padding class map */
const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

/** Framer Motion fade-up entrance variants */
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
} as const;

/**
 * Glassmorphism card with optional hover effects and entrance animation.
 *
 * @example
 * ```tsx
 * <Card title="Daily Progress" headerAction={<Button size="sm">View All</Button>}>
 *   <p>Card content here</p>
 * </Card>
 * ```
 */
export function Card({
  children,
  padding = 'md',
  hoverable = false,
  gradientBorder = false,
  title,
  headerAction,
  noAnimation = true,
  className = '',
  ...motionProps
}: CardProps) {
  const hasHeader = title || headerAction;

  const card = (
    <motion.div
      variants={noAnimation ? undefined : cardVariants}
      initial={noAnimation ? undefined : 'hidden'}
      animate={noAnimation ? undefined : 'visible'}
      className={[
        'relative rounded-2xl',
        'bg-white',
        'border border-slate-200/50 shadow-sm',
        // Hover glow
        hoverable
          ? 'transition-all duration-300 hover:border-slate-300/80 hover:shadow-md hover:shadow-slate-200/40'
          : '',
        // Gradient border effect via a pseudo ring
        gradientBorder
          ? 'hover:ring-1 hover:ring-[#0071E3]/20'
          : '',
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...motionProps}
    >
      {/* Optional header */}
      {hasHeader && (
        <div
          className={[
            'flex items-center justify-between',
            padding === 'none' ? 'px-4 pt-4 sm:px-6 sm:pt-6' : '',
            'mb-4',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {title && (
            <h3 className="text-base font-semibold text-slate-800 sm:text-lg">
              {title}
            </h3>
          )}
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      {children}
    </motion.div>
  );

  return card;
}

/**
 * A simpler card body wrapper for use inside Card when you need to
 * separate header padding from content padding.
 */
export function CardBody({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}
