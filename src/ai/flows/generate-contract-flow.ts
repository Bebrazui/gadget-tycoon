
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
import type { ClientContract, RequiredSpecs } from '@/lib/types'; // Assuming ClientContract is defined in types

const GenerateClientContractInputSchema = z.object({
  // Future inputs: player reputation, current market conditions, etc.
  // For now, no specific inputs are needed to generate a varied contract.
  playerReputation: z.number().optional().describe("Optional player's brand reputation score (-10 to 10), to potentially influence contract difficulty/reward."),
});
export type GenerateClientContractInput = z.infer<typeof GenerateClientContractInputSchema>;

// Define Zod schema for RequiredSpecs first
const RequiredSpecsSchema = z.object({
  minRam: z.number().optional().describe("Minimum RAM in GB. e.g., 8"),
  maxRam: z.number().optional().describe("Maximum RAM in GB. e.g., 12"),
  minStorage: z.number().optional().describe("Minimum storage in GB. e.g., 128"),
  maxStorage: z.number().optional().describe("Maximum storage in GB. e.g., 256"),
  minCameraMP: z.number().optional().describe("Minimum main camera resolution in MP. e.g., 48"),
  maxCameraMP: z.number().optional().describe("Maximum main camera resolution in MP. e.g., 108"),
  minBattery: z.number().optional().describe("Minimum battery capacity in mAh. e.g., 4000"),
  maxBattery: z.number().optional().describe("Maximum battery capacity in mAh. e.g., 5000"),
  specificMaterial: z.string().optional().describe("Specific material required. Use values like 'aluminum', 'plastic', 'glass_premium', 'titanium'. Refer to MATERIAL_OPTIONS in types.ts."),
  specificProcessor: z.string().optional().describe("Specific processor model. Use values like 'snapdragon_8_gen_2', 'dimensity_1080'. Refer to PROCESSOR_OPTIONS in types.ts."),
  specificDisplayType: z.string().optional().describe("Specific display type. Use values like 'oled_fhd', 'ltpo_oled_qhd'. Refer to DISPLAY_OPTIONS in types.ts."),
  mustHaveNFC: z.boolean().optional().describe("Whether NFC support is mandatory."),
  mustHaveOIS: z.boolean().optional().describe("Whether Optical Image Stabilization is mandatory for the main camera."),
  minScreenSize: z.number().optional().describe("Minimum screen size in inches. e.g., 6.1"),
  maxScreenSize: z.number().optional().describe("Maximum screen size in inches. e.g., 6.7"),
  specificColor: z.string().optional().describe("A specific color hex code (e.g., '#000000') or a color name like 'Midnight Black'. If named, try to match COLOR_OPTIONS."),
  maxUnitCost: z.number().optional().describe("Maximum allowed manufacturing cost per unit for the phone. e.g., 300 (USD)"),
  targetOs: z.string().optional().describe("Target operating system. Use values like 'stock_android', 'custom_android_lite'. Refer to OPERATING_SYSTEM_OPTIONS in types.ts.")
}).describe("Object detailing specific requirements for the phone. Only include 3-5 actual requirements, leaving others undefined. Ensure values are reasonable for a phone.");

const ClientContractSchema = z.object({
  id: z.string().uuid().describe("A unique UUID for the contract."),
  clientName: z.string().describe("A plausible-sounding fictional company name (e.g., 'Innovate Solutions Ltd.', 'EcoTech Mobility', 'Stark Industries - Mobile Division')."),
  contractTitle: z.string().describe("A concise title for the contract (e.g., 'Bulk Order for Field Agents', 'Custom Device for Creative Professionals', 'Eco-Friendly Smartphone Initiative')."),
  brief: z.string().describe("A short (2-3 sentences) client brief explaining the need or purpose of the custom phones."),
  requiredSpecs: RequiredSpecsSchema,
  quantity: z.number().int().min(50).max(500).describe("Number of units required, typically between 50 and 500."),
  rewardFlatBonus: z.number().int().min(1000).max(10000).describe("A flat bonus amount (e.g., 1000 to 10000 USD) awarded upon successful completion of the contract, on top of unit sales price if applicable."),
  penaltyFlat: z.number().int().min(500).max(5000).describe("A flat penalty amount (e.g., 500 to 5000 USD) if the contract fails due to unmet specs or missed deadline."),
  deadlineDays: z.number().int().min(5).max(20).describe("Deadline in 'market days' (simulated game days) from the moment the contract is accepted, typically 5-20 days."),
  status: z.enum(['available']).default('available').describe("Initial status, always 'available'.")
});
export type { ClientContract }; // Export the inferred Zod type directly if preferred

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
