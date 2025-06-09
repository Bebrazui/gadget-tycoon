
import { z } from 'zod';

export interface Trend {
  feature: string;
  popularityRank: number;
  hotOrNot: string;
}

export interface PhoneComponentOption {
  value: string;
  label: string; // This will often be a translation key
  cost: number;
  antutuScore?: number; // For processors
  coreCount?: number; // For processors
  clockSpeed?: number; // For processors
  // For displays (used in design page after R&D)
  resolutionCategory?: string;
  technology?: string;
  refreshRateValue?: number;
}

// --- Component Tier System ---
export interface ProcessorTierCharacteristics {
  maxAntutuScore: number;
  minCoreCount: number;
  maxCoreCount: number;
  minClockSpeed: number; // GHz
  maxClockSpeed: number; // GHz
  manufacturingCostMultiplier: number;
  baseManufacturingCostAddition: number;
}

export interface DisplayTierCharacteristics {
  allowedTechnologies: string[]; // e.g., ['lcd'], ['lcd', 'oled'], ['oled', 'ltpo_oled']
  allowedResolutionCategories: string[]; // e.g., ['hd'], ['hd', 'fhd'], ['fhd', 'qhd']
  maxRefreshRate: number; // e.g., 90, 120, 144
  manufacturingCostMultiplier: number;
  baseManufacturingCostAddition: number;
}

export interface ComponentTier {
  id: string;
  nameKey: string;
  descriptionKey: string;
  type: 'processor' | 'display';
  researchCost: number;
  requiredPlayerLevel?: number;
  xpReward: number; // XP for researching this tier
  characteristics: ProcessorTierCharacteristics | DisplayTierCharacteristics;
}

export const PROCESSOR_TIERS: ComponentTier[] = [
  {
    id: 'proc_tier_1',
    nameKey: 'processorTier1Name',
    descriptionKey: 'processorTier1Desc',
    type: 'processor',
    researchCost: 7500,
    requiredPlayerLevel: 1,
    xpReward: 150,
    characteristics: {
      maxAntutuScore: 700000,
      minCoreCount: 4,
      maxCoreCount: 8,
      minClockSpeed: 1.8,
      maxClockSpeed: 2.6,
      manufacturingCostMultiplier: 1.0,
      baseManufacturingCostAddition: 0,
    } as ProcessorTierCharacteristics,
  },
  {
    id: 'proc_tier_2',
    nameKey: 'processorTier2Name',
    descriptionKey: 'processorTier2Desc',
    type: 'processor',
    researchCost: 25000,
    requiredPlayerLevel: 3,
    xpReward: 300,
    characteristics: {
      maxAntutuScore: 1300000,
      minCoreCount: 6,
      maxCoreCount: 10,
      minClockSpeed: 2.2,
      maxClockSpeed: 3.2,
      manufacturingCostMultiplier: 1.05,
      baseManufacturingCostAddition: 10,
    } as ProcessorTierCharacteristics,
  },
];

export const DISPLAY_TIERS: ComponentTier[] = [
  {
    id: 'disp_tier_1',
    nameKey: 'displayTier1Name',
    descriptionKey: 'displayTier1Desc',
    type: 'display',
    researchCost: 4500,
    requiredPlayerLevel: 1,
    xpReward: 120,
    characteristics: {
      allowedTechnologies: ['lcd'],
      allowedResolutionCategories: ['hd', 'fhd'],
      maxRefreshRate: 90,
      manufacturingCostMultiplier: 1.0,
      baseManufacturingCostAddition: 0,
    } as DisplayTierCharacteristics,
  },
  {
    id: 'disp_tier_2',
    nameKey: 'displayTier2Name',
    descriptionKey: 'displayTier2Desc',
    type: 'display',
    researchCost: 20000,
    requiredPlayerLevel: 2,
    xpReward: 250,
    characteristics: {
      allowedTechnologies: ['lcd', 'oled'],
      allowedResolutionCategories: ['hd', 'fhd', 'qhd'],
      maxRefreshRate: 120,
      manufacturingCostMultiplier: 1.05,
      baseManufacturingCostAddition: 8,
    } as DisplayTierCharacteristics,
  },
];
// --- End Component Tier System ---

export interface CustomProcessor {
  id: string;
  name: string;
  antutuScore: number;
  coreCount: number;
  clockSpeed: number; // in GHz
  manufacturingCost: number;
  researchCost: number;
  type: 'custom_processor';
  tierId?: string; // Link to the researched tier
}

