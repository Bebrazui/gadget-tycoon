
"use server";

import { trendForecasting, type TrendForecastingInput, type TrendForecastingOutput } from "@/ai/flows/trend-forecasting";
import { z } from "zod";

const TrendForecastingFormSchema = z.object({
  marketData: z.string().min(10, "Market data must be at least 10 characters."), // Keep English for Zod errors, or use a complex i18n setup for Zod
  competitorDevices: z.string().min(10, "Competitor devices information must be at least 10 characters."),
  componentCosts: z.string().min(10, "Component costs information must be at least 10 characters."),
  socialMediaBuzz: z.string().min(10, "Social media buzz must be at least 10 characters."),
});

export type TrendForecastingFormState = {
  message: string | null; // These messages will be keys for translation on client
  errors?: {
    marketData?: string[];
    competitorDevices?: string[];
    componentCosts?: string[];
    socialMediaBuzz?: string[];
  };
  trends?: TrendForecastingOutput["trends"];
};

export async function getTrendForecast(
  prevState: TrendForecastingFormState,
  formData: FormData
): Promise<TrendForecastingFormState> {
  const validatedFields = TrendForecastingFormSchema.safeParse({
    marketData: formData.get("marketData"),
    competitorDevices: formData.get("competitorDevices"),
    componentCosts: formData.get("componentCosts"),
    socialMediaBuzz: formData.get("socialMediaBuzz"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check your inputs.", // This will be translated on client-side e.g. t('validation_failed')
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const input: TrendForecastingInput = validatedFields.data;
    const result = await trendForecasting(input);
    
    if (result && result.trends) {
      return { message: "Trends forecasted successfully.", trends: result.trends }; // t('trends_success')
    } else {
      return { message: "AI did not return valid trend data." }; // t('trends_no_data')
    }
  } catch (error) {
    console.error("Trend forecasting error:", error);
    return { message: "An error occurred while forecasting trends. Please try again." }; // t('trends_error')
  }
}
