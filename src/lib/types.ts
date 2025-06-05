
export interface Trend {
  feature: string;
  popularityRank: number;
  hotOrNot: string;
}

export interface PhoneComponentOption {
  value: string;
  label: string;
  cost: number;
}

export interface PhoneComponent {
  id: string;
  name: string;
  type: 'processor' | 'display' | 'ram' | 'storage' | 'camera' | 'battery' | 'material' | 'screenSize' | 'refreshRate' | 'waterResistance' | 'simSlots' | 'nfc' | 'operatingSystem' | 'frontCamera';
  options?: PhoneComponentOption[]; // For discrete choices
  range?: { min: number; max: number; step: number; unit: string }; // For continuous values
  costPerUnit?: number; // For RAM, Storage, Battery capacity
  baseCost?: number; // For boolean features like NFC
}

export interface PhoneDesign {
  id:string; // Unique identifier for the phone
  name: string; // User-defined name for the phone
  processor: string;
  displayType: string;
  ram: number; // in GB
  storage: number; // in GB
  cameraResolution: number; // in MP
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
  
  unitManufacturingCost: number; // Cost to produce ONE unit
  productionQuantity: number; // How many were produced in the initial batch
  currentStock: number; // How many are left from that batch (produced - sold directly by player or not listed)

  review?: string; // AI-generated review for the design
  imageUrl?: string; // Placeholder for a generated image if needed

  // New fields for market sales
  salePrice: number; // Price set by the user for market sale
  quantityListedForSale: number; // How many units are currently on the market
}

export interface Brand {
  name: string;
  logoDescription: string;
  marketingStrategy: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string or formatted string
  description: string; // This can be a translation key or a pre-formatted string with placeholders
  amount: number; // Positive for income, negative for expense
  type: 'income' | 'expense';
}

export interface GameStats {
  totalFunds: number;
  phonesSold: number; // Total phones sold (both direct and market)
  brandReputation: number; // Or a string like "Neutral", "Good", "Bad"
}

export const PROCESSOR_OPTIONS: PhoneComponent = {
  id: 'processor', name: 'Processor', type: 'processor', options: [
    { value: 'snapdragon_680', label: 'Snapdragon 680', cost: 50 },
    { value: 'helio_g99', label: 'Helio G99', cost: 45 },
    { value: 'dimensity_700', label: 'Dimensity 700', cost: 60 },
    { value: 'snapdragon_8_gen_1', label: 'Snapdragon 8 Gen 1', cost: 120 },
    { value: 'bionic_a15', label: 'Bionic A15', cost: 150 },
    { value: 'bionic_a17_pro', label: 'Bionic A17 Pro', cost: 200 },
  ]
};

export const DISPLAY_OPTIONS: PhoneComponent = {
  id: 'display', name: 'Display Type', type: 'display', options: [
    { value: 'lcd_hd', label: 'LCD HD (720p)', cost: 30 },
    { value: 'lcd_fhd', label: 'LCD FHD (1080p)', cost: 50 },
    { value: 'oled_fhd', label: 'OLED FHD (1080p)', cost: 80 },
    { value: 'oled_qhd', label: 'OLED QHD (1440p)', cost: 120 },
    { value: 'ltpo_oled_qhd', label: 'LTPO OLED QHD (1440p Adaptive)', cost: 150 },
  ]
};

export const MATERIAL_OPTIONS: PhoneComponent = {
  id: 'material', name: 'Body Material', type: 'material', options: [
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

// Cost per GB/MP/mAh/etc.
export const RAM_COST_PER_GB = 5;
export const STORAGE_COST_PER_GB = 0.2;
export const CAMERA_COST_PER_MP = 0.5;
export const FRONT_CAMERA_COST_PER_MP = 0.6; // Slightly more for selfie optimization
export const BATTERY_COST_PER_100MAH = 1;
export const SCREEN_SIZE_COST_FACTOR = 15; // Cost multiplier for (size - baseSize)

export const REFRESH_RATE_OPTIONS: PhoneComponent = {
  id: 'refreshRate', name: 'Refresh Rate', type: 'refreshRate', options: [
    { value: '60hz', label: '60Hz', cost: 0 },
    { value: '90hz', label: '90Hz', cost: 10 },
    { value: '120hz', label: '120Hz', cost: 25 },
    { value: '144hz', label: '144Hz (Gaming)', cost: 40 },
  ]
};

export const WATER_RESISTANCE_OPTIONS: PhoneComponent = {
  id: 'waterResistance', name: 'Water Resistance', type: 'waterResistance', options: [
    { value: 'none', label: 'None', cost: 0 },
    { value: 'ip53', label: 'IP53 (Splash Resistant)', cost: 5 },
    { value: 'ip67', label: 'IP67 (Dust/Water Resistant)', cost: 20 },
    { value: 'ip68', label: 'IP68 (Enhanced Dust/Water Resistant)', cost: 35 },
  ]
};

export const SIM_SLOT_OPTIONS: PhoneComponent = {
  id: 'simSlots', name: 'SIM Card Slots', type: 'simSlots', options: [
    { value: 'single_physical', label: 'Single Physical SIM', cost: 0 },
    { value: 'dual_physical', label: 'Dual Physical SIM', cost: 5 },
    { value: 'physical_esim', label: 'Physical SIM + eSIM', cost: 10 },
    { value: 'dual_esim', label: 'Dual eSIM (No Physical Slot)', cost: 12},
  ]
};

export const NFC_COST = 5; // Cost if NFC is enabled

export const OPERATING_SYSTEM_OPTIONS: PhoneComponent = {
  id: 'operatingSystem', name: 'Operating System', type: 'operatingSystem', options: [
    { value: 'stock_android', label: 'Stock Android Experience', cost: 0 },
    { value: 'custom_android_lite', label: 'Custom Android (Lite Skin)', cost: 5 },
    { value: 'custom_android_feature_rich', label: 'Custom Android (Feature-Rich UI)', cost: 10 },
    { value: 'harmonyos_like', label: 'HarmonyOS-like (Proprietary)', cost: 15 },
  ]
};

// localStorage keys
export const LOCAL_STORAGE_GAME_STATS_KEY = 'gadgetTycoon_gameStats';
export const LOCAL_STORAGE_TRANSACTIONS_KEY = 'gadgetTycoon_transactions';
export const LOCAL_STORAGE_MY_PHONES_KEY = 'myPhones'; // Existing key for phones
export const LOCAL_STORAGE_BRAND_KEY = 'gadgetTycoon_brand';

// Game Balance
export const SALE_MARKUP_FACTOR = 1.5; // Default markup for initial salePrice = unitManufacturingCost * SALE_MARKUP_FACTOR
export const INITIAL_FUNDS = 50000;
export const BASE_DESIGN_ASSEMBLY_COST = 50; // Base cost added to each unit
export const MARKET_SALE_CHANCE = 0.3; // 30% chance to sell a listed unit per market day simulation per unit
export const MARKET_MAX_SALES_PER_PHONE_PER_DAY = 3; // Max units of a single phone model that can be sold in one market day
