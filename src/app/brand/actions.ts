
"use server";

import { generateBrandSlogans, type GenerateBrandSlogansInput, type GenerateBrandSlogansOutput } from "@/ai/flows/generate-brand-slogan-flow";
import type { Brand } from '@/lib/types';

export type GenerateSlogansFormState = {
  message: string | null;
  slogans?: string[];
  error?: boolean;
};

export async function getBrandSlogansAction(
  brandDetails: Brand
): Promise<GenerateSlogansFormState> {
  if (!brandDetails.name || !brandDetails.logoDescription || !brandDetails.marketingStrategy) {
    return { message: "Brand details are incomplete. Please fill out the brand form.", error: true };
  }

  try {
    const input: GenerateBrandSlogansInput = {
      brandName: brandDetails.name,
      logoDescription: brandDetails.logoDescription,
      marketingStrategy: brandDetails.marketingStrategy,
    };

    const result = await generateBrandSlogans(input);
    
    if (result && result.slogans && result.slogans.length > 0) {
      return { message: "Slogans generated successfully.", slogans: result.slogans, error: false };
    } else {
      return { message: "AI did not return any slogans.", error: true, slogans: [] };
    }
  } catch (error) {
    console.error("Slogan generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { message: `An error occurred while generating slogans: ${errorMessage}`, error: true };
  }
}
