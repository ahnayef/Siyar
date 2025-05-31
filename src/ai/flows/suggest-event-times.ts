'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting optimal event times based on past timeline data.
 *
 * - suggestEventTimes - A function that suggests event times based on user's past timelines.
 * - SuggestEventTimesInput - The input type for the suggestEventTimes function.
 * - SuggestEventTimesOutput - The return type for the suggestEventTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEventTimesInputSchema = z.object({
  timelineData: z
    .string()
    .describe(
      'A string containing data from the user\'s past timelines, including event titles, descriptions, due dates, and durations.'
    ),
  newEventDescription: z.string().describe('A description of the new event to schedule.'),
});
export type SuggestEventTimesInput = z.infer<typeof SuggestEventTimesInputSchema>;

const SuggestEventTimesOutputSchema = z.object({
  suggestedDate: z
    .string()
    .describe(
      'A suggested due date for the new event, formatted as an ISO 8601 date string (YYYY-MM-DD), optimized to fit the user\'s timeline structure and balance workload.'
    ),
  reasoning: z
    .string()
    .describe(
      'A brief explanation of why the suggested date is optimal, considering factors like event gaps and workload balance.'
    ),
});
export type SuggestEventTimesOutput = z.infer<typeof SuggestEventTimesOutputSchema>;

export async function suggestEventTimes(input: SuggestEventTimesInput): Promise<SuggestEventTimesOutput> {
  return suggestEventTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEventTimesPrompt',
  input: {schema: SuggestEventTimesInputSchema},
  output: {schema: SuggestEventTimesOutputSchema},
  prompt: `You are an AI assistant specialized in scheduling events within timelines.  You will be provided with data from the user\'s past timelines and a description of a new event they want to schedule.  Your goal is to suggest an optimal due date for the new event that fits well within the existing timeline structure and helps balance the user\'s workload.

Here\'s the user\'s past timeline data:
{{{timelineData}}}

Here\'s the description of the new event:
{{{newEventDescription}}}

Consider the gaps between existing events, the typical duration of events in the user\'s timelines, and any patterns in their workload.  Suggest a date that minimizes stress and maximizes productivity.

Respond with a JSON object containing the \"suggestedDate\" (YYYY-MM-DD) and a brief \"reasoning\" explaining your choice.
`,
});

const suggestEventTimesFlow = ai.defineFlow(
  {
    name: 'suggestEventTimesFlow',
    inputSchema: SuggestEventTimesInputSchema,
    outputSchema: SuggestEventTimesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
