"use server";

// import { estimateProcessorCosts, type EstimateProcessorCostsInput, type EstimateProcessorCostsOutput } from "@/ai/flows/estimate-processor-costs-flow"; // Removed as processor costs are now algorithmic
// import { estimateDisplayCosts, type EstimateDisplayCostsInput, type EstimateDisplayCostsOutput } from "@/ai/flows/estimate-display-costs-flow"; // Removed as display costs are now algorithmic

// This type might still be useful if other R&D actions are added, or can be removed if no server actions remain in this file.
export type EstimateCostsFormState = {
  messageKey: string | null; // Translation key for the message
  estimatedManufacturingCost?: number;
  estimatedResearchCost?: number;
  error?: boolean;
  type?: 'processor' | 'display';
};

// Since both processor and display cost estimations are now fully client-side and algorithmic,
// the server actions for these specific estimations are no longer needed.
// This file can be kept for future R&D related server actions or removed if not needed.

// If you need to keep the file structure, you can leave it empty or with just the type definition.
// For now, I'll leave the type for context, but the functions that called AI flows are removed.

// Example:
// export async function someOtherRDAction(...) { ... }
