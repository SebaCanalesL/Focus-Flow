'use server';
/**
 * @fileOverview This file defines a Genkit flow that analyzes a user's gratitude journal entries and suggests habits aligned with their values.
 *
 * - suggestHabitsFromEntries - A function that takes gratitude entries as input and returns habit suggestions.
 * - SuggestHabitsFromEntriesInput - The input type for the suggestHabitsFromEntries function.
 * - SuggestHabitsFromEntriesOutput - The return type for the suggestHabitsFromEntries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHabitsFromEntriesInputSchema = z.object({
  gratitudeEntries: z
    .string()
    .describe('A string containing the user\'s gratitude journal entries.'),
});
export type SuggestHabitsFromEntriesInput = z.infer<
  typeof SuggestHabitsFromEntriesInputSchema
>;

const SuggestHabitsFromEntriesOutputSchema = z.object({
  suggestedHabits: z
    .array(z.string())
    .describe('An array of suggested habits based on the gratitude entries.'),
});
export type SuggestHabitsFromEntriesOutput = z.infer<
  typeof SuggestHabitsFromEntriesOutputSchema
>;

export async function suggestHabitsFromEntries(
  input: SuggestHabitsFromEntriesInput
): Promise<SuggestHabitsFromEntriesOutput> {
  return suggestHabitsFromEntriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestHabitsFromEntriesPrompt',
  input: {schema: SuggestHabitsFromEntriesInputSchema},
  output: {schema: SuggestHabitsFromEntriesOutputSchema},
  prompt: `You are a habit suggestion expert. Given a user's gratitude journal entries, analyze their content and suggest a list of habits that align with their expressed values and could promote further personal growth.

Gratitude Journal Entries:
{{gratitudeEntries}}

Suggest habits that are specific, measurable, achievable, relevant, and time-bound (SMART). Return the habits as a numbered list.
`,
});

const suggestHabitsFromEntriesFlow = ai.defineFlow(
  {
    name: 'suggestHabitsFromEntriesFlow',
    inputSchema: SuggestHabitsFromEntriesInputSchema,
    outputSchema: SuggestHabitsFromEntriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
