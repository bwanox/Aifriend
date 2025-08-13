'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing the sentiment of user messages.
 *
 * It includes:
 * - analyzeUserSentiment: A function to analyze user message sentiment.
 * - AnalyzeUserSentimentInput: The input type for the analyzeUserSentiment function.
 * - AnalyzeUserSentimentOutput: The output type for the analyzeUserSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUserSentimentInputSchema = z.object({
  message: z.string().describe('The user message to analyze.'),
});
export type AnalyzeUserSentimentInput = z.infer<typeof AnalyzeUserSentimentInputSchema>;

const AnalyzeUserSentimentOutputSchema = z.object({
  sentiment: z
    .string()
    .describe(
      'The sentiment of the message (e.g., positive, negative, neutral). Provide only one word.'
    ),
  confidence: z
    .number()
    .describe('The confidence level of the sentiment analysis, from 0 to 1.'),
});
export type AnalyzeUserSentimentOutput = z.infer<typeof AnalyzeUserSentimentOutputSchema>;

export async function analyzeUserSentiment(input: AnalyzeUserSentimentInput): Promise<AnalyzeUserSentimentOutput> {
  return analyzeUserSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeUserSentimentPrompt',
  input: {schema: AnalyzeUserSentimentInputSchema},
  output: {schema: AnalyzeUserSentimentOutputSchema},
  prompt: `Analyze the sentiment of the following message:

Message: {{{message}}}

Respond with a one-word sentiment (positive, negative, or neutral) and a confidence level from 0 to 1.

Sentiment: {{sentiment}}
Confidence: {{confidence}}`,
});

const analyzeUserSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeUserSentimentFlow',
    inputSchema: AnalyzeUserSentimentInputSchema,
    outputSchema: AnalyzeUserSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