export interface CustomDisplay {
  id: string;
  name: string;
  resolutionCategory: string;
  technology: string;
  refreshRate: number;
  manufacturingCost: number;
  researchCost: number;
  type: 'custom_display';
  tierId?: string; // Link to the researched tier
}


export interface PhoneComponent {
  id: string;
  name: string; // This will often be a translation key
  type: 'processor' | 'display' | 'ram' | 'storage' | 'camera' | 'battery' | 'material' | 'screenSize' | 'refreshRate' | 'waterResistance' | 'simSlots' | 'nfc' | 'operatingSystem' | 'frontCamera' | 'ois' | 'ultrawideCamera' | 'telephotoCamera' | 'telephotoZoom' | 'videoResolution';
  options?: PhoneComponentOption[]; // For discrete choices
  range?: { min: number; max: number; step: number; unit: string }; // For continuous values
  costPerUnit?: number; // For RAM, Storage, Battery capacity
  baseCost?: number; // For boolean features like NFC, OIS
}

export type ComponentCategory = 'processor' | 'display' | 'ram' | 'storage' | 'camera' | 'battery' | 'material';

export interface PhoneDesign {
  id:string; // Unique identifier for the phone
  name: string; // User-defined name for the phone
  processor: string; // Can be a value from PROCESSOR_OPTIONS or custom_proc_<id>
  displayType: string; // Can be value from DISPLAY_OPTIONS or custom_display_<id>
  ram: number; // in GB
  storage: number; // in GB
  cameraResolution: number; // in MP for main camera
  batteryCapacity: number; // in mAh
  material: string;
  color: string;
  height: number; // in mm
  width: number; // in mm
  thickness: number; // in mm
  screenSize: number; // in inches
  refreshRate: string;
  waterResistance: string;
  simSlots: string;
  nfcSupport: boolean;
  operatingSystem: string;
  frontCameraResolution: number; // in MP

  hasOIS: boolean;
  ultrawideCameraMP: number;
  telephotoCameraMP: number;
  telephotoZoom: string;
  videoResolution: string;

  unitManufacturingCost: number;
  productionQuantity: number;
  currentStock: number;

  review?: string;
  reviewType?: 'ai' | 'local' | 'local_short';
  imageUrl?: string;

  salePrice: number;
  quantityListedForSale: number;
}

export interface Brand {
  name: string;
  logoDescription: string;
  marketingStrategy: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string; // Can be a translation key or a template like "transactionXYZ{{param:value}}"
  amount: number;
  type: 'income' | 'expense';
}

export type GameDifficulty = 'easy' | 'normal' | 'hard';

export interface GameStats {
  totalFunds: number;
  phonesSold: number;
  brandReputation: number;
  level: number;
  xp: number;
}

export interface GameSettings {
  useOnlineFeatures: boolean; // true for AI, false for local algorithms
  difficulty: GameDifficulty;
}


export interface RequiredSpecs {
  minRam?: number;
  maxRam?: number;
  minStorage?: number;
  maxStorage?: number;
  minCameraMP?: number;
  maxCameraMP?: number;
  minBattery?: number;
  maxBattery?: number;
  specificMaterial?: string; // e.g., "aluminum"
  specificProcessor?: string; // e.g., "snapdragon_8_gen_2"
  specificDisplayType?: string;
  mustHaveNFC?: boolean;
  mustHaveOIS?: boolean;
  minScreenSize?: number;
  maxScreenSize?: number;
  specificColor?: string; // hex or name
  maxUnitCost?: number;
  targetOs?: string; // e.g., "stock_android"
}

export interface ClientContract {
  id: string;
  clientName: string;
  contractTitle: string;
  brief: string;
  requiredSpecs: RequiredSpecs;
  quantity: number;
  rewardFlatBonus: number; // Flat bonus upon successful completion
  penaltyFlat: number; // Flat penalty for failure
  deadlineDays: number; // In "market days" from acceptance
  status: 'available' | 'accepted' | 'in_progress' | 'submitted' | 'completed_success' | 'completed_failed_specs' | 'completed_failed_deadline';
  acceptedDate?: string; // ISO string, set when accepted
}

export interface Achievement {
  id: AchievementId;
  titleKey: string;
  descriptionKey: string;
  condition: (stats: GameStats, phones: PhoneDesign[], other?: any) => boolean; // other can be used for specific data like researched components or contracts
  xpReward: number;
}

