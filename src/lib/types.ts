
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

export interface CustomProcessor {
  id: string;
  name: string;
  antutuScore: number;
  coreCount: number;
  clockSpeed: number; // in GHz
  manufacturingCost: number; // Cost to use this processor in a phone, calculated algorithmically
  researchCost: number; // One-time cost to unlock/develop, calculated algorithmically
  type: 'custom_processor'; // To distinguish from predefined ones
}

export interface CustomDisplay {
  id: string;
  name: string;
  resolutionCategory: string; // e.g., 'fhd', 'qhd'
  technology: string; // e.g., 'oled', 'ltpo_oled'
  refreshRate: number; // e.g., 90, 120
  manufacturingCost: number; // Estimated by AI or algorithm
  researchCost: number; // Estimated by AI or algorithm
  type: 'custom_display';
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

export interface GameStats {
  totalFunds: number;
  phonesSold: number;
  brandReputation: number;
  level: number;
  xp: number;
}

export interface GameSettings {
  useOnlineFeatures: boolean; // true for AI, false for local algorithms
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

// For R&D Page Custom Display Creation
export const DISPLAY_RESOLUTION_CATEGORIES_RD = [
    { value: 'hd', label: 'displayResolution_hd' }, // 720p
    { value: 'fhd', label: 'displayResolution_fhd' }, // 1080p
    { value: 'qhd', label: 'displayResolution_qhd' }, // 1440p
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

export const LOCAL_STORAGE_GAME_STATS_KEY = 'gadgetTycoon_gameStats';
export const LOCAL_STORAGE_TRANSACTIONS_KEY = 'gadgetTycoon_transactions';
export const LOCAL_STORAGE_MY_PHONES_KEY = 'myPhones';
export const LOCAL_STORAGE_BRAND_KEY = 'gadgetTycoon_brand';
export const LOCAL_STORAGE_AVAILABLE_CONTRACTS_KEY = 'gadgetTycoon_availableContracts';
export const LOCAL_STORAGE_ACCEPTED_CONTRACTS_KEY = 'gadgetTycoon_acceptedContracts';
export const LOCAL_STORAGE_LAST_MARKET_SIMULATION_KEY = 'gadgetTycoon_lastMarketSimulation';
export const LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY = 'gadgetTycoon_customProcessors';
export const LOCAL_STORAGE_CUSTOM_DISPLAYS_KEY = 'gadgetTycoon_customDisplays';
export const LOCAL_STORAGE_GAME_SETTINGS_KEY = 'gadgetTycoon_gameSettings';


export const SALE_MARKUP_FACTOR = 1.5;
export const INITIAL_FUNDS = 2000;
export const BASE_DESIGN_ASSEMBLY_COST = 10;

// Market Simulation Parameters
export const MARKET_SIMULATION_INTERVAL = 60000; // 60 seconds
export const MARKET_MAX_SALES_PER_PHONE_PER_INTERVAL = 2;
export const MARKET_SALE_CHANCE_PER_UNIT = 0.10;
export const MARKET_CATCH_UP_THRESHOLD_MINUTES = 5;
export const MARKET_MAX_CATCH_UP_INTERVALS = 10;

export const MAX_AVAILABLE_CONTRACTS = 3;

// Leveling System
export const XP_FOR_DESIGNING_PHONE = 50;
export const XP_PER_PHONE_SOLD = 2;
export const XP_FOR_RESEARCHING_COMPONENT = 30; // XP for researching a custom component

export function calculateXpToNextLevel(level: number): number {
  return level * 100;
}
