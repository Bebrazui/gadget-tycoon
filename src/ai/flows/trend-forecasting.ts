// Trend forecasting flow
'use server';

/**
 * @fileOverview Trend forecasting AI agent.
 *
 * - trendForecasting - A function that handles the trend forecasting process.
 * - TrendForecastingInput - The input type for the trendForecasting function.
 * - TrendForecastingOutput - The return type for the trendForecasting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrendForecastingInputSchema = z.object({
  marketData: z.string().describe('The current market data for phones.'),
  competitorDevices: z.string().describe('Details of competitor devices.'),
  componentCosts: z.string().describe('The costs of various phone components.'),
  socialMediaBuzz: z.string().describe('The current social media buzz regarding phones.'),
});
export type TrendForecastingInput = z.infer<typeof TrendForecastingInputSchema>;

const TrendForecastingOutputSchema = z.object({
  trends: z.array(
    z.object({
      feature: z.string().describe('The phone feature or technology.'),
      popularityRank: z.number().describe('The rank of the feature based on popularity.'),
      hotOrNot: z.string().describe('Whether the feature is considered hot or not.'),
    })
  ).describe('A ranked list of phone features and technologies based on popularity.'),
});
export type TrendForecastingOutput = z.infer<typeof TrendForecastingOutputSchema>;

export async function trendForecasting(input: TrendForecastingInput): Promise<TrendForecastingOutput> {
  return trendForecastingFlow(input);
}

const trendForecastingPrompt = ai.definePrompt({
  name: 'trendForecastingPrompt',
  input: {schema: TrendForecastingInputSchema},
  output: {schema: TrendForecastingOutputSchema},
  prompt: `You are an AI trend forecaster for mobile phone technology. Analyze the provided data to predict popular phone features and technologies.

Market Data: {{{marketData}}}
Competitor Devices: {{{competitorDevices}}}
Component Costs: {{{componentCosts}}}
Social Media Buzz: {{{socialMediaBuzz}}}

Based on this information, provide a ranked list of phone features and technologies, indicating their popularity and whether they are considered "hot" or "not".`,
});

const trendForecastingFlow = ai.defineFlow(
  {
    name: 'trendForecastingFlow',
    inputSchema: TrendForecastingInputSchema,
    outputSchema: TrendForecastingOutputSchema,
  },
  async input => {
    const {output} = await trendForecastingPrompt(input);
    return output!;
  }
);