export type AchievementId =
  | 'rookieSeller'
  | 'firstMillionNetWorth'
  | 'innovatorCPU'
  | 'prolificDesigner'
  | 'firstSale';

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: 'firstSale',
    titleKey: 'achievement_firstSale_title',
    descriptionKey: 'achievement_firstSale_desc',
    condition: (stats) => stats.phonesSold > 0,
    xpReward: 25,
  },
  {
    id: 'rookieSeller',
    titleKey: 'achievement_rookieSeller_title',
    descriptionKey: 'achievement_rookieSeller_desc',
    condition: (stats) => stats.phonesSold >= 10,
    xpReward: 50,
  },
  {
    id: 'firstMillionNetWorth',
    titleKey: 'achievement_firstMillionNetWorth_title',
    descriptionKey: 'achievement_firstMillionNetWorth_desc',
    condition: (stats) => stats.totalFunds >= 1000000,
    xpReward: 200,
  },
  {
    id: 'innovatorCPU',
    titleKey: 'achievement_innovatorCPU_title',
    descriptionKey: 'achievement_innovatorCPU_desc',
    condition: (stats, phones, other) => {
        return other?.customProcessors && other.customProcessors.length > 0;
    },
    xpReward: 75,
  },
  {
    id: 'prolificDesigner',
    titleKey: 'achievement_prolificDesigner_title',
    descriptionKey: 'achievement_prolificDesigner_desc',
    condition: (stats, phones) => phones.length >= 3,
    xpReward: 50,
  },
];


export interface MarketingCampaignType {
  id: string;
  nameKey: string;
  descriptionKey: string;
  cost: number;
  durationDays: number;
  effectScope: 'all' | 'single_model';
  saleChanceBonus: number;
  brandReputationBonus: number;
}

export interface ActiveMarketingCampaign {
  campaignId: string;
  targetPhoneModelId?: string;
  targetPhoneModelName?: string;
  remainingDays: number;
  startDate: string;
}

export type GameEventType = 'component_cost_modifier' | 'feature_sale_chance_modifier' | 'global_sale_chance_modifier';

export interface GameEventDefinition {
    id: string;
    type: GameEventType;
    titleKey: string;
    descriptionKey: string;
    durationDays: number; // How many market simulation cycles it lasts
    effectValue: number; // e.g., 1.15 for 15% cost increase, 0.05 for 5% sale chance increase, -0.02 for 2% sale chance decrease
    componentCategory?: ComponentCategory; // For 'component_cost_modifier'
    targetFeature?: keyof PhoneDesign; // For 'feature_sale_chance_modifier', e.g., 'nfcSupport' or 'screenSize'
    targetFeatureValue?: any; // Value for targetFeature, e.g., true for nfcSupport, or a number for screenSize > X
    isNegative?: boolean; // To style notifications differently (e.g. red for bad events)
}

export interface ActiveGameEvent {
    eventId: string;
    remainingDays: number;
    definition: GameEventDefinition; // Store the full definition for easy access to its properties
}


// --- Genkit Flow Schemas and Types ---

export const EstimateDisplayCostsInputSchema = z.object({
  resolutionCategory: z.enum(['hd', 'fhd', 'qhd']).describe("The resolution category of the display (e.g., 'hd', 'fhd', 'qhd')."),
  technology: z.enum(['lcd', 'oled', 'ltpo_oled']).describe("The display panel technology (e.g., 'lcd', 'oled', 'ltpo_oled')."),
  refreshRate: z.number().min(60).max(240).describe('The refresh rate of the display in Hz (e.g., 60, 90, 120, 144).'),
});
export type EstimateDisplayCostsInput = z.infer<typeof EstimateDisplayCostsInputSchema>;

export const EstimateDisplayCostsOutputSchema = z.object({
  estimatedManufacturingCost: z.number().positive().describe('The AI-estimated manufacturing cost per unit for this display, in USD. Should be reasonable for the specs, e.g., between $10 and $200.'),
  estimatedResearchCost: z.number().positive().describe('The AI-estimated one-time research and development cost for this display, in USD. E.g., between $500 and $50,000.'),
});
export type EstimateDisplayCostsOutput = z.infer<typeof EstimateDisplayCostsOutputSchema>;

export const GenerateBrandSlogansInputSchema = z.object({
  brandName: z.string().describe('The name of the brand.'),
  logoDescription: z.string().describe('A description of the brand\'s logo or visual identity concept.'),
  marketingStrategy: z.string().describe('The chosen marketing strategy for the brand (e.g., Budget Friendly, Premium Quality, Innovation Leader).'),
});
export type GenerateBrandSlogansInput = z.infer<typeof GenerateBrandSlogansInputSchema>;

