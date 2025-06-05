
export interface Trend {
  feature: string;
  popularityRank: number;
  hotOrNot: string;
}

export interface PhoneComponentOption {
  value: string;
  label: string; // This will often be a translation key
  cost: number;
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
  processor: string;
  displayType: string;
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
  description: string; 
  amount: number; 
  type: 'income' | 'expense';
}

export interface GameStats {
  totalFunds: number;
  phonesSold: number; 
  brandReputation: number; 
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
    { value: 'budget_quad_core', label: 'processor_budget_quad', cost: 25 },
    { value: 'snapdragon_680', label: 'Snapdragon 680', cost: 50 },
    { value: 'helio_g99', label: 'Helio G99', cost: 45 },
    { value: 'dimensity_700', label: 'Dimensity 700', cost: 60 },
    { value: 'snapdragon_7_gen_1', label: 'processor_snapdragon_7_gen_1', cost: 90 },
    { value: 'dimensity_1080', label: 'processor_dimensity_1080', cost: 85 },
    { value: 'snapdragon_8_gen_1', label: 'Snapdragon 8 Gen 1', cost: 120 },
    { value: 'bionic_a15', label: 'Bionic A15', cost: 150 },
    { value: 'dimensity_9000_plus', label: 'processor_dimensity_9000_plus', cost: 140 },
    { value: 'snapdragon_8_gen_2', label: 'processor_snapdragon_8_gen_2', cost: 180 },
    { value: 'bionic_a17_pro', label: 'Bionic A17 Pro', cost: 200 },
    { value: 'snapdragon_8_gen_3', label: 'processor_snapdragon_8_gen_3', cost: 220 },
  ]
};

export const DISPLAY_OPTIONS: PhoneComponent = {
  id: 'display', name: 'displayTypeLabel', type: 'display', options: [
    { value: 'lcd_hd', label: 'LCD HD (720p)', cost: 30 },
    { value: 'lcd_fhd', label: 'LCD FHD (1080p)', cost: 50 },
    { value: 'oled_fhd', label: 'OLED FHD (1080p)', cost: 80 },
    { value: 'oled_qhd', label: 'OLED QHD (1440p)', cost: 120 },
    { value: 'ltpo_oled_qhd', label: 'LTPO OLED QHD (1440p Adaptive)', cost: 150 },
  ]
};

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

export const SALE_MARKUP_FACTOR = 1.5; 
export const INITIAL_FUNDS = 5000; 
export const BASE_DESIGN_ASSEMBLY_COST = 15; 
export const MARKET_SALE_CHANCE = 0.15; 
export const MARKET_MAX_SALES_PER_PHONE_PER_DAY = 3;
export const MAX_AVAILABLE_CONTRACTS = 3;
