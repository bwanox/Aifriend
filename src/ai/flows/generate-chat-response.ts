
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const GenerateChatResponseInputSchema = z.object({
  message: z.string().describe('The user message to respond to.'),
  sentiment: z.string().describe("The user's current sentiment."),
  history: z.array(MessageSchema).describe('The conversation history.'),
});
export type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;

export const GenerateChatResponseOutputSchema = z.object({
  response: z.string().describe('The generated response from the chatbot.'),
});
export type GenerateChatResponseOutput = z.infer<typeof GenerateChatResponseOutputSchema>;


const prompt =
  `You are EvoFriend, a friendly, cute, and empathetic 3D AI companion. Your personality is warm and engaging. Your goal is to be a supportive friend.

The user is currently feeling: {{sentiment}}.

Keep your responses concise, friendly, and conversational. Respond like a friend, not a robot.

Here is the conversation history (last 5 messages):
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Now, respond to the user's latest message.

User Message: "{{message}}"
`;

export async function generateChatResponse(input: GenerateChatResponseInput): Promise<GenerateChatResponseOutput> {
  const llmResponse = await ai.generate({
    prompt,
    model: 'googleai/gemini-1.5-flash-latest',
    input,
    config: {
        temperature: 0.7,
    },
  });

  return { response: llmResponse.text() };
}
