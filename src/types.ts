export type PoolShape = 'rectangle' | 'round' | 'oval' | 'eight' | 'custom';

export interface PoolDimensions {
  length: number;
  width: number;
  depth: number;
  diameter: number;
}

export type LocationType = 'outdoor' | 'indoor';

export type EnvironmentExposure = 
  | 'clean' 
  | 'light_trees' 
  | 'heavy_trees' 
  | 'high_sun';

export type FilterType = 
  | 'sand' 
  | 'glass' 
  | 'cartridge' 
  | 'filterballs'
  | 'balls';

export type CoverType = 
  | 'none' 
  | 'solar' 
  | 'tarp'
  | 'roller_safety'
  | 'dome'
  | 'safety' 
  | 'roller'
  | 'enclosure';

export type DisinfectionMethod = 
  | 'chlorine' 
  | 'salt' 
  | 'oxygen' 
  | 'bromine';

export interface WaterValues {
  ph?: number;
  // Chlor
  freeChlorine?: number;
  totalChlorine?: number;
  cyanuricAcid?: number;
  // Salz
  saltLevel?: number; // g/l
  redox?: number; // mV
  // Sauerstoff
  activeOxygen?: number; // mg/l
  waterTemp?: number; // °C
  // Brom
  bromine?: number; // mg/l
  waterHardness?: number; // °dH
  alkalinity?: number; // mg/l
}

export type WaterProblemId = 
  | 'green_water'
  | 'cloudy_water'
  | 'slippery_surfaces'
  | 'foam_surface'
  | 'chlorine_smell'
  | 'brown_metallic'
  | 'scale_deposits'
  | 'corrosion'
  | 'yellow_waterline'
  | 'bleached_liner'
  | 'vacation'
  | 'spring_opening'
  | 'winter_closing'
  | 'routine_maintenance';

export interface ProblemOption {
  id: WaterProblemId;
  title: string;
  subtitle: string;
  icon: string;
  defaultSeverity: 'high' | 'medium' | 'low' | 'info';
}

export interface UploadedPhoto {
  dataUrl: string;
  name: string;
  size: number;
}

export interface DosageItem {
  id: string;
  productName: string;
  amount: string;
  unit: string;
  purpose: string;
  applicationNote: string;
  urgent: boolean;
}

export interface ActionStep {
  stepNumber: number;
  title: string;
  timeframe: string;
  description: string;
  importantHint?: string;
  relatedProducts?: string[];
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  badge?: 'Bestseller' | 'Auf Lager' | 'Empfehlung' | 'Top-Qualität';
  rating: number;
  reviewsCount: number;
  price: number;
  originalPrice?: number;
  unitSize: string;
  basePriceText?: string;
  description: string;
  image: string;
  inStock: boolean;
  matchReason?: string;
  articleUrl?: string;
}

export interface AutoDosingConfig {
  autoPh: boolean;
  autoChlorine: boolean;
  autoSalt: boolean;
}

export interface PoolFinderState {
  currentStep: number;
  // Step 1
  inputMode: 'calculator' | 'direct';
  shape: PoolShape;
  dimensions: PoolDimensions;
  volumeM3: number;

  // Step 2
  location: LocationType;
  environment: EnvironmentExposure;
  filterType: FilterType;
  cover: CoverType;
  covers: CoverType[];

  // Step 3
  disinfectionMethod: DisinfectionMethod;
  waterValues: WaterValues;
  autoDosing: AutoDosingConfig;

  // Step 4
  selectedProblems: WaterProblemId[];
  notes: string;
  photo: UploadedPhoto | null;
  analysisId?: string;
  createdAt?: string;
}
