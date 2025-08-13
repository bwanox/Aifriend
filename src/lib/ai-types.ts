import { z } from 'zod';
import { type Message as PageMessage } from '@/lib/types';

export type Message = PageMessage;

const AIMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type AIMessage = z.infer<typeof AIMessageSchema>;

export const GenerateChatResponseInputSchema = z.object({
  message: z.string().describe('The user message to respond to.'),
  sentiment: z.string().describe("The user's current sentiment."),
  history: z.array(AIMessageSchema).describe('The conversation history.'),
});
export type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;

export const GenerateChatResponseOutputSchema = z.object({
  response: z.string().describe('The generated response from the chatbot.'),
});
export type GenerateChatResponseOutput = z.infer<typeof GenerateChatResponseOutputSchema>;
