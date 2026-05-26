/**
 * @module Button
 * @description A multi-variant button component with premium dark-mode styling.
 * Supports primary (purple gradient), secondary (glass), ghost, and danger variants.
 * Includes loading state, icon support, and Framer Motion tap/hover animations.
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

/** Available button visual variants */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Available button sizes */
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner and disable interaction */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Icon element rendered before button text */
  leftIcon?: ReactNode;
  /** Icon element rendered after button text */
  rightIcon?: ReactNode;
  /** Expand button to fill container width */
  fullWidth?: boolean;
  /** Button content */
  children: ReactNode;
}

/** Size-specific Tailwind classes */
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-xl',
};

/** Variant-specific Tailwind classes */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#0071E3] text-white shadow-sm hover:bg-[#0077ED]',
  secondary:
    'bg-slate-100 border border-slate-200/60 text-slate-800 hover:bg-slate-200/70 hover:border-slate-300',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger:
    'bg-[#FF3B30] text-white shadow-sm hover:bg-[#FF453A]',
};

/**
 * A loading spinner SVG used inside the button when `isLoading` is true.
 */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? 'h-4 w-4'}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Premium multi-variant button with Framer Motion animations.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" leftIcon={<Sparkles />}>
 *   Start Learning
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className = '',
      ...motionProps
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        disabled={isDisabled}
        className={[
          'relative inline-flex items-center justify-center font-semibold',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          'cursor-pointer',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth ? 'w-full' : '',
          isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...motionProps}
      >
        {isLoading && (
          <Spinner
            className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}
          />
        )}

        {!isLoading && leftIcon && (
          <span className="inline-flex shrink-0">{leftIcon}</span>
        )}

        <span className={isLoading ? 'opacity-0' : ''}>{children}</span>

        {/* Keep children in DOM while loading for consistent width */}
        {isLoading && (
          <span className="sr-only">{children}</span>
        )}

        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
