import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { ConversationTurn } from '@/types/speaking';
import { speakEnglishText, stopSpeaking, type VoiceEngine, type VoiceGender } from '@/utils/speech';

interface ConversationBubbleProps {
  turn: ConversationTurn;
  onPlayAudio?: (text: string) => void;
  userAvatar?: string | null;
  voiceGender?: VoiceGender;
  voiceEngine?: VoiceEngine;
}

export function ConversationBubble({
  turn,
  userAvatar,
  voiceGender,
  voiceEngine = 'gemini',
}: ConversationBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isAi = turn.role === 'ai';

  const handlePlaySpeech = (text: string) => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakEnglishText(text, {
      engine: voiceEngine,
      gender: isAi ? voiceGender : 'random',
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full gap-2.5 sm:gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
    >
      {/* AI Avatar */}
      {isAi && (
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-sm shadow-indigo-500/20">
          <Icons.Sparkles className="h-4 w-4" />
        </div>
      )}

      {/* Bubble Container */}
      <div className={`flex max-w-[88%] flex-col sm:max-w-[78%] ${isAi ? 'items-start' : 'items-end'}`}>
        <div
          className={`relative rounded-2xl px-4 py-2.5 sm:py-3 shadow-xs transition-all ${
            isAi
              ? 'rounded-tl-xs border border-slate-200/90 bg-white text-slate-800'
              : 'rounded-tr-xs bg-slate-950 text-white shadow-slate-950/10'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm sm:text-[15px] leading-relaxed font-normal">
              {turn.text}
            </p>
            {/* Audio playback button */}
            <button
              type="button"
              onClick={() => handlePlaySpeech(turn.text)}
              title="Nghe phát âm"
              className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                isAi
                  ? isPlaying
                    ? 'bg-sky-100 text-sky-700'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                  : isPlaying
                  ? 'bg-white/20 text-sky-300'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {isPlaying ? (
                <Icons.Volume2 className="h-4 w-4 animate-pulse text-sky-500" />
              ) : (
                <Icons.Volume1 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* User Avatar */}
      {!isAi && (
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs sm:text-sm font-bold text-white shadow-sm">
          {userAvatar || '👤'}
        </div>
      )}
    </motion.div>
  );
}
