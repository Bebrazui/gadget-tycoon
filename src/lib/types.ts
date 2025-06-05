
export interface Trend {
  feature: string;
  popularityRank: number;
  hotOrNot: string;
}

export interface PhoneComponent {
  id: string;
  name: string;
  type: 'processor' | 'display' | 'ram' | 'storage' | 'camera' | 'battery' | 'material';
  options?: { value: string; label: string; cost: number }[]; // For discrete choices
  range?: { min: number; max: number; step: number; unit: string }; // For continuous values
  costPerUnit?: number; // For RAM, Storage, Battery capacity
}

export interface PhoneDesign {
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
}

export interface Brand {
  name: string;
  logoDescription: string;
  marketingStrategy: string;
}

export const PROCESSOR_OPTIONS: PhoneComponent = {
  id: 'processor', name: 'Processor', type: 'processor', options: [
    { value: 'snapdragon_680', label: 'Snapdragon 680', cost: 50 },
    { value: 'helio_g99', label: 'Helio G99', cost: 45 },
    { value: 'dimensity_700', label: 'Dimensity 700', cost: 60 },
    { value: 'bionic_a15', label: 'Bionic A15', cost: 150 },
  ]
};

export const DISPLAY_OPTIONS: PhoneComponent = {
  id: 'display', name: 'Display Type', type: 'display', options: [
    { value: 'lcd_hd', label: 'LCD HD (720p)', cost: 30 },
    { value: 'lcd_fhd', label: 'LCD FHD (1080p)', cost: 50 },
    { value: 'oled_fhd', label: 'OLED FHD (1080p)', cost: 80 },
    { value: 'oled_qhd', label: 'OLED QHD (1440p)', cost: 120 },
  ]
};

export const MATERIAL_OPTIONS: PhoneComponent = {
  id: 'material', name: 'Body Material', type: 'material', options: [
    { value: 'plastic', label: 'Plastic', cost: 10 },
    { value: 'aluminum', label: 'Aluminum', cost: 25 },
    { value: 'glass', label: 'Glass (Gorilla Armor)', cost: 40 },
    { value: 'titanium', label: 'Titanium', cost: 70 },
  ]
};

export const COLOR_OPTIONS = [
  { value: '#000000', label: 'Midnight Black' },
  { value: '#FFFFFF', label: 'Snow White' },
  { value: '#7DF9FF', label: 'Electric Blue' },
  { value: '#A9A9A9', label: 'Graphite Gray' },
  { value: '#FFC0CB', label: 'Rose Gold' },
  { value: '#00FF00', label: 'Cyber Green' },
];

// Cost per GB/MP/mAh
export const RAM_COST_PER_GB = 5;
export const STORAGE_COST_PER_GB = 0.2;
export const CAMERA_COST_PER_MP = 0.5; // Base cost, can be more complex
export const BATTERY_COST_PER_100MAH = 1;
