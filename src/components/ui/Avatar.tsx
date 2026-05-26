/**
 * @module Avatar
 * @description User avatar component with image/emoji fallback, status indicator,
 * gradient ring border, and grouped (overlapping) display.
 */

import { type ImgHTMLAttributes } from 'react';

/** Available avatar sizes */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Online/offline status */
export type AvatarStatus = 'online' | 'offline' | 'none';

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  /** Image URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Emoji or text fallback when no image is available */
  fallback?: string;
  /** Avatar size */
  size?: AvatarSize;
  /** Online/offline status indicator */
  status?: AvatarStatus;
  /** Show gradient ring border */
  ring?: boolean;
  /** Additional class names */
  className?: string;
}

/** Size-specific pixel and class mappings */
const sizeConfig: Record<
  AvatarSize,
  { px: number; classes: string; text: string; dot: string }
> = {
  xs: { px: 24, classes: 'h-6 w-6', text: 'text-[10px]', dot: 'h-2 w-2 border' },
  sm: { px: 32, classes: 'h-8 w-8', text: 'text-xs', dot: 'h-2.5 w-2.5 border-[1.5px]' },
  md: { px: 40, classes: 'h-10 w-10', text: 'text-sm', dot: 'h-3 w-3 border-2' },
  lg: { px: 56, classes: 'h-14 w-14', text: 'text-lg', dot: 'h-3.5 w-3.5 border-2' },
  xl: { px: 80, classes: 'h-20 w-20', text: 'text-2xl', dot: 'h-4 w-4 border-2' },
};

/**
 * Renders a user avatar with optional status indicator and gradient ring.
 *
 * @example
 * ```tsx
 * <Avatar src="/avatars/user1.jpg" size="md" status="online" ring />
 * <Avatar fallback="🎉" size="lg" />
 * ```
 */
export function Avatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  status = 'none',
  ring = false,
  className = '',
  ...imgProps
}: AvatarProps) {
  const config = sizeConfig[size];

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {/* Ring wrapper */}
      <div
        className={[
          'relative rounded-full',
          ring
            ? 'bg-gradient-to-br from-violet-500 via-blue-500 to-teal-400 p-[2px]'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          className={[
            'flex items-center justify-center rounded-full overflow-hidden',
            'bg-slate-100',
            config.classes,
            ring ? 'ring-2 ring-white' : '',
          ].join(' ')}
        >
          {src ? (
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover"
              {...imgProps}
            />
          ) : (
            <span
              className={[
                'flex items-center justify-center select-none',
                config.text,
                fallback && /\p{Emoji}/u.test(fallback)
                  ? '' // emoji — use default sizing
                  : 'font-semibold text-slate-500',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden="true"
            >
              {fallback ?? alt?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>
      </div>

      {/* Status indicator dot */}
      {status !== 'none' && (
        <span
          className={[
            'absolute bottom-0 right-0 rounded-full border-white',
            config.dot,
            status === 'online'
              ? 'bg-emerald-400 animate-pulse'
              : 'bg-slate-300',
          ].join(' ')}
          aria-label={status}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Avatar Group                                 */
/* -------------------------------------------------------------------------- */

export interface AvatarGroupProps {
  /** Array of avatar props to render */
  avatars: AvatarProps[];
  /** Max number of avatars to show before a "+N" counter */
  max?: number;
  /** Avatar size for all items in the group */
  size?: AvatarSize;
  /** Additional class names */
  className?: string;
}

/**
 * Renders a group of overlapping avatars with an optional "+N" overflow counter.
 *
 * @example
 * ```tsx
 * <AvatarGroup
 *   avatars={[
 *     { src: '/a1.jpg', alt: 'Alice' },
 *     { src: '/a2.jpg', alt: 'Bob' },
 *     { fallback: '🐱' },
 *   ]}
 *   max={3}
 *   size="sm"
 * />
 * ```
 */
export function AvatarGroup({
  avatars,
  max = 4,
  size = 'sm',
  className = '',
}: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const config = sizeConfig[size];

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visible.map((avatar, i) => (
        <Avatar
          key={i}
          {...avatar}
          size={size}
          className="ring-2 ring-white"
        />
      ))}

      {overflow > 0 && (
        <div
          className={[
            'flex items-center justify-center rounded-full',
            'bg-slate-100 border border-slate-200',
            'font-semibold text-slate-600 ring-2 ring-white',
            config.classes,
            config.text,
          ].join(' ')}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
