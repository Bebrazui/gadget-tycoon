
// This file is no longer used as display cost estimation is now done algorithmically
// on the client-side in src/app/rd/page.tsx.
// It's kept here for reference or if AI estimation is re-introduced as an option later.

/*
'use server';
/**
 * @fileOverview Estimates manufacturing and research costs for a custom display.
 *
 * - estimateDisplayCosts - A function that takes display specs and returns estimated costs.
 * - EstimateDisplayCostsInput - The input type.
 * - EstimateDisplayCostsOutput - The return type.
 * /

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
    EstimateDisplayCostsInputSchema,
    type EstimateDisplayCostsInput,
    EstimateDisplayCostsOutputSchema,
    type EstimateDisplayCostsOutput
} from '@/lib/types';


export async function estimateDisplayCosts(input: EstimateDisplayCostsInput): Promise<EstimateDisplayCostsOutput> {
  return estimateDisplayCostsFlow(input);
}

const displayCostPrompt = ai.definePrompt({
  name: 'estimateDisplayCostPrompt',
  input: {schema: EstimateDisplayCostsInputSchema},
  output: {schema: EstimateDisplayCostsOutputSchema},
  prompt: `You are an expert display technology cost analyst.
Based on the following custom display specifications, provide a realistic estimation for its manufacturing cost per unit and its one-time research & development (R&D) cost.

Specifications:
- Resolution Category: {{{resolutionCategory}}} (hd: 720p-like, fhd: 1080p-like, qhd: 1440p-like)
- Technology: {{{technology}}} (lcd, oled, ltpo_oled)
- Refresh Rate (Hz): {{{refreshRate}}}

Consider these factors for estimation:
- Technology: LTPO OLED is most expensive, then OLED, then LCD.
- Resolution: QHD > FHD > HD in terms of cost.
- Refresh Rate: Higher refresh rates (120Hz, 144Hz) increase cost, especially for OLED/LTPO.
- R&D cost should be higher than per-unit manufacturing cost. Manufacturing cost is for a single unit after R&D.

Provide values for 'estimatedManufacturingCost' (e.g., between 10 and 200 USD for a typical phone-sized display) and 'estimatedResearchCost' (e.g., between 500 and 50000 USD).
Ensure research cost is at least 5x the manufacturing cost.
Example: A high-end LTPO OLED QHD 120Hz display might have mfg cost of $70-$120 and R&D of $10,000-$25,000.
A basic LCD HD 60Hz display might have mfg cost of $15-$25 and R&D of $1,000-$3,000.
Use your expert judgment.
`,
});

const estimateDisplayCostsFlow = ai.defineFlow(
  {
    name: 'estimateDisplayCostsFlow',
    inputSchema: EstimateDisplayCostsInputSchema,
    outputSchema: EstimateDisplayCostsOutputSchema,
  },
  async (input) => {
    const {output} = await displayCostPrompt(input);
    if (!output || !output.estimatedManufacturingCost || !output.estimatedResearchCost) {
        console.warn("AI failed to provide display cost estimates. Using fallback values.");
        let fallbackMfgCost = 15;
        if (input.technology === 'oled') fallbackMfgCost += 20;
        if (input.technology === 'ltpo_oled') fallbackMfgCost += 40;
        if (input.resolutionCategory === 'fhd') fallbackMfgCost += 15;
        if (input.resolutionCategory === 'qhd') fallbackMfgCost += 30;
        fallbackMfgCost += (input.refreshRate - 60) / 3; // approx +10 for 90, +20 for 120

        return {
            estimatedManufacturingCost: parseFloat(Math.max(10, Math.min(200, fallbackMfgCost)).toFixed(2)),
            estimatedResearchCost: parseFloat(Math.max(500, fallbackMfgCost * 10).toFixed(2))
        };
    }

    output.estimatedManufacturingCost = Math.max(10, Math.min(300, output.estimatedManufacturingCost));
    output.estimatedResearchCost = Math.max(200, Math.min(100000, output.estimatedResearchCost));

    if (output.estimatedResearchCost < output.estimatedManufacturingCost * 3) {
        output.estimatedResearchCost = output.estimatedManufacturingCost * 5;
    }

    return {
        estimatedManufacturingCost: parseFloat(output.estimatedManufacturingCost.toFixed(2)),
        estimatedResearchCost: parseFloat(output.estimatedResearchCost.toFixed(2)),
    };
  }
);
*/
void 0; // Keep TypeScript happy with an empty file if all content is commented out
