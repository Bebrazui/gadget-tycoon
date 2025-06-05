
"use server";

import { generateClientContract, type GenerateClientContractInput } from "@/ai/flows/generate-contract-flow";
import type { ClientContract } from '@/lib/types';

export async function fetchNewClientContractAction(
  // input?: GenerateClientContractInput // Input can be added later
): Promise<ClientContract | null> {
  try {
    // For now, passing an empty object as input, or specific parameters if needed by the flow
    const contract = await generateClientContract({}); 
    return contract;
  } catch (error) {
    console.error("Error fetching new client contract via action:", error);
    // In a real app, you might want to throw a more specific error or return a structured error response
    return null; 
  }
}
