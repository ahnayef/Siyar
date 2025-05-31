
'use server';
/**
 * @fileOverview An AI flow to enhance event titles and descriptions.
 *
 * - enhanceEventDetails - A function that suggests improvements for event titles or descriptions.
 * - EnhanceEventDetailsInput - The input type for the enhanceEventDetails function.
 * - EnhanceEventDetailsOutput - The return type for the enhanceEventDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const EnhanceEventDetailsInputSchema = z.object({
  currentText: z.string().describe("The current text of the event title or description provided by the user."),
  enhancementType: z.enum(['title', 'description']).describe("Specifies whether to enhance a 'title' or a 'description'."),
  contextText: z.string().optional().describe("Optional context, e.g., the event title if enhancing the description, or vice-versa."),
});
export type EnhanceEventDetailsInput = z.infer<typeof EnhanceEventDetailsInputSchema>;

export const EnhanceEventDetailsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe("An array of 2 to 3 suggested text improvements. Each suggestion should be distinct."),
});
export type EnhanceEventDetailsOutput = z.infer<typeof EnhanceEventDetailsOutputSchema>;

export async function enhanceEventDetails(input: EnhanceEventDetailsInput): Promise<EnhanceEventDetailsOutput> {
  return enhanceEventDetailsFlow(input);
}

const enhanceEventPrompt = ai.definePrompt({
  name: 'enhanceEventPrompt',
  input: {schema: EnhanceEventDetailsInputSchema},
  output: {schema: EnhanceEventDetailsOutputSchema},
  prompt: `You are an AI assistant for ChronoFlow, a timeline management app emphasizing neo-brutalist clarity and focused organization.
The user is creating/editing an event and needs help refining the '{{enhancementType}}'.

Current {{enhancementType}}: "{{currentText}}"
{{#if contextText}}
Relevant context (e.g., the other field like title or description): "{{contextText}}"
{{/if}}

Please provide 2-3 distinct suggestions for the {{enhancementType}}.

If enhancing a 'title':
- Make it clear, concise, and impactful.
- It should be easily scannable.
- Aim for a professional yet straightforward tone. Avoid jargon unless highly relevant to the context.

If enhancing a 'description':
- If the current description is short or just keywords, expand it into clear sentences or bullet points.
- If it's already long, try to make it more concise, better structured, or highlight key information.
- Maintain a professional, clear, and focused tone.
- If the input hints at bullet points (e.g., uses dashes or lists items), try to preserve or formalize that structure.
- Ensure the description is informative and adds value to the event.

Return your suggestions as an array of strings.
`,
});

const enhanceEventDetailsFlow = ai.defineFlow(
  {
    name: 'enhanceEventDetailsFlow',
    inputSchema: EnhanceEventDetailsInputSchema,
    outputSchema: EnhanceEventDetailsOutputSchema,
  },
  async (input) => {
    const {output} = await enhanceEventPrompt(input);
    if (!output || !output.suggestions || output.suggestions.length === 0) {
      return { suggestions: ["Could not generate suggestions at this time."] };
    }
    return output;
  }
);
