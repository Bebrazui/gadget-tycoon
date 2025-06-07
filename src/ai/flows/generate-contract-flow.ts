
'use server';
/**
 * @fileOverview Generates a fictional client contract for a custom phone manufacturing order.
 *
 * - generateClientContract - A function that returns details for a new client contract.
 * - GenerateClientContractInput - The input type (currently empty).
 * - ClientContract - The output type representing the contract details.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
    GenerateClientContractInputSchema, 
    type GenerateClientContractInput,
    ClientContractSchema,
    type ClientContract
} from '@/lib/types'; // ClientContract type is also defined in lib/types


// Wrapper function to be called from server actions
export async function generateClientContract(input?: GenerateClientContractInput): Promise<ClientContract> {
  // The 'input' parameter is passed to the flow, but currently the prompt doesn't use it.
  // It's included for future expansion.
  return generateClientContractFlow(input || {});
}

const contractPrompt = ai.definePrompt({
  name: 'generateClientContractPrompt',
  input: { schema: GenerateClientContractInputSchema },
  output: { schema: ClientContractSchema },
  prompt: `You are a procurement manager for various fictional companies, creating requests for custom phone manufacturing.
Generate a realistic and interesting contract proposal for a new batch of custom smartphones.

Follow these guidelines:
- Create a plausible but fictional client company name.
- Write a concise contract title and a 2-3 sentence brief explaining their needs.
- Specify **only 3 to 5 key requirements** in the 'requiredSpecs' object. Leave other spec fields undefined.
  - For 'specificMaterial', 'specificProcessor', 'specificDisplayType', and 'targetOs', if you include them, choose reasonable values that exist in typical phone manufacturing (e.g., material: 'aluminum', processor: 'snapdragon_7_gen_1', display: 'oled_fhd', os: 'stock_android').
  - For numeric specs (RAM, storage, camera, battery, screen size, maxUnitCost), provide realistic values.
  - For boolean specs (NFC, OIS), set them if they are part of the 3-5 key requirements.
- Set a reasonable quantity (50-500 units).
- Set a reward (1000-10000 USD bonus) and a penalty (500-5000 USD).
- Set a deadline (5-20 market days).
- The 'id' should be a unique UUID.
- The 'status' must be 'available'.

Example for requiredSpecs (remember to only include 3-5):
"requiredSpecs": {
  "minRam": 8,
  "specificMaterial": "aluminum",
  "maxUnitCost": 250,
  "mustHaveNFC": true
}

Ensure the entire output strictly adheres to the ClientContractSchema.
If playerReputation is provided (e.g., {{playerReputation}}), you can subtly adjust the contract's demands or rewards, but it's not mandatory for this version.
`,
});


const generateClientContractFlow = ai.defineFlow(
  {
    name: 'generateClientContractFlow',
    inputSchema: GenerateClientContractInputSchema,
    outputSchema: ClientContractSchema,
  },
  async (input) => {
    const { output } = await contractPrompt(input); // Pass the input to the prompt
    if (!output) {
      // Fallback if AI fails (should be rare with good prompting and schema)
      // This fallback should also conform to ClientContractSchema
      return {
        id: crypto.randomUUID(),
        clientName: "Fallback Client Inc.",
        contractTitle: "Standard Device Order",
        brief: "A standard order due to an AI generation issue.",
        requiredSpecs: { minRam: 4, maxUnitCost: 150 },
        quantity: 100,
        rewardFlatBonus: 1000,
        penaltyFlat: 500,
        deadlineDays: 10,
        status: 'available',
      };
    }
    // Ensure the ID is a UUID if not already provided by the LLM, or if the LLM struggles with it
    if (!output.id || !z.string().uuid().safeParse(output.id).success) {
        output.id = crypto.randomUUID();
    }
    output.status = 'available'; // Ensure status is always 'available'
    return output;
  }
);

    