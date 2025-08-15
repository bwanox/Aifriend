'use client';

import { useState, useEffect, useRef } from 'react';

// Fix: Import SpeechRecognition type for TS, and fix duplicate property error
// Add type for event parameter

// @ts-ignore
type SpeechRecognitionType = typeof window.SpeechRecognition;
type SpeechRecognitionInstance = InstanceType<SpeechRecognitionType>;

export const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const currentTranscript = event.results[0][0].transcript;
      setTranscript(currentTranscript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
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

  // Helper: pick the most human-like voice
  function pickHumanVoice(voices: SpeechSynthesisVoice[]) {
    // Prefer voices with 'Natural', 'Neural', 'Google', 'Microsoft', 'Apple', 'Jenny', 'Emma', etc.
    const preferred = [
      'Natural', 'Neural', 'Google', 'Microsoft', 'Apple', 'Jenny', 'Emma', 'Samantha', 'Olivia', 'en-US', 'en_GB'
    ];
    return (
      voices.find(v => preferred.some(p => v.name.includes(p)) && v.lang.startsWith('en')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0]
    );
  }

  // Helper: split text into sentences
  function splitSentences(text: string) {
    return text.match(/[^.!?]+[.!?\u2026]?/g) || [text];
  }

  // Helper: add more advanced human-like fillers, breathing, and expressions
  function addHumanExpressions(text: string) {
    // Add fillers at the start of some sentences only
    const fillers = [
      'Hmm,', 'Well,', 'You know,', 'Let me think,', 'Ah,', 'Oh,', 'Mmm,', 'Umm,', 'Huh,', 'Aha,', 'Hmm...'
    ];
    // Only add fillers at the start of a sentence, not at the end or after punctuation
    return text.replace(/(^|[.!?]\s+)([A-Z])/g, (match, sep, char) => {
      if (Math.random() < 0.22) {
        const filler = fillers[Math.floor(Math.random() * fillers.length)];
        // Sometimes add a soft pause for breathing
        if (Math.random() < 0.2) {
          return `${sep}... ${filler} ${char}`;
        }
        return `${sep}${filler} ${char}`;
      }
      // Sometimes just a soft pause
      if (Math.random() < 0.08) {
        return `${sep}... ${char}`;
      }
      return match;
    });
  }

  // Helper: clean up text for speech (remove stray punctuation, never say 'dot', etc.)
  function cleanForSpeech(text: string) {
    // Remove stray single letters or punctuation that could be misread
    return text
      .replace(/\s+([.?!,])\s+/g, ' ') // Remove isolated punctuation
      .replace(/\s+([.?!,])$/g, '') // Remove at end
      .replace(/\s+o\s+/gi, ' ') // Remove stray 'o' (from misparsing)
      .replace(/\s+dot\s+/gi, ' ') // Remove 'dot'
      .replace(/\s+question mark\s+/gi, ' ')
      .replace(/\s+comma\s+/gi, ' ')
      .replace(/\s+period\s+/gi, ' ')
      .replace(/\s+exclamation mark\s+/gi, ' ')
      .replace(/\s+colon\s+/gi, ' ')
      .replace(/\s+semicolon\s+/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Helper: replace emojis and points for natural speech
  function preprocessForSpeech(text: string) {
    // Replace common emoji with natural language or remove
    const emojiMap: Record<string, string> = {
      '😊': 'smiling',
      '😢': 'sad',
      '😂': 'laughing',
      '❤️': 'love',
      '👍': 'thumbs up',
      '🙏': 'thank you',
      '😮': 'surprised',
      '😎': 'cool',
      '😉': 'wink',
      '😭': 'crying',
      '😃': 'happy',
      '😔': 'feeling down',
      '😡': 'angry',
      '😇': 'innocent',
      '😅': 'nervous',
      '😆': 'laughing',
      '😋': 'yummy',
      '😜': 'playful',
      '😝': 'silly',
      '😏': 'smirking',
      '😒': 'unimpressed',
      '😬': 'awkward',
      '😌': 'relieved',
      '😤': 'frustrated',
      '😱': 'shocked',
      '😴': 'sleepy',
      '😑': 'expressionless',
      '😐': 'neutral',
      '😕': 'confused',
      '😲': 'astonished',
      '😚': 'kissing',
      '😙': 'kissing',
      '😗': 'kissing',
      '😘': 'kissing',
      '😽': 'cat kiss',
      '😻': 'cat love',
      '😺': 'cat happy',
      '😸': 'cat smiling',
      '😹': 'cat laughing',
      '😿': 'cat sad',
      '😾': 'cat angry',
      '😼': 'cat smirking',
      '😶': 'speechless',
      '😳': 'embarrassed',
      '😵': 'dizzy',
      '😠': 'angry',
      '😩': 'tired',
      '😫': 'exhausted',
      '😓': 'sweating',
      '😥': 'disappointed',
      '😰': 'anxious',
      '😨': 'fearful',
      '😧': 'anguished',
      '😦': 'frowning',
      '😮‍💨': 'relieved',
      '😯': 'surprised',
      '😷': 'sick',
      '🙀': 'cat scared',
      '👎': 'thumbs down',
      '👏': 'clapping',
      '💔': 'broken heart',
      '💖': 'sparkling heart',
      '💗': 'growing heart',
      '💓': 'beating heart',
      '💞': 'revolving hearts',
      '💘': 'heart with arrow',
      '💝': 'heart with ribbon',
      '💟': 'heart decoration',
      '💤': 'sleeping',
      '💢': 'anger',
      '💥': 'collision',
      '💦': 'sweat',
      '💨': 'dash',
      '💫': 'dizzy',
      '💬': 'speech balloon',
      '💭': 'thought balloon',
      '💮': 'white flower',
      '💯': 'hundred points',
    };
    let out = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, m => emojiMap[m] ? ` ${emojiMap[m]} ` : '');
    // Convert numbered lists to more natural speech
    out = out.replace(/\n?\s*([0-9]+)[.)]\s+/g, (m, n) => `\n${parseInt(n) === 1 ? 'First,' : parseInt(n) === 2 ? 'Next,' : parseInt(n) === 3 ? 'Then,' : 'Also,'} `);
    // Convert bullet points to more natural speech
    out = out.replace(/\n?\s*[-*•]\s+/g, '\nAlso, ');
    // Remove any literal 'emoji' or 'point' words if not part of a real sentence
    out = out.replace(/\bemoji\b/gi, '').replace(/\bpoint\b/gi, '');
    return out;
  }

  // Improved speak: more human, with pauses and randomization
  const speak = (text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech Synthesis API is not supported in this browser.');
      return;
    }
    stopSpeaking();
    const voices = window.speechSynthesis.getVoices();
    const voice = pickHumanVoice(voices);
    // Preprocess for speech: handle emojis, points, lists
    const preprocessed = preprocessForSpeech(text);
    // Add human-like expressions and breathing
    const textWithFillers = addHumanExpressions(preprocessed);
    const sentences = splitSentences(textWithFillers);
    let idx = 0;
    function speakNext() {
      if (idx >= sentences.length) {
        setIsSpeaking(false);
        if (onEnd) onEnd();
        return;
      }
      let sentence = cleanForSpeech(sentences[idx].trim());
      // Add a breathing sound at the start of some sentences
      if (Math.random() < 0.18) {
        sentence = '... ' + sentence;
      }
      // Tone: If it's a question, increase pitch/rate for a questioning tone
      const isQuestion = /\?\s*$/.test(sentence);
      const utter = new SpeechSynthesisUtterance(sentence);
      if (voice) utter.voice = voice;
      utter.rate = isQuestion ? 1.04 : 0.97 + Math.random() * 0.07; // Slightly faster for questions
      utter.pitch = isQuestion ? 1.18 : 1.01 + Math.random() * 0.12; // Higher pitch for questions
      utter.volume = 1;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => {
        setIsSpeaking(false);
        idx++;
        setTimeout(speakNext, 220 + Math.random() * 120); // 220-340ms pause for breathing
      };
      utter.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        idx = sentences.length; // stop
        if (onEnd) onEnd();
      };
      window.speechSynthesis.speak(utter);
    }
    speakNext();
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
