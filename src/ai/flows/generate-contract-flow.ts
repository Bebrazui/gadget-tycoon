
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
} from '@/lib/types'; 


// Wrapper function to be called from server actions
export async function generateClientContract(input?: GenerateClientContractInput): Promise<ClientContract> {
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
- Specify **between 3 and 5 key requirements** in the 'requiredSpecs' object. Leave other spec fields undefined.
  - For 'specificMaterial', 'specificProcessor', 'specificDisplayType', and 'targetOs', if you include them, choose reasonable values that exist in typical phone manufacturing (e.g., material: 'aluminum', processor: 'snapdragon_7_gen_1', display: 'oled_fhd', os: 'stock_android').
  - For numeric specs (RAM, storage, camera, battery, screen size, maxUnitCost), provide realistic values.
  - For boolean specs (NFC, OIS), set them if they are part of the key requirements.
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
    const { output } = await contractPrompt(input); 
    if (!output || Object.keys(output.requiredSpecs || {}).length === 0) {
      // Fallback if AI fails or returns empty specs
      const fallbackClientNames = ["Tech Solutions Inc.", "Global Innovations Co.", "Future Gadgets Ltd.", "Pioneer Devices Corp."];
      const fallbackTitles = ["Standard Device Order", "Bulk Smartphone Request", "Urgent Tech Procurement", "Employee Handset Upgrade"];
      const fallbackBriefs = [
        "We require a batch of reliable smartphones for our expanding field team.",
        "Looking for a cost-effective yet capable device for a new product line.",
        "Need modern handsets for our enterprise clients with specific security features.",
        "A custom phone order to equip our new hires with essential communication tools."
      ];
      const fallbackSpecs: ClientContract['requiredSpecs'][] = [
        { minRam: 6, maxUnitCost: 200, mustHaveNFC: true },
        { specificMaterial: 'aluminum', minBattery: 4000, minStorage: 128 },
        { targetOs: 'stock_android', minCameraMP: 48, maxUnitCost: 300 },
        { specificProcessor: 'snapdragon_7_gen_1', minScreenSize: 6.0 },
      ];
      const randomSpec = fallbackSpecs[Math.floor(Math.random() * fallbackSpecs.length)];

      return {
        id: crypto.randomUUID(),
        clientName: fallbackClientNames[Math.floor(Math.random() * fallbackClientNames.length)],
        contractTitle: fallbackTitles[Math.floor(Math.random() * fallbackTitles.length)],
        brief: fallbackBriefs[Math.floor(Math.random() * fallbackBriefs.length)],
        requiredSpecs: randomSpec,
        quantity: Math.floor(Math.random() * (450 - 50 + 1)) + 50, // 50-500
        rewardFlatBonus: Math.floor(Math.random() * (9000 - 1000 + 1)) + 1000, // 1000-10000
        penaltyFlat: Math.floor(Math.random() * (4500 - 500 + 1)) + 500, // 500-5000
        deadlineDays: Math.floor(Math.random() * (15 - 5 + 1)) + 5, // 5-20
        status: 'available',
      };
    }
    
    if (!output.id || !z.string().uuid().safeParse(output.id).success) {
        output.id = crypto.randomUUID();
    }
    output.status = 'available'; 
    return output;
  }
);
