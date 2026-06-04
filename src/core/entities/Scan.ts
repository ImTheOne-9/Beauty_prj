/**
 * Core Scan domain entity.
 */
export interface Scan {
  id: string;
  createdAt: string;
  userId: string;
  originalImage: string | null;
  imageUrl: string | null;
  effects: unknown[];
  mode: 'api' | 'demo';
}

export interface ScanResult {
  originalImage: string;
  appliedEffects: MakeupEffect[];
  resultImageUrl: string;
  createdAt: string;
  mode: 'demo' | 'api';
}

export interface Recommendation {
  id: string;
  scanId: string;
  productId: string;
  reason: string;
  createdAt: string;
}

export interface ScanProductRecommendation {
  id: string;
  reason: string;
  product: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    external_url: string | null;
    brand: string | null;
  } | null;
}

export interface SaveRecommendationInput {
  productId: string;
  reason?: string;
}

// ─── Makeup Domain Types ────────────────────────────────────────────────────

export type MakeupTexture =
  | 'matte'
  | 'satin'
  | 'shimmer'
  | 'gloss'
  | 'metallic'
  | 'sheer'
  | 'holographic';

export interface MakeupPalette {
  color: string;
  texture?: MakeupTexture;
  colorIntensity?: number;
  colorUnderEyeIntensity?: number;
  coverageLevel?: number;
  coverageIntensity?: number;
  glowIntensity?: number;
  thickness?: number;
  smoothness?: number;
  shimmerDensity?: number;
  shimmerColor?: string;
  shimmerIntensity?: number;
  shimmerSize?: number;
  metallicIntensity?: number;
  glowStrength?: number;
  gloss?: number;
  transparencyIntensity?: number;
}

export interface MakeupEffect {
  category: string;
  enabled?: boolean;
  pattern?: {
    name?: string;
    type?: string;
    curvature?: number;
    thickness?: number;
    definition?: number;
  };
  shape?: { name?: string };
  style?: {
    type?: string;
    innerRatio?: number;
    featherStrength?: number;
    innerColorRatio?: number;
    blendStrength?: number;
  };
  morphology?: { fullness?: number; wrinkless?: number };
  palettes?: MakeupPalette[];
  skinSmoothStrength?: number;
  skinSmoothColorIntensity?: number;
}

export interface MakeupVtoPayload {
  src_file_url: string;
  effects: MakeupEffect[];
  version: '1.0';
}

export type MakeupVtoTaskStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'processing'
  | 'success'
  | 'error';

export interface MakeupCatalogItem {
  productId: string;
  name: string;
  description: string | null;
  image: string;
  externalLink: string;
  brand: string | null;
  categoryId: string;
  categoryName: string;
  apiCategoryKey: string;
  primaryColor: string | null;
  colorIntensity?: number | null;
  texture: string | null;
}

export interface MatchedMakeupProduct extends MakeupCatalogItem {
  matchReason: string;
  matchedCategory: string;
}

export interface ProductRecommendation {
  id: string;
  name: string;
  image: string;
  description: string;
  reason: string;
  externalLink: string;
  category: string;
  price?: string;
  originalPrice?: string;
  discount?: number;
  rating?: number;
  reviews?: number;
  stock?: number;
  matchScore?: number;
  matchReason?: string;
}

export interface SkinMetric {
  label: string;
  value: number;
  status: 'great' | 'moderate' | 'attention';
}

export interface FaceDetectionResult {
  hasFace: boolean;
  detections: number;
  error?: string;
}
