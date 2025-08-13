
'use server';

import { ai } from '@/ai/genkit';
import {
  type GenerateChatResponseInput,
  type GenerateChatResponseOutput,
  GenerateChatResponseInputSchema,
} from '@/lib/ai-types';

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
    output: {
        schema: GenerateChatResponseInputSchema,
    }
  });

  return { response: llmResponse.text };
}
