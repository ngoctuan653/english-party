/**
 * @module Input
 * @description A premium dark-mode input component with glass styling.
 * Supports label, error message, left icon, right action button,
 * and a textarea variant. Uses forwardRef for proper ref forwarding.
 */

import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
  useState,
  useId,
} from 'react';

/* -------------------------------------------------------------------------- */
/*                                   Input                                    */
/* -------------------------------------------------------------------------- */

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Hint / helper text displayed below the input (hidden when error is set) */
  hint?: string;
  /** Icon element rendered inside the input on the left */
  leftIcon?: ReactNode;
  /** Action element rendered inside the input on the right (e.g. show/hide password toggle) */
  rightAction?: ReactNode;
  /** Input size variant */
  inputSize?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Additional wrapper class names */
  wrapperClassName?: string;
}

/** Size-specific classes for the input element */
const inputSizeClasses = {
  sm: 'h-9 text-xs px-3',
  md: 'h-11 text-sm px-4',
  lg: 'h-13 text-base px-5',
};

/**
 * A styled text input with glass background and focus glow.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="you@example.com"
 *   leftIcon={<Mail className="h-4 w-4" />}
 *   error={errors.email}
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightAction,
      inputSize = 'md',
      fullWidth = true,
      wrapperClassName = '',
      className = '',
      id: idProp,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;

    return (
      <div
        className={[
          'flex flex-col gap-1.5',
          fullWidth ? 'w-full' : '',
          wrapperClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            className={[
              'w-full rounded-xl',
              'bg-slate-50/50',
              'border border-slate-200',
              'text-slate-800 placeholder:text-slate-400',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#0071E3]/25 focus:border-[#0071E3]',
              'hover:border-slate-300',
              error ? 'border-red-500/50 focus:ring-red-500/25 focus:border-red-500/50' : '',
              inputSizeClasses[inputSize],
              leftIcon ? 'pl-10' : '',
              rightAction ? 'pr-10' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          {/* Right action */}
          {rightAction && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
              {rightAction}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs font-medium text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* Hint (only when no error) */}
        {!error && hint && (
          <p className="text-xs text-slate-500">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

/* -------------------------------------------------------------------------- */
/*                                  Textarea                                  */
/* -------------------------------------------------------------------------- */

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text displayed above the textarea */
  label?: string;
  /** Error message displayed below the textarea */
  error?: string;
  /** Hint / helper text */
  hint?: string;
  /** Full width */
  fullWidth?: boolean;
  /** Additional wrapper class names */
  wrapperClassName?: string;
}

/**
 * A styled textarea variant matching the Input component styling.
 *
 * @example
 * ```tsx
 * <Textarea label="Notes" placeholder="Write your notes here..." rows={4} />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = true,
      wrapperClassName = '',
      className = '',
      id: idProp,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;

    return (
      <div
        className={[
          'flex flex-col gap-1.5',
          fullWidth ? 'w-full' : '',
          wrapperClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          rows={rows}
          className={[
            'w-full rounded-xl resize-none',
            'bg-slate-50/50',
            'border border-slate-200',
            'text-slate-800 placeholder:text-slate-400',
            'p-4 text-sm',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#0071E3]/25 focus:border-[#0071E3]',
            'hover:border-slate-300',
            error ? 'border-red-500/50 focus:ring-red-500/25 focus:border-red-500/50' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />

        {error && (
          <p className="text-xs font-medium text-red-400" role="alert">
            {error}
          </p>
        )}

        {!error && hint && (
          <p className="text-xs text-slate-500">{hint}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
