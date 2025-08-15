'use client';

import { useState, useEffect } from 'react';
import { type Message } from '@/lib/types';
import { getAIResponse } from '@/app/actions';
import { useSpeech } from '@/hooks/useSpeech';
import { motion } from 'framer-motion';

import ChatbotCanvas from '@/components/chatbot/ChatbotCanvas';
import EnhancedChatInterface from '@/components/chatbot/EnhancedChatInterface';
import SettingsPanel from '@/components/ui/settings-panel';
import MoodRing from '@/components/ui/mood-ring';
import ConversationStats from '@/components/ui/conversation-stats';
import { AppProvider, useAppContext } from '@/contexts/AppContext';

function HomeContent() {
  const { state, dispatch } = useAppContext();
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

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user'
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    setIsLoading(true);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_EMOTION', payload: 'thinking' });

    try {
      const { response, sentiment } = await getAIResponse(
        text,
        state.messages.slice(-5),
        state.botPersonality,
        state.conversationMode
      );

      const botMessage: Message = {
        id: Date.now().toString() + 'b',
        text: response,
        sender: 'bot'
      };

      const newEmotion = sentiment === 'positive' ? 'happy' :
                        sentiment === 'negative' ? 'sad' : 'idle';
      dispatch({ type: 'SET_EMOTION', payload: newEmotion });
      dispatch({ type: 'ADD_MESSAGE', payload: botMessage });

      if (state.userPreferences.voiceEnabled) {
        speak(response, () => {
          dispatch({ type: 'SET_EMOTION', payload: 'idle' });
        });
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + 'e',
        text: "Sorry, I'm having a little trouble thinking right now.",
        sender: 'bot',
      };
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
      dispatch({ type: 'SET_EMOTION', payload: 'sad' });
    } finally {
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const handleClearChat = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
    stopSpeaking();
    dispatch({ type: 'SET_EMOTION', payload: 'idle' });
  };

  const handleStop = () => {
    if (isSpeaking) {
      stopSpeaking();
      dispatch({ type: 'SET_EMOTION', payload: 'idle' });
    }
    if (isLoading) {
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_EMOTION', payload: 'idle' });
    }
  };

  return (
    <motion.div
      className="relative w-full h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Settings Panel */}
      <SettingsPanel />

      {/* Mood Ring */}
      <MoodRing />

      {/* Conversation Stats */}
      <ConversationStats />

      {/* Full-Screen 3D Canvas - takes entire viewport */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <ChatbotCanvas
          emotion={state.botEmotion}
          isSpeaking={isSpeaking}
        />

        {/* Floating status indicators */}
        {isListening && (
          <motion.div
            className="absolute top-4 left-4 bg-red-500/20 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2 z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-sm">Listening...</span>
          </motion.div>
        )}

        {isSpeaking && (
          <motion.div
            className="absolute top-4 left-4 bg-blue-500/20 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2 z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-white text-sm">Speaking...</span>
          </motion.div>
        )}
      </motion.div>

      {/* Chat Interface - overlaid at bottom with backdrop blur */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-20"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <EnhancedChatInterface
          messages={state.messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onStartListening={startListening}
          onStopListening={stopListening}
          onClearChat={handleClearChat}
          onStop={handleStop}
        />
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
