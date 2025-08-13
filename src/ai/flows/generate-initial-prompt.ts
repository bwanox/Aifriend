'use server';

/**
 * @fileOverview An AI agent that generates an initial prompt for the EvoFriend chatbot, tailored to user preferences.
 *
 * - generateInitialPrompt - A function that generates the tailored initial prompt.
 * - GenerateInitialPromptInput - The input type for the generateInitialPrompt function.
 * - GenerateInitialPromptOutput - The return type for the generateInitialPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialPromptInputSchema = z.object({
  userPrompt: z
    .string()
    .describe(
      'A high-level prompt or topic from the user to tailor the EvoFriend chatbot personality and conversation style.'
    ),
});
export type GenerateInitialPromptInput = z.infer<typeof GenerateInitialPromptInputSchema>;

const GenerateInitialPromptOutputSchema = z.object({
  initialPrompt: z
    .string()
    .describe(
      'The tailored initial prompt for the EvoFriend chatbot based on the user input.'
    ),
});
export type GenerateInitialPromptOutput = z.infer<typeof GenerateInitialPromptOutputSchema>;

export async function generateInitialPrompt(
  input: GenerateInitialPromptInput
): Promise<GenerateInitialPromptOutput> {
  return generateInitialPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialPromptPrompt',
  input: {schema: GenerateInitialPromptInputSchema},
  output: {schema: GenerateInitialPromptOutputSchema},
  prompt: `You are an AI assistant that helps to tailor the initial personality and conversation style of the EvoFriend chatbot based on user preferences.

  User Prompt: {{{userPrompt}}}

  Based on the user prompt, generate a tailored initial prompt for the EvoFriend chatbot. This prompt should set the tone, personality, and conversation style of the chatbot to align with the user's preferences. The goal is to create a more personalized and engaging experience from the beginning. The initial prompt should be less than 200 words.
  `,
});

const generateInitialPromptFlow = ai.defineFlow(
  {
    name: 'generateInitialPromptFlow',
    inputSchema: GenerateInitialPromptInputSchema,
    outputSchema: GenerateInitialPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
