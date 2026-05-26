/**
 * @module Modal
 * @description An animated modal dialog with backdrop blur overlay.
 * Uses Framer Motion for scale/fade entrance and exit animations,
 * React portals for proper stacking context, and supports escape
 * key and click-outside dismissal.
 */

import {
  useEffect,
  useCallback,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

/** Available modal width sizes */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback fired when the modal should close */
  onClose: () => void;
  /** Modal title rendered in the header */
  title?: string;
  /** Modal width size */
  size?: ModalSize;
  /** Modal body content */
  children: ReactNode;
  /** Disable closing by clicking backdrop */
  disableBackdropClose?: boolean;
  /** Disable closing via Escape key */
  disableEscapeClose?: boolean;
  /** Hide the close (X) button */
  hideCloseButton?: boolean;
  /** Additional class names for the modal panel */
  className?: string;
}

/** Width classes for each size */
const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/** Backdrop animation variants */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15, delay: 0.05 } },
};

/** Panel animation variants */
const panelVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 350, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: { duration: 0.15 },
  },
};

/** Close icon SVG */
function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/**
 * Portal-based animated modal with dark glass overlay.
 *
 * @example
 * ```tsx
 * <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirm">
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  disableBackdropClose = false,
  disableEscapeClose = false,
  hideCloseButton = false,
  className = '',
}: ModalProps) {
  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableEscapeClose) {
        onClose();
      }
    },
    [onClose, disableEscapeClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Click-outside handler
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !disableBackdropClose) {
      onClose();
    }
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={[
              'relative w-full',
              sizeClasses[size],
              'rounded-2xl',
              'bg-white',
              'border border-slate-200/80',
              'shadow-xl shadow-slate-200/50',
              'p-6',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {/* Header */}
            {(title || !hideCloseButton) && (
              <div className="mb-4 flex items-center justify-between">
                {title && (
                  <h2 className="text-lg font-bold text-slate-800">
                    {title}
                  </h2>
                )}
                {!hideCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="ml-auto rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] cursor-pointer"
                    aria-label="Close modal"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="text-slate-600">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Portal-based rendering - mount into document.body
  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}