export const GenerateBrandSlogansOutputSchema = z.object({
  slogans: z.array(z.string()).describe('A list of 3-5 catchy and relevant slogan suggestions for the brand.'),
});
export type GenerateBrandSlogansOutput = z.infer<typeof GenerateBrandSlogansOutputSchema>;

export const GenerateClientContractInputSchema = z.object({
  playerReputation: z.number().optional().describe("Optional player's brand reputation score (-10 to 10), to potentially influence contract difficulty/reward."),
  playerLevel: z.number().optional().describe("Optional player's level, to potentially influence contract complexity or rewards."),
});
export type GenerateClientContractInput = z.infer<typeof GenerateClientContractInputSchema>;

export const RequiredSpecsSchema = z.object({
  minRam: z.number().optional().describe("Minimum RAM in GB. e.g., 8"),
  maxRam: z.number().optional().describe("Maximum RAM in GB. e.g., 12"),
  minStorage: z.number().optional().describe("Minimum storage in GB. e.g., 128"),
  maxStorage: z.number().optional().describe("Maximum storage in GB. e.g., 256"),
  minCameraMP: z.number().optional().describe("Minimum main camera resolution in MP. e.g., 48"),
  maxCameraMP: z.number().optional().describe("Maximum main camera resolution in MP. e.g., 108"),
  minBattery: z.number().optional().describe("Minimum battery capacity in mAh. e.g., 4000"),
  maxBattery: z.number().optional().describe("Maximum battery capacity in mAh. e.g., 5000"),
  specificMaterial: z.string().optional().describe("Specific material required. Use values like 'aluminum', 'plastic', 'glass_premium', 'titanium'. Refer to MATERIAL_OPTIONS in types.ts."),
  specificProcessor: z.string().optional().describe("Specific processor model. Use values like 'snapdragon_8_gen_2', 'dimensity_1080'. Refer to PROCESSOR_OPTIONS in types.ts."),
  specificDisplayType: z.string().optional().describe("Specific display type. Use values like 'oled_fhd', 'ltpo_oled_qhd'. Refer to DISPLAY_OPTIONS in types.ts."),
  mustHaveNFC: z.boolean().optional().describe("Whether NFC support is mandatory."),
  mustHaveOIS: z.boolean().optional().describe("Whether Optical Image Stabilization is mandatory for the main camera."),
  minScreenSize: z.number().optional().describe("Minimum screen size in inches. e.g., 6.1"),
  maxScreenSize: z.number().optional().describe("Maximum screen size in inches. e.g., 6.7"),
  specificColor: z.string().optional().describe("A specific color hex code (e.g., '#000000') or a color name like 'Midnight Black'. If named, try to match COLOR_OPTIONS."),
  maxUnitCost: z.number().optional().describe("Maximum allowed manufacturing cost per unit for the phone. e.g., 300 (USD)"),
  targetOs: z.string().optional().describe("Target operating system. Use values like 'stock_android', 'custom_android_lite'. Refer to OPERATING_SYSTEM_OPTIONS in types.ts.")
}).describe("Object detailing specific requirements for the phone. Only include 3-5 actual requirements, leaving others undefined. Ensure values are reasonable for a phone.");

export const ClientContractSchema = z.object({
  id: z.string().uuid().describe("A unique UUID for the contract."),
  clientName: z.string().describe("A plausible-sounding fictional company name (e.g., 'Innovate Solutions Ltd.', 'EcoTech Mobility', 'Stark Industries - Mobile Division')."),
  contractTitle: z.string().describe("A concise title for the contract (e.g., 'Bulk Order for Field Agents', 'Custom Device for Creative Professionals', 'Eco-Friendly Smartphone Initiative')."),
  brief: z.string().describe("A short (2-3 sentences) client brief explaining the need or purpose of the custom phones."),
  requiredSpecs: RequiredSpecsSchema,
  quantity: z.number().int().min(50).max(500).describe("Number of units required, typically between 50 and 500."),
  rewardFlatBonus: z.number().int().min(1000).max(10000).describe("A flat bonus amount (e.g., 1000 to 10000 USD) awarded upon successful completion of the contract, on top of unit sales price if applicable."),
  penaltyFlat: z.number().int().min(500).max(5000).describe("A flat penalty amount (e.g., 500 to 5000 USD) if the contract fails due to unmet specs or missed deadline."),
  deadlineDays: z.number().int().min(5).max(20).describe("Deadline in 'market days' (simulated game days) from the moment the contract is accepted, typically 5-20 days."),
  status: z.enum(['available', 'accepted', 'in_progress', 'submitted', 'completed_success', 'completed_failed_specs', 'completed_failed_deadline']).default('available').describe("Initial status, always 'available'.")
});

