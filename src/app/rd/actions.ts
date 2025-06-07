
"use server";

// import { estimateProcessorCosts, type EstimateProcessorCostsInput, type EstimateProcessorCostsOutput } from "@/ai/flows/estimate-processor-costs-flow"; // Removed
import { estimateDisplayCosts, type EstimateDisplayCostsInput, type EstimateDisplayCostsOutput } from "@/ai/flows/estimate-display-costs-flow";

export type EstimateCostsFormState = {
  messageKey: string | null; // Translation key for the message
  estimatedManufacturingCost?: number;
  estimatedResearchCost?: number;
  error?: boolean;
  type?: 'processor' | 'display';
};

// Processor cost estimation is now done algorithmically on the client-side, so this action might be removed or adapted if AI estimation is ever re-introduced as an option.
// For now, it's unused for processors.

export async function getEstimatedDisplayCostsAction(
  input: EstimateDisplayCostsInput
): Promise<EstimateCostsFormState> {
  try {
    const result = await estimateDisplayCosts(input);
    if (result && result.estimatedManufacturingCost && result.estimatedResearchCost) {
      return { 
        messageKey: "costsEstimatedSuccess", 
        estimatedManufacturingCost: result.estimatedManufacturingCost,
        estimatedResearchCost: result.estimatedResearchCost,
        error: false,
        type: 'display',
      };
    } else {
      return { messageKey: "errorEstimatingCosts", error: true, type: 'display' };
    }
  } catch (error) {
    console.error("Display cost estimation error:", error);
    return { messageKey: "errorEstimatingCosts", error: true, type: 'display' };
  }
}
