'use server';
/**
 * @fileOverview A flow for generating daily motivational quotes.
 *
 * - dailyMotivation - A function that generates a personalized motivational quote.
 * - DailyMotivationInput - The input type for the dailyMotivation function.
 * - DailyMotivationOutput - The return type for the dailyMotivation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const DailyMotivationInputSchema = z.object({
  userName: z.string().describe('The name of the user to personalize the quote for.'),
});
export type DailyMotivationInput = z.infer<typeof DailyMotivationInputSchema>;

const DailyMotivationOutputSchema = z.object({
  quote: z.string().describe('The motivational quote.'),
});
export type DailyMotivationOutput = z.infer<typeof DailyMotivationOutputSchema>;

export async function dailyMotivation(input: DailyMotivationInput): Promise<DailyMotivationOutput> {
  return dailyMotivationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyMotivationPrompt',
  input: {schema: DailyMotivationInputSchema},
  output: {schema: DailyMotivationOutputSchema},
  prompt: `You are an expert in creating positive and motivational content.
Your task is to generate a short, unique, and inspiring motivational quote in Spanish for a user named {{{userName}}}.
The quote should be related to gratitude, personal growth, or well-being.
Avoid clichés and create something that feels fresh and personal.
The response must be in Spanish.

Example:
"{{{userName}}}, que tu día esté lleno de pequeñas alegrías que te recuerden lo mucho que vales."
`,
});

const dailyMotivationFlow = ai.defineFlow(
  {
    name: 'dailyMotivationFlow',
    inputSchema: DailyMotivationInputSchema,
    outputSchema: DailyMotivationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