export const GeneratePhoneReviewInputSchema = z.object({
  phoneName: z.string().describe('The name of the phone model.'),
  processor: z.string().describe('The processor model.'),
  displayType: z.string().describe('The type of display technology used (e.g., OLED, LCD).'),
  ram: z.number().describe('The amount of RAM in GB.'),
  storage: z.number().describe('The amount of storage in GB.'),
  cameraResolution: z.number().describe('The main camera resolution in MP.'),
  batteryCapacity: z.number().describe('The battery capacity in mAh.'),
  material: z.string().describe('The primary material used for the phone body (e.g., Aluminum, Plastic).'),
  specialFeatures: z.array(z.string()).describe('A list of notable special features (e.g., High Refresh Rate, NFC, Water Resistance).'),
  estimatedCost: z.number().describe('The estimated manufacturing cost of ONE unit of the phone.'),
});
export type GeneratePhoneReviewInput = z.infer<typeof GeneratePhoneReviewInputSchema>;

export const GeneratePhoneReviewOutputSchema = z.object({
  reviewText: z.string().describe('A concise and engaging review of the phone, highlighting pros, cons, and overall impression. Aim for 3-5 sentences.'),
  pros: z.array(z.string()).describe('A list of positive aspects of the phone.'),
  cons: z.array(z.string()).describe('A list of negative aspects or areas for improvement.'),
  overallSentiment: z.enum(["Positive", "Neutral", "Negative"]).describe("The overall sentiment of the review."),
});
export type GeneratePhoneReviewOutput = z.infer<typeof GeneratePhoneReviewOutputSchema>;

export const TrendForecastingInputSchema = z.object({
  marketData: z.string().describe('The current market data for phones.'),
  competitorDevices: z.string().describe('Details of competitor devices.'),
  componentCosts: z.string().describe('The costs of various phone components.'),
  socialMediaBuzz: z.string().describe('The current social media buzz regarding phones.'),
});
export type TrendForecastingInput = z.infer<typeof TrendForecastingInputSchema>;

export const TrendForecastingOutputSchema = z.object({
  trends: z.array(
    z.object({
      feature: z.string().describe('The phone feature or technology.'),
      popularityRank: z.number().describe('The rank of the feature based on popularity.'),
      hotOrNot: z.string().describe('Whether the feature is considered hot or not.'),
    })
  ).describe('A ranked list of phone features and technologies based on popularity.'),
});
export type TrendForecastingOutput = z.infer<typeof TrendForecastingOutputSchema>;


export const PROCESSOR_OPTIONS: PhoneComponent = {
  id: 'processor', name: 'processorLabel', type: 'processor', options: [
    { value: 'budget_quad_core', label: 'processor_budget_quad', cost: 25, antutuScore: 80000, coreCount: 4, clockSpeed: 1.8 },
    { value: 'snapdragon_680', label: 'Snapdragon 680', cost: 50, antutuScore: 280000, coreCount: 8, clockSpeed: 2.4 },
    { value: 'helio_g99', label: 'Helio G99', cost: 45, antutuScore: 350000, coreCount: 8, clockSpeed: 2.2 },
    { value: 'dimensity_700', label: 'Dimensity 700', cost: 60, antutuScore: 380000, coreCount: 8, clockSpeed: 2.2 },
    { value: 'snapdragon_7_gen_1', label: 'processor_snapdragon_7_gen_1', cost: 90, antutuScore: 550000, coreCount: 8, clockSpeed: 2.4 },
    { value: 'dimensity_1080', label: 'processor_dimensity_1080', cost: 85, antutuScore: 520000, coreCount: 8, clockSpeed: 2.6 },
    { value: 'snapdragon_8_gen_1', label: 'Snapdragon 8 Gen 1', cost: 120, antutuScore: 980000, coreCount: 8, clockSpeed: 3.0 },
    { value: 'bionic_a15', label: 'Bionic A15', cost: 150, antutuScore: 1100000, coreCount: 6, clockSpeed: 3.2 },
    { value: 'dimensity_9000_plus', label: 'processor_dimensity_9000_plus', cost: 140, antutuScore: 1200000, coreCount: 8, clockSpeed: 3.2 },
    { value: 'snapdragon_8_gen_2', label: 'processor_snapdragon_8_gen_2', cost: 180, antutuScore: 1500000, coreCount: 8, clockSpeed: 3.2 },
    { value: 'bionic_a17_pro', label: 'Bionic A17 Pro', cost: 200, antutuScore: 1600000, coreCount: 6, clockSpeed: 3.7 },
    { value: 'snapdragon_8_gen_3', label: 'processor_snapdragon_8_gen_3', cost: 220, antutuScore: 2000000, coreCount: 8, clockSpeed: 3.3 },
  ]
};

