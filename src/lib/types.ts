export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export type Emotion = 'idle' | 'happy' | 'thinking' | 'surprised' | 'sad';
