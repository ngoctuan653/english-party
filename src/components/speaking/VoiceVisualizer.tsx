import { motion } from 'framer-motion';

interface VoiceVisualizerProps {
  isListening: boolean;
  audioLevel?: number; // 0 - 100
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceVisualizer({ isListening, audioLevel = 0, size = 'md' }: VoiceVisualizerProps) {
  // 7 frequency bars
  const bars = [0.35, 0.65, 0.9, 1.0, 0.85, 0.6, 0.4];

  const heightMultiplier = isListening ? Math.max(0.25, audioLevel / 75) : 0.15;

  const barWidthClass = size === 'sm' ? 'w-1' : size === 'lg' ? 'w-2.5' : 'w-1.5';
  const containerHeightClass = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-16' : 'h-11';

  return (
    <div className={`relative flex items-center justify-center gap-1.5 ${containerHeightClass}`}>
      {/* Glow aura when active */}
      {isListening && (
        <motion.div
          animate={{
            scale: [1, 1.15 + (audioLevel / 200), 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 -m-3 rounded-full bg-sky-500/15 blur-xl pointer-events-none"
        />
      )}

      {bars.map((weight, index) => {
        const dynamicHeight = isListening
          ? Math.min(100, Math.max(15, weight * heightMultiplier * 100))
          : 15;

        return (
          <motion.div
            key={index}
            animate={{
              height: `${dynamicHeight}%`,
              opacity: isListening ? 0.9 + (audioLevel / 300) : 0.3,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className={`rounded-full transition-colors duration-200 ${barWidthClass} ${
              isListening
                ? 'bg-gradient-to-t from-sky-500 via-indigo-500 to-violet-400'
                : 'bg-slate-300'
            }`}
          />
        );
      })}
    </div>
  );
}
