'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/contexts/AppContext';
import { themes } from '@/lib/themes';
import { type Emotion } from '@/lib/types';
import { Brain, Heart, Lightbulb, Zap, Smile, Frown } from 'lucide-react';

const emotionColors = {
  idle: '#6366f1',
  happy: '#10b981',
  sad: '#ef4444',
  thinking: '#f59e0b',
  surprised: '#ec4899',
  excited: '#a21caf', // Added for 'excited' emotion
};

const emotionLabels = {
  idle: 'Relaxed',
  happy: 'Joyful',
  sad: 'Concerned',
  thinking: 'Processing',
  surprised: 'Energetic',
  excited: 'Inspired', // Added for 'excited' emotion
};

const emotionIcons = {
  idle: Smile,
  happy: Heart,
  sad: Frown,
  thinking: Brain,
  surprised: Zap,
  excited: Lightbulb, // Added for 'excited' emotion
};

export default function MoodRing() {
  const { state } = useAppContext();
  const currentTheme = themes[state.currentTheme];
  const emotionColor = emotionColors[state.botEmotion] || emotionColors.idle;
  const EmotionIcon = emotionIcons[state.botEmotion] || emotionIcons.idle;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-40"
        initial={{ scale: 0, opacity: 0, y: -50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: -50 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.6
        }}
        whileHover={{ scale: 1.05, y: -2 }}
      >
        <motion.div
          className="relative backdrop-blur-2xl rounded-full px-6 py-3 border border-white/20 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, 
              ${currentTheme.colors.primary}15, 
              ${currentTheme.colors.secondary}10, 
              rgba(255,255,255,0.05))`,
            boxShadow: `
              0 8px 32px ${emotionColor}30,
              inset 0 1px 0 rgba(255,255,255,0.2),
              0 0 0 1px ${emotionColor}20
            `
          }}
        >
          {/* Animated background pulse */}
          <motion.div
            className="absolute inset-0 rounded-full opacity-20"
            style={{ backgroundColor: emotionColor }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <div className="flex items-center gap-4 relative z-10">
            {/* Animated emotion indicator */}
            <motion.div
              className="relative flex items-center justify-center"
              animate={{
                scale: state.botEmotion === 'thinking' ? [1, 1.2, 1] : 1,
                rotate: state.botEmotion === 'excited' ? [0, 360] : 0,
              }}
              transition={{
                scale: { duration: 1.5, repeat: state.botEmotion === 'thinking' ? Infinity : 0 },
                rotate: { duration: 2, repeat: state.botEmotion === 'excited' ? Infinity : 0, ease: "linear" }
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: emotionColor }}
              >
                <EmotionIcon className="w-3 h-3 text-white" />
              </div>

              {/* Ripple effect for active emotions */}
              {(state.botEmotion === 'happy' || state.botEmotion === 'excited') && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: emotionColor }}
                  animate={{
                    scale: [1, 2, 3],
                    opacity: [0.6, 0.3, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              )}
            </motion.div>

            {/* Emotion label with typewriter effect */}
            <motion.div
              key={state.botEmotion} // Re-mount when emotion changes
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <motion.span
                className="text-white font-bold text-sm"
                style={{ color: emotionColor }}
              >
                {emotionLabels[state.botEmotion] || 'Neutral'}
              </motion.span>
              <motion.span
                className="text-white/60 text-xs capitalize"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {state.botEmotion} mode
              </motion.span>
            </motion.div>

            {/* Activity indicator */}
            <motion.div className="flex gap-1 ml-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-4 rounded-full"
                  style={{ backgroundColor: `${emotionColor}60` }}
                  animate={{
                    height: [16, 8, 16],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Floating particles around the mood ring */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ backgroundColor: emotionColor, left: '50%', top: '50%' }}
                animate={{
                  x: [0, Math.cos((i * Math.PI) / 3) * 30],
                  y: [0, Math.sin((i * Math.PI) / 3) * 30],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
