'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type Message } from '@/lib/types';
import { Mic, Send, Square, Trash2, Loader, Sparkles, Volume2, VolumeX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSpeech } from '@/hooks/useSpeech';


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

export default function ChatInterface({
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isSoundOn, setIsSoundOn] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('evofriend-sound');
      return stored === null ? true : stored === 'true';
    }
    return true;
  });
  const { speak, stopSpeaking } = useSpeech();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      message: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (data.message.trim()) {
      onSendMessage(data.message);
      form.reset({ message: '' });
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Play AI message with speech synthesis if sound is on
  useEffect(() => {
    if (!isSoundOn) {
      stopSpeaking();
      return;
    }
    // Only speak the latest AI message
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'bot' && lastMsg.text) {
        speak(lastMsg.text);
      }
    }
    // eslint-disable-next-line
  }, [messages, isSoundOn]);

  // Persist sound state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('evofriend-sound', isSoundOn.toString());
    }
  }, [isSoundOn]);

  // Stop speaking on clear chat
  const handleClearChat = () => {
    stopSpeaking();
    onClearChat();
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-3xl mx-auto p-4 pb-8 bg-background/50 backdrop-blur-md rounded-t-2xl border-t border-white/10">
        <ScrollArea className="h-48 md:h-64 mb-4 pr-4" ref={scrollAreaRef}>
          <div className="flex flex-col gap-4">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Sparkles className="h-10 w-10 mb-4" />
                    <p className="text-lg font-medium">I'm EvoFriend!</p>
                    <p className="text-sm">Ask me anything, or tell me how you're feeling.</p>
                </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex items-start gap-3',
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-xs md:max-w-md p-3 px-4 rounded-3xl shadow-lg',
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-br-lg'
                      : 'bg-muted text-muted-foreground rounded-bl-lg'
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-3xl p-3 px-4 rounded-bl-lg">
                      <Loader className="h-5 w-5 animate-spin text-accent" />
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
            {/* Sound Control Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsSoundOn((prev) => !prev)}
                  className="shrink-0 rounded-full hover:bg-white/10"
                  aria-label={isSoundOn ? 'Mute' : 'Unmute'}
                >
                  {isSoundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{isSoundOn ? 'Mute' : 'Unmute'}</p></TooltipContent>
            </Tooltip>
            {/* Clear Chat Button */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" onClick={handleClearChat} className="shrink-0 rounded-full hover:bg-white/10">
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Clear Chat</p></TooltipContent>
            </Tooltip>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Textarea
                      placeholder="Type a message or use the mic..."
                      className="resize-none rounded-2xl bg-white/5 border-white/10 focus-visible:ring-accent"
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)();
                          }
                      }}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={isLoading} className="shrink-0 rounded-full bg-gradient-to-br from-primary to-accent hover:opacity-90 transition-opacity">
              <Send className="h-5 w-5" />
            </Button>
            
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="button" size="icon" variant={isListening ? 'destructive' : 'secondary'} onClick={isListening ? onStopListening : onStartListening} disabled={isSpeaking} className="shrink-0 rounded-full">
                        <Mic className={cn("h-5 w-5", isListening && "animate-pulse")} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>{isListening ? 'Stop Listening' : 'Speak'}</p></TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" onClick={onStop} disabled={!isSpeaking && !isLoading} className="shrink-0 rounded-full hover:bg-white/10">
                        <Square className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Stop</p></TooltipContent>
            </Tooltip>
          </form>
        </Form>
      </div>
    </TooltipProvider>
  );
}
