
"use server";

import { generatePhoneReview, type GeneratePhoneReviewInput, type GeneratePhoneReviewOutput } from "@/ai/flows/generate-phone-review-flow";
import type { PhoneDesign } from "@/lib/types";
import { 
    PROCESSOR_OPTIONS, DISPLAY_OPTIONS, MATERIAL_OPTIONS, 
    REFRESH_RATE_OPTIONS, WATER_RESISTANCE_OPTIONS, BASE_DESIGN_ASSEMBLY_COST
} from '@/lib/types';

export type GenerateReviewFormState = {
  message: string | null;
  review?: GeneratePhoneReviewOutput;
  error?: boolean;
};

// This function is for the AI design review, it uses unitManufacturingCost
export async function getPhoneDesignReview(
  phoneDetails: Omit<PhoneDesign, 'id' | 'productionQuantity' | 'currentStock' | 'imageUrl'> & {unitManufacturingCost: number}
): Promise<GenerateReviewFormState> {
  try {
    const specialFeatures: string[] = [];
    if (phoneDetails.nfcSupport) specialFeatures.push("NFC Support");
    
    const refreshRateLabel = REFRESH_RATE_OPTIONS.options?.find(opt => opt.value === phoneDetails.refreshRate)?.label;
    if (refreshRateLabel && phoneDetails.refreshRate !== REFRESH_RATE_OPTIONS.options?.[0].value) specialFeatures.push(refreshRateLabel);
    
    const waterResistanceLabel = WATER_RESISTANCE_OPTIONS.options?.find(opt => opt.value === phoneDetails.waterResistance)?.label;
    if (waterResistanceLabel && phoneDetails.waterResistance !== WATER_RESISTANCE_OPTIONS.options?.[0].value) specialFeatures.push(waterResistanceLabel);


    const input: GeneratePhoneReviewInput = {
      phoneName: phoneDetails.name,
      processor: PROCESSOR_OPTIONS.options?.find(opt => opt.value === phoneDetails.processor)?.label || phoneDetails.processor,
      displayType: DISPLAY_OPTIONS.options?.find(opt => opt.value === phoneDetails.displayType)?.label || phoneDetails.displayType,
      ram: phoneDetails.ram,
      storage: phoneDetails.storage,
      cameraResolution: phoneDetails.cameraResolution,
      batteryCapacity: phoneDetails.batteryCapacity,
      material: MATERIAL_OPTIONS.options?.find(opt => opt.value === phoneDetails.material)?.label || phoneDetails.material,
      specialFeatures: specialFeatures,
      estimatedCost: phoneDetails.unitManufacturingCost, // Use unit cost for AI review context
    };

    const result = await generatePhoneReview(input);
    
    if (result && result.reviewText) {
      return { message: "Review generated successfully.", review: result, error: false };
    } else {
      return { message: "AI did not return valid review data.", error: true };
    }
  } catch (error) {
    console.error("Phone review generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { message: `An error occurred while generating the review: ${errorMessage}`, error: true };
  }
}
