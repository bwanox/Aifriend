'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Clock, Zap } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { themes } from '@/lib/themes';
import { Card } from '@/components/ui/card';

export default function ConversationStats() {
  const { state } = useAppContext();
  const currentTheme = themes[state.currentTheme];

  const totalMessages = state.messages.length;
  const userMessages = state.messages.filter(m => m.sender === 'user').length;
  const botMessages = state.messages.filter(m => m.sender === 'bot').length;
  const avgWordsPerMessage = totalMessages > 0 ?
    Math.round(state.messages.reduce((acc, msg) => acc + msg.text.split(' ').length, 0) / totalMessages) : 0;

  const stats = [
    {
      icon: MessageCircle,
      label: 'Messages',
      value: totalMessages,
      color: currentTheme.colors.primary,
    },
    {
      icon: Heart,
      label: 'Responses',
      value: botMessages,
      color: currentTheme.colors.secondary,
    },
    {
      icon: Zap,
      label: 'Avg Words',
      value: avgWordsPerMessage,
      color: currentTheme.colors.accent,
    },
    {
      icon: Clock,
      label: 'Session',
      value: totalMessages > 0 ? '5m' : '0m', // Simplified for demo
      color: currentTheme.colors.primary,
    },
  ];

  if (totalMessages === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-40"
    >
      <Card className="bg-black/20 backdrop-blur-xl border-white/10 p-3">
        <div className="flex gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <span className="text-white text-xs font-medium">{stat.value}</span>
              <span className="text-white/60 text-xs">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
