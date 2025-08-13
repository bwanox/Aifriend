'use client';

import { useState, useEffect, useRef } from 'react';
import { type Message, type Emotion } from '@/lib/types';
import { getAIResponse } from '@/app/actions';
import { useSpeech } from '@/hooks/useSpeech';

import ChatbotCanvas from '@/components/chatbot/ChatbotCanvas';
import ChatInterface from '@/components/chatbot/ChatInterface';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [botEmotion, setBotEmotion] = useState<Emotion>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useSpeech();

  useEffect(() => {
    if (transcript) {
      handleSendMessage(transcript);
    }
  }, [transcript]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setBotEmotion('thinking');

    try {
      const { response, sentiment } = await getAIResponse(
        text,
        messages.slice(-5)
      );

      const botMessage: Message = { id: Date.now().toString() + 'b', text: response, sender: 'bot' };
      
      const newEmotion = sentiment === 'positive' ? 'happy' : sentiment === 'negative' ? 'sad' : 'idle';
      setBotEmotion(newEmotion);
      
      setMessages((prev) => [...prev, botMessage]);
      speak(response, () => {
        setBotEmotion('idle');
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + 'e',
        text: "Sorry, I'm having a little trouble thinking right now.",
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
      setBotEmotion('sad');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearChat = () => {
    setMessages([]);
    stopSpeaking();
    setBotEmotion('idle');
  };

  const handleStop = () => {
    if(isSpeaking) {
      stopSpeaking();
      setBotEmotion('idle');
    }
    if (isLoading) {
      // In a real scenario, you might want to add a request cancellation logic here
      setIsLoading(false);
      setBotEmotion('idle');
    }
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="flex-1 relative">
        <ChatbotCanvas
          emotion={botEmotion}
          isSpeaking={isSpeaking}
        />
      </div>
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isListening={isListening}
        isSpeaking={isSpeaking}
        onStartListening={startListening}
        onStopListening={stopListening}
        onClearChat={handleClearChat}
        onStop={handleStop}
      />
    </div>
  );
}
