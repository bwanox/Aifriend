'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type Message } from '@/lib/types';
import { Mic, Send, Square, Trash2, Loader, Sparkles, Volume2, VolumeX, Bot, User, Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppContext } from '@/contexts/AppContext';
import { themes } from '@/lib/themes';

const FormSchema = z.object({
  message: z.string(),
});

type ChatInterfaceProps = {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onClearChat: () => void;
  onStop: () => void;
};

function MessageBubble({ message, index, theme }: { message: Message; index: number; theme: any }) {
  const isBot = message.sender === 'bot';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8, rotateX: -15 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 30,
        scale: isVisible ? 1 : 0.8,
        rotateX: isVisible ? 0 : -15
      }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "flex gap-3 mb-6 perspective-1000",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <motion.div
          className="flex-shrink-0 relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              boxShadow: `0 0 20px ${theme.colors.primary}40`
            }}
          >
            <Bot className="w-5 h-5 text-white" />
            <div
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${theme.colors.accent}, transparent 70%)`
              }}
            />
          </div>
        </motion.div>
      )}

      <motion.div
        className={cn(
          "max-w-[75%] rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden",
          "border border-white/10 shadow-2xl",
          isBot
            ? "bg-gradient-to-br from-white/10 via-white/5 to-transparent text-white"
            : "text-white"
        )}
        style={{
          background: isBot
            ? `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}10, transparent)`
            : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          boxShadow: isBot
            ? `0 8px 32px ${theme.colors.primary}20, inset 0 1px 0 rgba(255,255,255,0.1)`
            : `0 8px 32px ${theme.colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2)`
        }}
        whileHover={{
          scale: 1.02,
          boxShadow: isBot
            ? `0 12px 40px ${theme.colors.primary}30, inset 0 1px 0 rgba(255,255,255,0.15)`
            : `0 12px 40px ${theme.colors.primary}50, inset 0 1px 0 rgba(255,255,255,0.3)`
        }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Animated background effect */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 100}%, ${theme.colors.accent}, transparent 70%)`
          }}
        />

        <motion.p
          className="text-sm leading-relaxed relative z-10 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message.text}
        </motion.p>

        <motion.div
          className="flex items-center justify-between mt-3 opacity-70 relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-xs font-medium">
            {new Date(parseInt(message.id)).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {isBot && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-3 h-3" style={{ color: theme.colors.accent }} />
            </motion.div>
          )}
          {!isBot && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-3 h-3 fill-current" />
            </motion.div>
          )}
        </motion.div>

        {/* Shimmer effect for bot messages */}
        {isBot && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 2 }}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </motion.div>

      {!isBot && (
        <motion.div
          className="flex-shrink-0 relative"
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function EnhancedChatInterface({
  messages,
  onSendMessage,
  isLoading,
  isListening,
  isSpeaking,
  onStartListening,
  onStopListening,
  onClearChat,
  onStop,
}: ChatInterfaceProps) {
  const { state } = useAppContext();
  const currentTheme = themes[state.currentTheme];
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      message: '',
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current && state.userPreferences.autoScroll) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
    setMessageCount(messages.length);
  }, [messages, state.userPreferences.autoScroll]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (data.message.trim() && !isLoading) {
      onSendMessage(data.message);
      form.reset();
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <motion.div
      className="flex flex-col h-full max-h-[70vh] relative"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring" }}
    >
      {/* Enhanced glass morphism background */}
      <div
        className="absolute inset-0 rounded-t-3xl backdrop-blur-2xl border border-white/10"
        style={{
          background: `linear-gradient(135deg, 
            ${currentTheme.colors.primary}08 0%, 
            ${currentTheme.colors.secondary}05 50%, 
            ${currentTheme.colors.accent}03 100%)`,
          boxShadow: `
            0 -8px 32px ${currentTheme.colors.primary}20,
            inset 0 1px 0 rgba(255,255,255,0.1),
            inset 0 -1px 0 rgba(255,255,255,0.05)
          `
        }}
      />

      {/* Chat Messages Area */}
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full px-6 py-6 relative z-10">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center h-40 text-center"
              >
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                  className="relative mb-6"
                >
                  <Sparkles
                    className="w-16 h-16 mb-4"
                    style={{ color: currentTheme.colors.primary }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                      background: `radial-gradient(circle, ${currentTheme.colors.primary}40, transparent 70%)`,
                    }}
                  />
                </motion.div>
                <motion.h3
                  className="text-xl font-bold mb-3"
                  style={{ color: currentTheme.colors.primary }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Ready to chat!
                </motion.h3>
                <motion.p
                  className="text-white/70 text-sm max-w-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Start a conversation with your AI friend. Try saying hello or ask me anything!
                </motion.p>
              </motion.div>
            ) : (
              <motion.div layout>
                {messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    index={index}
                    theme={currentTheme}
                  />
                ))}
              </motion.div>
            )}

            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                className="flex gap-3 mb-6"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                    boxShadow: `0 0 20px ${currentTheme.colors.primary}40`
                  }}
                >
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div
                  className="bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 rounded-2xl p-5 backdrop-blur-xl max-w-xs"
                  style={{
                    boxShadow: `0 8px 32px ${currentTheme.colors.primary}20, inset 0 1px 0 rgba(255,255,255,0.1)`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                    </motion.div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: currentTheme.colors.accent }}
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-white/80 text-sm font-medium">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>

      {/* Enhanced Input Area */}
      <motion.div
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts..."
                        className={cn(
                          "resize-none text-white placeholder:text-gray-300",
                          "border-white/40 focus:border-white/60 min-h-[60px] rounded-xl",
                          "bg-black/40 backdrop-blur-xl",
                          "shadow-lg focus:shadow-xl transition-all duration-300",
                          "focus:ring-2 focus:ring-white/30",
                          "hover:bg-black/50 focus:bg-black/50"
                        )}
                        style={{
                          boxShadow: `0 4px 24px ${currentTheme.colors.primary}20, inset 0 1px 0 rgba(255,255,255,0.15)`,
                          color: '#ffffff',
                          backgroundColor: 'rgba(0, 0, 0, 0.4)'
                        }}
                        onKeyDown={handleKeyPress}
                        onChange={(e) => {
                          field.onChange(e);
                          setIsTyping(e.target.value.length > 0);
                        }}
                        // Remove onChange from field to avoid duplicate
                        {...Object.fromEntries(Object.entries(field).filter(([k]) => k !== 'onChange'))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Enhanced Action Buttons */}
            <motion.div
              className="flex items-center justify-between"
              layout
            >
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className={cn(
                            "bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl",
                            "shadow-lg transition-all duration-300"
                          )}
                          style={{
                            boxShadow: `0 4px 16px ${currentTheme.colors.primary}20`,
                            borderColor: isListening ? currentTheme.colors.accent : 'rgba(255,255,255,0.2)'
                          }}
                          onClick={isListening ? onStopListening : onStartListening}
                        >
                          <motion.div
                            animate={isListening ? {
                              scale: [1, 1.3, 1],
                              rotate: [0, 5, -5, 0]
                            } : {}}
                            transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
                          >
                            <Mic className={cn("w-4 h-4", isListening && "text-red-400")} />
                          </motion.div>
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isListening ? 'Stop listening' : 'Start voice input'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl shadow-lg"
                          onClick={onStop}
                          disabled={!isSpeaking && !isLoading}
                          style={{
                            boxShadow: `0 4px 16px ${currentTheme.colors.secondary}20`
                          }}
                        >
                          {isSpeaking ? (
                            <motion.div
                              animate={{ scale: [1, 0.8, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                            >
                              <VolumeX className="w-4 h-4" />
                            </motion.div>
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isSpeaking ? 'Stop speaking' : 'Stop generation'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl shadow-lg"
                          onClick={onClearChat}
                          disabled={messages.length === 0}
                          style={{
                            boxShadow: `0 4px 16px ${currentTheme.colors.accent}20`
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear chat</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  disabled={!form.watch('message')?.trim() || isLoading}
                  className={cn(
                    "px-8 py-3 font-semibold text-white backdrop-blur-xl",
                    "shadow-xl transition-all duration-300 border-0"
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                    boxShadow: `0 8px 24px ${currentTheme.colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2)`
                  }}
                >
                  <motion.div
                    className="flex items-center gap-2"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                    {isTyping && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Zap className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </motion.div>
  );
}
