export const ENERGY_MODES = {
  HOUSEHOLD: 'household',
  INDUSTRY: 'industry'
} as const;

export type EnergyMode = typeof ENERGY_MODES[keyof typeof ENERGY_MODES];

export interface Device {
  name: string;
  category: string;
  avgConsumption: number;
}

export interface DailyData {
  date: string;
  consumption: number;
  cost: number;
  carbon: number;
}

export interface HourlyData {
  hour: number;
  consumption: number;
}

export interface EnergyData {
  devices?: Device[];
  machines?: Device[];
  dailyData: DailyData[];
  hourlyData: HourlyData[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  carbonReduction: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface Anomaly {
  date: string;
  hour?: number;
  value: number;
  expected: number;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export const COLORS = {
  primary: '#22c55e',
  secondary: '#3b82f6',
  accent: '#06b6d4',
  warning: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981'
};

export const DEVICE_CATEGORIES = {
  household: {
    heating_cooling: { name: 'Heating & Cooling', color: '#ef4444' },
    water_heating: { name: 'Water Heating', color: '#f59e0b' },
    appliances: { name: 'Appliances', color: '#3b82f6' },
    lighting: { name: 'Lighting', color: '#22c55e' },
    electronics: { name: 'Electronics', color: '#8b5cf6' }
  },
  industry: {
    manufacturing: { name: 'Manufacturing', color: '#ef4444' },
    climate_control: { name: 'Climate Control', color: '#f59e0b' },
    utilities: { name: 'Utilities', color: '#3b82f6' },
    lighting: { name: 'Lighting', color: '#22c55e' },
    office: { name: 'Office Equipment', color: '#8b5cf6' }
  }
};

export const USD_TO_INR = 88.66; // 1 USD = 88.66 INR
export const COST_PER_KWH = 0.12 * USD_TO_INR; // ₹10.64 per kWh (converted from $0.12)
export const CARBON_PER_KWH = 0.5; // 0.5 kg CO2 per kWh