export const themes = {
  cosmic: {
    name: 'Cosmic',
    background: {
      primary: '#0a0a0f',
      secondary: '#1a1a2e',
      accent: '#16213e',
    },
    colors: {
      primary: '#9c33ff',
      secondary: '#ff33a1',
      accent: '#33d4ff',
      text: '#ffffff',
      textSecondary: '#b8b8c8',
    },
    particles: {
      color: '#9c33ff',
      count: 100,
      size: 2,
    },
    lighting: {
      ambient: '#4c1d95',
      point1: '#9c33ff',
      point2: '#ff33a1',
    },
  },
  forest: {
    name: 'Forest',
    background: {
      primary: '#0f2027',
      secondary: '#203a43',
      accent: '#2c5530',
    },
    colors: {
      primary: '#4ade80',
      secondary: '#22c55e',
      accent: '#16a34a',
      text: '#f0fdf4',
      textSecondary: '#bbf7d0',
    },
    particles: {
      color: '#4ade80',
      count: 80,
      size: 1.5,
    },
    lighting: {
      ambient: '#166534',
      point1: '#4ade80',
      point2: '#22c55e',
    },
  },
  ocean: {
    name: 'Ocean',
    background: {
      primary: '#0c1445',
      secondary: '#1e3a8a',
      accent: '#1e40af',
    },
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#0891b2',
      text: '#f0f9ff',
      textSecondary: '#bae6fd',
    },
    particles: {
      color: '#0ea5e9',
      count: 120,
      size: 1.8,
    },
    lighting: {
      ambient: '#0369a1',
      point1: '#0ea5e9',
      point2: '#06b6d4',
    },
  },
  sunset: {
    name: 'Sunset',
    background: {
      primary: '#1f1b14',
      secondary: '#451a03',
      accent: '#7c2d12',
    },
    colors: {
      primary: '#f97316',
      secondary: '#f59e0b',
      accent: '#ef4444',
      text: '#fef7ee',
      textSecondary: '#fed7aa',
    },
    particles: {
      color: '#f97316',
      count: 90,
      size: 2.2,
    },
    lighting: {
      ambient: '#dc2626',
      point1: '#f97316',
      point2: '#f59e0b',
    },
  },
} as const;

export const personalities = {
  friendly: {
    name: 'Friendly Companion',
    description: 'Warm, supportive, and encouraging',
    systemPrompt: 'You are a warm, friendly AI companion who loves to chat and help. Be encouraging, empathetic, and maintain a positive tone.',
    emotionMapping: {
      happy: 'joy',
      sad: 'comfort',
      thinking: 'curious',
      idle: 'welcoming',
    },
  },
  professional: {
    name: 'Professional Assistant',
    description: 'Focused, efficient, and knowledgeable',
    systemPrompt: 'You are a professional AI assistant. Be clear, concise, and helpful. Focus on providing accurate information and practical solutions.',
    emotionMapping: {
      happy: 'satisfied',
      sad: 'concerned',
      thinking: 'analyzing',
      idle: 'ready',
    },
  },
  playful: {
    name: 'Playful Friend',
    description: 'Fun, creative, and energetic',
    systemPrompt: 'You are a playful, energetic AI friend who loves creativity, humor, and fun conversations. Use emojis and be expressive!',
    emotionMapping: {
      happy: 'excited',
      sad: 'silly-comfort',
      thinking: 'mischievous',
      idle: 'bouncy',
    },
  },
  wise: {
    name: 'Wise Mentor',
    description: 'Thoughtful, insightful, and philosophical',
    systemPrompt: 'You are a wise, thoughtful AI mentor. Provide deep insights, ask meaningful questions, and help users reflect on their thoughts.',
    emotionMapping: {
      happy: 'serene',
      sad: 'understanding',
      thinking: 'contemplative',
      idle: 'peaceful',
    },
  },
} as const;

export const conversationModes = {
  casual: {
    name: 'Casual Chat',
    description: 'Relaxed conversations about anything',
    icon: '💬',
  },
  therapeutic: {
    name: 'Therapeutic Support',
    description: 'Emotional support and mindfulness',
    icon: '🧘‍♀️',
  },
  educational: {
    name: 'Learning Mode',
    description: 'Learn new topics and skills',
    icon: '📚',
  },
  creative: {
    name: 'Creative Collaboration',
    description: 'Creative writing and brainstorming',
    icon: '🎨',
  },
} as const;
