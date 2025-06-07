
'use server';
/**
 * @fileOverview Generates brand slogans based on brand identity.
 *
 * - generateBrandSlogans - A function that takes brand details and returns slogan suggestions.
 * - GenerateBrandSlogansInput - The input type for the generateBrandSlogans function.
 * - GenerateBrandSlogansOutput - The return type for the generateBrandSlogans function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
    GenerateBrandSlogansInputSchema, 
    type GenerateBrandSlogansInput, 
    GenerateBrandSlogansOutputSchema, 
    type GenerateBrandSlogansOutput 
} from '@/lib/types';


export async function generateBrandSlogans(input: GenerateBrandSlogansInput): Promise<GenerateBrandSlogansOutput> {
  return generateBrandSlogansFlow(input);
}

const sloganPrompt = ai.definePrompt({
  name: 'generateBrandSloganPrompt',
  input: {schema: GenerateBrandSlogansInputSchema},
  output: {schema: GenerateBrandSlogansOutputSchema},
  prompt: `You are a creative branding expert specializing in crafting compelling slogans for tech companies.
A new phone company, "{{brandName}}", needs slogan ideas.

Here's information about their brand:
- Logo/Visual Concept: "{{logoDescription}}"
- Core Marketing Strategy: "{{marketingStrategy}}"

Based on this, generate 3-5 short, catchy, and impactful slogans that align with their brand identity.
The slogans should be suitable for a modern tech gadget company.
Focus on the essence of their marketing strategy and brand name.
Output the slogans in the "slogans" array.
`,
});

const generateBrandSlogansFlow = ai.defineFlow(
  {
    name: 'generateBrandSlogansFlow',
    inputSchema: GenerateBrandSlogansInputSchema,
    outputSchema: GenerateBrandSlogansOutputSchema,
  },
  async (input) => {
    const {output} = await sloganPrompt(input);
    if (!output || !output.slogans || output.slogans.length === 0) {
        // Fallback if AI returns empty or invalid output
        return { slogans: ["Innovate. Inspire. Connect.", "Your World, Reimagined.", "Simply Advanced."] };
    }
    return output;
  }
);

    