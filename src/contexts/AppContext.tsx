'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Message, Emotion } from '@/lib/types';

interface AppState {
  messages: Message[];
  botEmotion: Emotion;
  isLoading: boolean;
  currentTheme: 'cosmic' | 'forest' | 'ocean' | 'sunset';
  botPersonality: 'friendly' | 'professional' | 'playful' | 'wise';
  conversationMode: 'casual' | 'therapeutic' | 'educational' | 'creative';
  userPreferences: {
    voiceEnabled: boolean;
    animations: boolean;
    particleEffects: boolean;
    autoScroll: boolean;
  };
}

type AppAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_EMOTION'; payload: Emotion }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'CHANGE_THEME'; payload: AppState['currentTheme'] }
  | { type: 'CHANGE_PERSONALITY'; payload: AppState['botPersonality'] }
  | { type: 'CHANGE_MODE'; payload: AppState['conversationMode'] }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<AppState['userPreferences']> };

const initialState: AppState = {
  messages: [],
  botEmotion: 'idle',
  isLoading: false,
  currentTheme: 'cosmic',
  botPersonality: 'friendly',
  conversationMode: 'casual',
  userPreferences: {
    voiceEnabled: true,
    animations: true,
    particleEffects: true,
    autoScroll: true,
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_EMOTION':
      return { ...state, botEmotion: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'CHANGE_THEME':
      return { ...state, currentTheme: action.payload };
    case 'CHANGE_PERSONALITY':
      return { ...state, botPersonality: action.payload };
    case 'CHANGE_MODE':
      return { ...state, conversationMode: action.payload };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        userPreferences: { ...state.userPreferences, ...action.payload }
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