export const DISPLAY_OPTIONS: PhoneComponent = {
  id: 'display', name: 'displayTypeLabel', type: 'display', options: [
    { value: 'lcd_hd', label: 'LCD HD (720p)', cost: 30, resolutionCategory: 'hd', technology: 'lcd', refreshRateValue: 60 },
    { value: 'lcd_fhd', label: 'LCD FHD (1080p)', cost: 50, resolutionCategory: 'fhd', technology: 'lcd', refreshRateValue: 60 },
    { value: 'oled_fhd', label: 'OLED FHD (1080p)', cost: 80, resolutionCategory: 'fhd', technology: 'oled', refreshRateValue: 60 },
    { value: 'oled_qhd', label: 'OLED QHD (1440p)', cost: 120, resolutionCategory: 'qhd', technology: 'oled', refreshRateValue: 90 },
    { value: 'ltpo_oled_qhd', label: 'LTPO OLED QHD (1440p Adaptive)', cost: 150, resolutionCategory: 'qhd', technology: 'ltpo_oled', refreshRateValue: 120 },
  ]
};

export const DISPLAY_RESOLUTION_CATEGORIES_RD = [
    { value: 'hd', label: 'displayResolution_hd' },
    { value: 'fhd', label: 'displayResolution_fhd' },
    { value: 'qhd', label: 'displayResolution_qhd' },
];

export const DISPLAY_TECHNOLOGIES_RD = [
    { value: 'lcd', label: 'displayTechnology_lcd' },
    { value: 'oled', label: 'displayTechnology_oled' },
    { value: 'ltpo_oled', label: 'displayTechnology_ltpo_oled' },
];

export const DISPLAY_REFRESH_RATES_RD = [
    { value: 60, label: '60Hz' },
    { value: 90, label: '90Hz' },
    { value: 120, label: '120Hz' },
    { value: 144, label: '144Hz' },
];


export const MATERIAL_OPTIONS: PhoneComponent = {
  id: 'material', name: 'materialLabel', type: 'material', options: [
    { value: 'plastic', label: 'Plastic', cost: 10 },
    { value: 'aluminum', label: 'Aluminum', cost: 25 },
    { value: 'glass_standard', label: 'Glass (Standard)', cost: 35 },
    { value: 'glass_premium', label: 'Glass (Gorilla Armor)', cost: 50 },
    { value: 'titanium', label: 'Titanium', cost: 80 },
  ]
};

export const COLOR_OPTIONS = [
  { value: '#000000', label: 'Midnight Black' },
  { value: '#FFFFFF', label: 'Snow White' },
  { value: '#7DF9FF', label: 'Electric Blue' },
  { value: '#A9A9A9', label: 'Graphite Gray' },
  { value: '#FFC0CB', label: 'Rose Gold' },
  { value: '#00FF00', label: 'Cyber Green' },
  { value: '#FFD700', label: 'Sunset Gold' },
  { value: '#800080', label: 'Cosmic Purple' },
];

export const RAM_COST_PER_GB = 5;
export const STORAGE_COST_PER_GB = 0.2;
export const CAMERA_COST_PER_MP = 0.5;
export const FRONT_CAMERA_COST_PER_MP = 0.6;
export const ULTRAWIDE_COST_PER_MP = 0.4;
export const TELEPHOTO_COST_PER_MP = 0.7;
export const BATTERY_COST_PER_100MAH = 1;
export const SCREEN_SIZE_COST_FACTOR = 15;

export const REFRESH_RATE_OPTIONS: PhoneComponent = {
  id: 'refreshRate', name: 'refreshRateLabel', type: 'refreshRate', options: [
    { value: '60hz', label: '60Hz', cost: 0 },
    { value: '90hz', label: '90Hz', cost: 10 },
    { value: '120hz', label: '120Hz', cost: 25 },
    { value: '144hz', label: '144Hz (Gaming)', cost: 40 },
  ]
};

export const WATER_RESISTANCE_OPTIONS: PhoneComponent = {
  id: 'waterResistance', name: 'waterResistanceLabel', type: 'waterResistance', options: [
    { value: 'none', label: 'None', cost: 0 },
    { value: 'ip53', label: 'IP53 (Splash Resistant)', cost: 5 },
    { value: 'ip67', label: 'IP67 (Dust/Water Resistant)', cost: 20 },
    { value: 'ip68', label: 'IP68 (Enhanced Dust/Water Resistant)', cost: 35 },
  ]
};

