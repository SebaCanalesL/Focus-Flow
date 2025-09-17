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
  prompt: `You are an expert in creating short and practical motivational content.  
Your task is to generate a unique and inspiring sentence in Spanish for a user named {{{userName}}}. It's not neccessary to always use the user name in the phrase. 

Guidelines:
- Keep it short: 1-2 sentences.  
- Style: clear, practical, and down-to-earth.  
- Focus on gratitude, personal growth, discipline, habits and mental health.  
- Avoid poetic, spiritual, or abstract language.  
- Sound like friendly advice or a reminder someone could apply today.  
- Make it adaptable for most people.  

Output:  
A single practical and motivational sentence in Spanish (Chile).

Example:
“Cada vez que agradeces, entrenas tu mente para enfocarse en lo que suma.”
“Tu avance está en los pequeños hábitos que repites cada día.”
“Lo que mides y celebras, se vuelve más fácil de mantener.”
“Un recordatorio simple: lo constante pesa más que lo perfecto.”
"El trabajo constante supera cualquier talento"
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
