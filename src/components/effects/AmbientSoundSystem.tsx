'use client';

import React, { useEffect, useRef } from 'react';
import { useAppContext } from '@/contexts/AppContext';

export default function AmbientSoundSystem() {
  const { state } = useAppContext();
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize Web Audio API
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    } catch (error) {
      console.log('Web Audio API not supported');
    }

    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!audioContextRef.current || !gainNodeRef.current || !state.userPreferences.voiceEnabled) return;

    // Create subtle ambient tones based on theme and emotion
    const frequencies = {
      cosmic: { base: 220, harmonics: [330, 440] },
      forest: { base: 174, harmonics: [261, 348] },
      ocean: { base: 196, harmonics: [294, 392] },
      sunset: { base: 246, harmonics: [369, 493] },
    };

    const currentFreqs = frequencies[state.currentTheme];

    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
    }

    try {
      oscillatorRef.current = audioContextRef.current.createOscillator();
      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.setValueAtTime(
        currentFreqs.base,
        audioContextRef.current.currentTime
      );
      oscillatorRef.current.connect(gainNodeRef.current);

      // Adjust volume based on emotion
      const emotionVolume = state.botEmotion === 'happy' ? 0.15 :
                           state.botEmotion === 'sad' ? 0.05 : 0.1;

      gainNodeRef.current.gain.exponentialRampToValueAtTime(
        emotionVolume,
        audioContextRef.current.currentTime + 0.5
      );

      oscillatorRef.current.start();
    } catch (error) {
      console.log('Error creating oscillator:', error);
    }
  }, [state.currentTheme, state.botEmotion, state.userPreferences.voiceEnabled]);

  return null; // This component doesn't render anything visual
}