export const SIM_SLOT_OPTIONS: PhoneComponent = {
  id: 'simSlots', name: 'simSlotsLabel', type: 'simSlots', options: [
    { value: 'single_physical', label: 'Single Physical SIM', cost: 0 },
    { value: 'dual_physical', label: 'Dual Physical SIM', cost: 5 },
    { value: 'physical_esim', label: 'Physical SIM + eSIM', cost: 10 },
    { value: 'dual_esim', label: 'Dual eSIM (No Physical Slot)', cost: 12},
  ]
};

export const NFC_COST = 5;
export const OIS_COST = 15;

export const OPERATING_SYSTEM_OPTIONS: PhoneComponent = {
  id: 'operatingSystem', name: 'osLabel', type: 'operatingSystem', options: [
    { value: 'stock_android', label: 'Stock Android Experience', cost: 0 },
    { value: 'custom_android_lite', label: 'Custom Android (Lite Skin)', cost: 5 },
    { value: 'custom_android_feature_rich', label: 'Custom Android (Feature-Rich UI)', cost: 10 },
    { value: 'harmonyos_like', label: 'HarmonyOS-like (Proprietary)', cost: 15 },
  ]
};

export const TELEPHOTO_ZOOM_OPTIONS: PhoneComponent = {
    id: 'telephotoZoom', name: 'telephotoZoomLabel', type: 'telephotoZoom', options: [
        { value: 'none', label: 'telephotoZoom_none', cost: 0 },
        { value: '2x_optical', label: 'telephotoZoom_2x', cost: 20 },
        { value: '3x_optical', label: 'telephotoZoom_3x', cost: 35 },
        { value: '5x_optical', label: 'telephotoZoom_5x', cost: 50 },
        { value: '10x_optical', label: 'telephotoZoom_10x', cost: 75 },
    ]
};

export const VIDEO_RESOLUTION_OPTIONS: PhoneComponent = {
    id: 'videoResolution', name: 'videoResolutionLabel', type: 'videoResolution', options: [
        { value: '1080p30', label: '1080p @ 30fps', cost: 0 },
        { value: '1080p60', label: '1080p @ 60fps', cost: 10 },
        { value: '4k30', label: '4K @ 30fps', cost: 20 },
        { value: '4k60', label: '4K @ 60fps', cost: 35 },
        { value: '8k30', label: '8K @ 30fps', cost: 60 },
    ]
};

export const AVAILABLE_MARKETING_CAMPAIGNS: MarketingCampaignType[] = [
  {
    id: 'smm_boost',
    nameKey: 'campaign_smm_boost_name',
    descriptionKey: 'campaign_smm_boost_desc',
    cost: 500,
    durationDays: 3,
    effectScope: 'all',
    saleChanceBonus: 0.02,
    brandReputationBonus: 1,
  },
  {
    id: 'tech_review_spotlight',
    nameKey: 'campaign_tech_review_name',
    descriptionKey: 'campaign_tech_review_desc',
    cost: 2000,
    durationDays: 7,
    effectScope: 'single_model',
    saleChanceBonus: 0.08,
    brandReputationBonus: 3,
  },
  {
    id: 'global_online_blitz',
    nameKey: 'campaign_global_blitz_name',
    descriptionKey: 'campaign_global_blitz_desc',
    cost: 10000,
    durationDays: 15,
    effectScope: 'all',
    saleChanceBonus: 0.05,
    brandReputationBonus: 5,
  },
];

