
import { config } from 'dotenv';
config();

import '@/ai/flows/trend-forecasting.ts';
import '@/ai/flows/generate-phone-review-flow.ts';
import '@/ai/flows/generate-brand-slogan-flow.ts';
import '@/ai/flows/generate-contract-flow.ts';
// import '@/ai/flows/estimate-processor-costs-flow.ts'; // Removed as processor costs are now algorithmic
import '@/ai/flows/estimate-display-costs-flow.ts';
