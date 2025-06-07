
"use server";

import { generatePhoneReview, type GeneratePhoneReviewInput, type GeneratePhoneReviewOutput } from "@/ai/flows/generate-phone-review-flow";
import type { PhoneDesign, CustomProcessor } from "@/lib/types";
import {
    PROCESSOR_OPTIONS, DISPLAY_OPTIONS, MATERIAL_OPTIONS,
    REFRESH_RATE_OPTIONS, WATER_RESISTANCE_OPTIONS,
    TELEPHOTO_ZOOM_OPTIONS, VIDEO_RESOLUTION_OPTIONS,
    LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY
} from '@/lib/types';

export type GenerateReviewFormState = {
  message: string | null;
  review?: GeneratePhoneReviewOutput;
  error?: boolean;
};

// This function is for the AI design review, it uses unitManufacturingCost
export async function getPhoneDesignReview(
  phoneDetails: Omit<PhoneDesign, 'id' | 'productionQuantity' | 'currentStock' | 'imageUrl' | 'salePrice' | 'quantityListedForSale'> & {unitManufacturingCost: number}
): Promise<GenerateReviewFormState> {
  try {
    const specialFeatures: string[] = [];
    if (phoneDetails.nfcSupport) specialFeatures.push("NFC Support");
    if (phoneDetails.hasOIS) specialFeatures.push("Optical Image Stabilization (OIS)");

    const refreshRateLabel = REFRESH_RATE_OPTIONS.options?.find(opt => opt.value === phoneDetails.refreshRate)?.label;
    if (refreshRateLabel && phoneDetails.refreshRate !== REFRESH_RATE_OPTIONS.options?.[0].value) specialFeatures.push(refreshRateLabel);

    const waterResistanceLabel = WATER_RESISTANCE_OPTIONS.options?.find(opt => opt.value === phoneDetails.waterResistance)?.label;
    if (waterResistanceLabel && phoneDetails.waterResistance !== WATER_RESISTANCE_OPTIONS.options?.[0].value) specialFeatures.push(waterResistanceLabel);

    if (phoneDetails.ultrawideCameraMP > 0) specialFeatures.push(`Ultrawide Camera: ${phoneDetails.ultrawideCameraMP}MP`);
    if (phoneDetails.telephotoCameraMP > 0) {
        const zoomLabel = TELEPHOTO_ZOOM_OPTIONS.options?.find(opt => opt.value === phoneDetails.telephotoZoom)?.label || phoneDetails.telephotoZoom;
        specialFeatures.push(`Telephoto Camera: ${phoneDetails.telephotoCameraMP}MP (${zoomLabel})`);
    }

    const videoResLabel = VIDEO_RESOLUTION_OPTIONS.options?.find(opt => opt.value === phoneDetails.videoResolution)?.label || phoneDetails.videoResolution;
    if (phoneDetails.videoResolution !== VIDEO_RESOLUTION_OPTIONS.options?.[0].value) specialFeatures.push(`Video Recording: ${videoResLabel}`);

    // The processor name is already resolved (custom or translated predefined) when calling this action
    const processorDisplayName = phoneDetails.processor;


    const input: GeneratePhoneReviewInput = {
      phoneName: phoneDetails.name,
      processor: processorDisplayName, // Already resolved name
      displayType: DISPLAY_OPTIONS.options?.find(opt => opt.value === phoneDetails.displayType)?.label || phoneDetails.displayType,
      ram: phoneDetails.ram,
      storage: phoneDetails.storage,
      cameraResolution: phoneDetails.cameraResolution, // Main Camera
      batteryCapacity: phoneDetails.batteryCapacity,
      material: MATERIAL_OPTIONS.options?.find(opt => opt.value === phoneDetails.material)?.label || phoneDetails.material,
      specialFeatures: specialFeatures,
      estimatedCost: phoneDetails.unitManufacturingCost,
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
