'use client';

import { useState, useEffect, useRef } from 'react';

// Define the SpeechRecognition interface for browsers that support it.
interface CustomWindow extends Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
declare const window: CustomWindow;


export const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const currentTranscript = event.results[0][0].transcript;
      setTranscript(currentTranscript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // In some browsers, recognition stops automatically. Restart if we are still supposed to be listening.
        // But for this app, we want it to stop after one phrase.
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn('Speech Synthesis API is not supported in this browser.');
        return;
    }
    
    stopSpeaking(); // Stop any currently speaking utterance

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Optional: find a nice voice
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(voice => voice.name.includes('Google') && voice.lang.startsWith('en')) || voices.find(voice => voice.lang.startsWith('en'));
    if(friendlyVoice) {
      utterance.voice = friendlyVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if(window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }
  }

  // Ensure voices are loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
  }, []);

  return { isListening, isSpeaking, transcript, startListening, stopListening, speak, stopSpeaking };
};
