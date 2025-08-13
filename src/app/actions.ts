'use server';

import { analyzeUserSentiment } from '@/ai/flows/analyze-user-sentiment';
import { generateChatResponse } from '@/ai/flows/generate-chat-response';
import { type Message } from '@/lib/types';

export async function getAIResponse(currentMessage: string, history: Message[]) {
  try {
    const sentimentAnalysis = await analyzeUserSentiment({ message: currentMessage });

    const formattedHistory = history.map(msg => ({
        role: msg.sender === 'bot' ? 'model' : 'user',
        content: msg.text
    }));

    const chatResponse = await generateChatResponse({
      message: currentMessage,
      sentiment: sentimentAnalysis.sentiment,
      history: formattedHistory,
    });

    return {
      response: chatResponse.response,
      sentiment: sentimentAnalysis.sentiment.toLowerCase(),
    };
  } catch (error) {
    console.error('Error in server action getAIResponse:', error);
    throw new Error('Failed to get AI response.');
  }
}
