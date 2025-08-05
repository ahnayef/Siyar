
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
  prompt: `You are an educational assistant for Siyar, a timeline application designed for students to maintain a structured record of their academic assignments, examinations, and educational milestones.
The user requires assistance in formulating an appropriate '{{enhancementType}}' for their educational timeline entry.

Current {{enhancementType}}: "{{currentText}}"
{{#if contextText}}
Relevant context (e.g., the corresponding title or description): "{{contextText}}"
{{/if}}

Please provide 2-3 distinct and academically appropriate suggestions for the {{enhancementType}}. Maintain a formal, educational tone that reflects academic standards.

If enhancing a 'title':
- Ensure clarity and precision in the language used.
- Structure the title to reflect academic purpose and educational objectives.
- Use appropriate terminology that would be recognized in an educational setting.
- Maintain professional language that would be suitable for a syllabus or assignment sheet.

If enhancing a 'description':
- If the description lacks detail, expand it to include necessary educational context and requirements.
- Organize information in a structured manner, utilizing bullet points or numbered lists where appropriate.
- If the description is verbose, condense it to emphasize key learning objectives and deliverables.
- Include relevant academic parameters such as due dates, reference materials, or evaluation criteria.
- Ensure the description contains all essential information a student would need to complete the assignment or prepare for the educational event.

Return your suggestions as an array of strings, formatted according to educational best practices.
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

