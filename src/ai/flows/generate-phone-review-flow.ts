
'use server';
/**
 * @fileOverview Generates a review for a phone based on its specifications.
 *
 * - generatePhoneReview - A function that takes phone details and returns an AI-generated review.
 * - GeneratePhoneReviewInput - The input type for the generatePhoneReview function.
 * - GeneratePhoneReviewOutput - The return type for the generatePhoneReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { PhoneDesign } from '@/lib/types'; // Assuming PhoneDesign might be useful for context

// Simplified input for the review, focusing on key aspects
const GeneratePhoneReviewInputSchema = z.object({
  phoneName: z.string().describe('The name of the phone model.'),
  processor: z.string().describe('The processor model.'),
  displayType: z.string().describe('The type of display technology used (e.g., OLED, LCD).'),
  ram: z.number().describe('The amount of RAM in GB.'),
  storage: z.number().describe('The amount of storage in GB.'),
  cameraResolution: z.number().describe('The main camera resolution in MP.'),
  batteryCapacity: z.number().describe('The battery capacity in mAh.'),
  material: z.string().describe('The primary material used for the phone body (e.g., Aluminum, Plastic).'),
  specialFeatures: z.array(z.string()).describe('A list of notable special features (e.g., High Refresh Rate, NFC, Water Resistance).'),
  estimatedCost: z.number().describe('The estimated manufacturing cost of the phone.'),
});
export type GeneratePhoneReviewInput = z.infer<typeof GeneratePhoneReviewInputSchema>;

const GeneratePhoneReviewOutputSchema = z.object({
  reviewText: z.string().describe('A concise and engaging review of the phone, highlighting pros, cons, and overall impression. Aim for 3-5 sentences.'),
  pros: z.array(z.string()).describe('A list of positive aspects of the phone.'),
  cons: z.array(z.string()).describe('A list of negative aspects or areas for improvement.'),
  overallSentiment: z.enum(["Positive", "Neutral", "Negative"]).describe("The overall sentiment of the review."),
});
export type GeneratePhoneReviewOutput = z.infer<typeof GeneratePhoneReviewOutputSchema>;

export async function generatePhoneReview(input: GeneratePhoneReviewInput): Promise<GeneratePhoneReviewOutput> {
  return generatePhoneReviewFlow(input);
}

const reviewPrompt = ai.definePrompt({
  name: 'generatePhoneReviewPrompt',
  input: {schema: GeneratePhoneReviewInputSchema},
  output: {schema: GeneratePhoneReviewOutputSchema},
  prompt: `You are a witty and insightful tech reviewer, known for your balanced and slightly humorous reviews.
Generate a review for a new phone called "{{phoneName}}".

Here are its key specifications:
- Processor: {{{processor}}}
- Display: {{{displayType}}}
- RAM: {{{ram}}}GB
- Storage: {{{storage}}}GB
- Main Camera: {{{cameraResolution}}}MP
- Battery: {{{batteryCapacity}}}mAh
- Body Material: {{{material}}}
- Estimated Cost: \${{{estimatedCost}}}
{{#if specialFeatures.length}}
- Special Features:
  {{#each specialFeatures}}
  - {{{this}}}
  {{/each}}
{{/if}}

Based on these specs and its estimated cost, write a review.
Your review should include:
1.  A short, engaging "reviewText" (3-5 sentences) summarizing the phone.
2.  A list of "pros".
3.  A list of "cons".
4.  An "overallSentiment" (Positive, Neutral, or Negative).

Consider the balance of features against the estimated cost. Be honest but entertaining.
For example, if it's a budget phone, praise its value if the specs are decent for the price, or point out shortcomings if it's overpriced for what it offers.
If it's a high-end phone, expectations are higher.
Keep the reviewText concise and punchy.
The pros and cons should be specific to the provided specs.
`,
});

const generatePhoneReviewFlow = ai.defineFlow(
  {
    name: 'generatePhoneReviewFlow',
    inputSchema: GeneratePhoneReviewInputSchema,
    outputSchema: GeneratePhoneReviewOutputSchema,
  },
  async (input) => {
    const {output} = await reviewPrompt(input);
    if (!output) {
        throw new Error("AI did not return valid review data.");
    }
    return output;
  }
);
