
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

const EnhanceEventDetailsInputSchema = z.object({
  currentText: z.string().describe("The current text of the event title or description provided by the user."),
  enhancementType: z.enum(['title', 'description']).describe("Specifies whether to enhance a 'title' or a 'description'."),
  contextText: z.string().optional().describe("Optional context, e.g., the event title if enhancing the description, or vice-versa."),
});
export type EnhanceEventDetailsInput = z.infer<typeof EnhanceEventDetailsInputSchema>;

const EnhanceEventDetailsOutputSchema = z.object({
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
  prompt: `You are a helpful AI buddy for Siyar, a timeline app designed for students to keep track of their academic and social stuff with a clear, no-nonsense (but still cool) neo-brutalist vibe.
The user is creating/editing an event and needs some ideas for the '{{enhancementType}}'.

Current {{enhancementType}}: "{{currentText}}"
{{#if contextText}}
Relevant context (e.g., the other field like title or description): "{{contextText}}"
{{/if}}

Give 2-3 distinct and helpful suggestions for the {{enhancementType}}. Keep it pretty casual and straightforward.

If enhancing a 'title':
- Make it clear and to the point, but it can be a bit informal or even catchy.
- Think about what would make sense to a friend or classmate.
- Avoid overly corporate or stiff language. Humor is okay if it fits!

If enhancing a 'description':
- If it's just a few words, flesh it out a bit so it's actually useful. Bullet points are cool if it makes sense.
- If it's already long, see if you can make it snappier or highlight the main points.
- Keep the tone friendly and easy to understand.
- If the input looks like a list, try to keep that vibe.
- Make sure it gives the key info needed for the event.

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