export const AVAILABLE_GAME_EVENTS: GameEventDefinition[] = [
    {
        id: 'evt_chip_shortage', type: 'component_cost_modifier',
        titleKey: 'gameEvent_chipShortage_title', descriptionKey: 'gameEvent_chipShortage_desc',
        durationDays: 5, effectValue: 1.15, componentCategory: 'processor', isNegative: true
    },
    {
        id: 'evt_ram_surplus', type: 'component_cost_modifier',
        titleKey: 'gameEvent_ramSurplus_title', descriptionKey: 'gameEvent_ramSurplus_desc',
        durationDays: 7, effectValue: 0.85, componentCategory: 'ram'
    },
    {
        id: 'evt_nfc_hype', type: 'feature_sale_chance_modifier',
        titleKey: 'gameEvent_nfcHype_title', descriptionKey: 'gameEvent_nfcHype_desc',
        durationDays: 7, effectValue: 0.03, targetFeature: 'nfcSupport', targetFeatureValue: true
    },
    {
        id: 'evt_large_screen_demand', type: 'feature_sale_chance_modifier',
        titleKey: 'gameEvent_largeScreenDemand_title', descriptionKey: 'gameEvent_largeScreenDemand_desc',
        durationDays: 10, effectValue: 0.025, targetFeature: 'screenSize', targetFeatureValue: 6.5 // Implies 'greater than or equal to'
    },
    {
        id: 'evt_economic_boom', type: 'global_sale_chance_modifier',
        titleKey: 'gameEvent_economicBoom_title', descriptionKey: 'gameEvent_economicBoom_desc',
        durationDays: 10, effectValue: 0.015
    },
    {
        id: 'evt_economic_recession', type: 'global_sale_chance_modifier',
        titleKey: 'gameEvent_economicRecession_title', descriptionKey: 'gameEvent_economicRecession_desc',
        durationDays: 12, effectValue: -0.01, isNegative: true
    },
];


export const LOCAL_STORAGE_GAME_STATS_KEY = 'gadgetTycoon_gameStats';
export const LOCAL_STORAGE_TRANSACTIONS_KEY = 'gadgetTycoon_transactions';
export const LOCAL_STORAGE_MY_PHONES_KEY = 'myPhones';
export const LOCAL_STORAGE_BRAND_KEY = 'gadgetTycoon_brand';
export const LOCAL_STORAGE_AVAILABLE_CONTRACTS_KEY = 'gadgetTycoon_availableContracts';
export const LOCAL_STORAGE_ACCEPTED_CONTRACTS_KEY = 'gadgetTycoon_acceptedContracts';
export const LOCAL_STORAGE_LAST_MARKET_SIMULATION_KEY = 'gadgetTycoon_lastMarketSimulation';
export const LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY = 'gadgetTycoon_customProcessors';
export const LOCAL_STORAGE_CUSTOM_DISPLAYS_KEY = 'gadgetTycoon_customDisplays';
export const LOCAL_STORAGE_RESEARCHED_PROCESSOR_TIERS_KEY = 'gadgetTycoon_researchedProcTiers';
export const LOCAL_STORAGE_RESEARCHED_DISPLAY_TIERS_KEY = 'gadgetTycoon_researchedDispTiers';
export const LOCAL_STORAGE_GAME_SETTINGS_KEY = 'gadgetTycoon_gameSettings';
export const LOCAL_STORAGE_ACHIEVEMENTS_KEY = 'gadgetTycoon_achievements';
export const LOCAL_STORAGE_ACTIVE_CAMPAIGN_KEY = 'gadgetTycoon_activeCampaign';
export const LOCAL_STORAGE_ACTIVE_EVENTS_KEY = 'gadgetTycoon_activeEvents';


export const SALE_MARKUP_FACTOR = 1.5;
export const INITIAL_FUNDS = 25000;
export const BASE_DESIGN_ASSEMBLY_COST = 30;

// Market Simulation Parameters
export const BASE_MARKET_SALE_CHANCE_PER_UNIT = 0.02;
export const MARKET_SIMULATION_INTERVAL = 15000;
export const MARKET_MAX_SALES_PER_PHONE_PER_INTERVAL = 7;
export const MARKET_CATCH_UP_THRESHOLD_MINUTES = 5;
export const MARKET_MAX_CATCH_UP_INTERVALS = 20;

export const DIFFICULTY_SALE_CHANCE_MODIFIERS: Record<GameDifficulty, number> = {
  easy: 1.25,
  normal: 1.0,
  hard: 0.75,
};

export const MAX_AVAILABLE_CONTRACTS = 3;
export const MAX_ACTIVE_GAME_EVENTS = 2;
export const GAME_EVENT_PROBABILITY_PER_SIMULATION = 0.10; // 10% chance per market cycle to trigger a new event

// Leveling System
export const XP_FOR_DESIGNING_PHONE = 50;
export const XP_PER_PHONE_SOLD = 15;
export const XP_FOR_RESEARCHING_COMPONENT = 75;
export const XP_FOR_RESEARCHING_TIER = 100;
export const XP_FOR_STARTING_MARKETING_CAMPAIGN = 20;


export function calculateXpToNextLevel(level: number): number {
  return 100 + (level -1) * 75;
}

export const MONEY_BONUS_PER_LEVEL_BASE = 250;
export const MONEY_BONUS_FIXED_AMOUNT = 1500;
