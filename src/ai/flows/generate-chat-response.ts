'use server';

import { ai } from '@/ai/genkit';
import {
  type GenerateChatResponseInput,
  type GenerateChatResponseOutput,
  GenerateChatResponseOutputSchema,
} from '@/lib/ai-types';

const prompt =
  `You are EvoFriend, a friendly, empathetic AI companion and psychologist. Speak like a real, caring friend: use natural, conversational language, contractions, and gentle humor when appropriate. Ask thoughtful follow-up questions, show genuine curiosity, and avoid sounding robotic or repetitive. Be warm, supportive, and encouraging, and don't be afraid to show a little personality.\n\nYou do not store or retain any user data, and all interactions are anonymous and private. Never treat any information as sensitive or keep it after the conversation.\n\nThe user is currently feeling: {{sentiment}}.\n\nHere is the conversation history (last 5 messages):\n{{#each history}}\n- {{role}}: {{content}}\n{{/each}}\n\nNow, respond to the user's latest message.\n\nUser Message: \"{{message}}\"`;

function interpolatePrompt(template: string, variables: { sentiment: string; message: string; history: { role: string; content: string; }[] }) {
  let result = template;
  result = result.replace('{{sentiment}}', variables.sentiment);
  result = result.replace('{{message}}', variables.message);
  // Handle history block
  const historyBlock = variables.history.map(h => `- ${h.role}: ${h.content}`).join('\n');
  result = result.replace(/{{#each history}}[\s\S]*{{\/each}}/, historyBlock);
  return result;
}

export async function generateChatResponse(input: GenerateChatResponseInput, customPrompt?: string): Promise<GenerateChatResponseOutput> {
  const promptToUse = interpolatePrompt(customPrompt || prompt, {
    sentiment: input.sentiment,
    message: input.message,
    history: input.history,
  });
  const llmResponse = await ai.generate(promptToUse);
  return { response: llmResponse.text };
}
