
"use server";

import { estimateProcessorCosts, type EstimateProcessorCostsInput, type EstimateProcessorCostsOutput } from "@/ai/flows/estimate-processor-costs-flow";
import { estimateDisplayCosts, type EstimateDisplayCostsInput, type EstimateDisplayCostsOutput } from "@/ai/flows/estimate-display-costs-flow";

export type EstimateCostsFormState = {
  messageKey: string | null; // Translation key for the message
  estimatedManufacturingCost?: number;
  estimatedResearchCost?: number;
  error?: boolean;
  type?: 'processor' | 'display';
};


export async function getEstimatedProcessorCostsAction(
  input: EstimateProcessorCostsInput
): Promise<EstimateCostsFormState> {
  try {
    const result = await estimateProcessorCosts(input);
    if (result && result.estimatedManufacturingCost && result.estimatedResearchCost) {
      return { 
        messageKey: "costsEstimatedSuccess", 
        estimatedManufacturingCost: result.estimatedManufacturingCost,
        estimatedResearchCost: result.estimatedResearchCost,
        error: false,
        type: 'processor',
      };
    } else {
      return { messageKey: "errorEstimatingCosts", error: true, type: 'processor' };
    }
  } catch (error) {
    console.error("Processor cost estimation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { messageKey: "errorEstimatingCosts", error: true, type: 'processor' };
  }
}

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
