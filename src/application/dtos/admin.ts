export type AdminProductRecord = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  external_url: string | null;
  brand: string | null;
  category_id: string;
  created_at: string;
};

export type AdminProductVariantRecord = {
  id: string;
  product_id: string;
  name: string | null;
  color_hex: string;
  texture: string | null;
  shimmer_color: string | null;
  image_url: string | null;
  sku: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type AdminProductConfigRecord = {
  id: string;
  product_id: string;
  category_id: string;
  primary_color: string | null;
  texture: string | null;
  hex_color: string | null;
  color_intensity: number | string | null;
  pattern_name: string | null;
  extra_params: unknown;
  created_at: string;
};

export type AdminCategoryRecord = {
  id: string;
  name: string;
  api_category_key: string;
  created_at: string;
};

export type AdminApiKeyRecord = {
  id: string;
  name: string | null;
  key_value: string | null;
  provider: string | null;
  is_active: boolean;
  created_at: string;
};

export type AdminPlanRecord = {
  id: string;
  name: string;
  slug: string;
  price: number;
  billing_interval: string;
  scan_limit: number;
  history_days: number;
  description: string | null;
  features: string[];
  badge: string | null;
  is_active: boolean;
  created_at?: string;
};

export type AdminSubscriptionRecord = {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  plan?: Pick<AdminPlanRecord, 'id' | 'name' | 'slug' | 'price' | 'billing_interval'>;
};

export type AdminScanEffect = {
  category: string;
  enabled: boolean;
  palettes?: Array<{
    color: string;
    texture?: string;
    colorIntensity?: number;
    glowIntensity?: number;
    shimmerIntensity?: number;
  }>;
  pattern?: { name: string };
  shape?: { name: string };
  style?: { type: string };
  skinSmoothStrength?: number;
};

export type AdminScanRecord = {
  id: string;
  created_at: string;
  user_id: string;
  original_image: string | null;
  image_url: string | null;
  effects: AdminScanEffect[];
  mode: 'api' | 'demo';
};

export type AdminRecommendationRecord = {
  id: string;
  scan_id: string;
  product_id: string;
  reason: string;
  created_at: string;
};

export type AdminProductInput = {
  name: string;
  description: string | null;
  image_url: string | null;
  external_url: string | null;
  brand: string | null;
  category_id: string;
};

export type AdminProductVariantInput = {
  name?: string | null;
  color_hex: string;
  texture?: string | null;
  shimmer_color?: string | null;
  image_url?: string | null;
  sku?: string | null;
  sort_order: number;
  is_active: boolean;
};

export type AdminProductConfigInput = {
  product_id: string;
  category_id: string;
  primary_color: string | null;
  texture: string | null;
};

export type AdminProductConfigReplaceInput = {
  effect_category: string;
  primary_color: string | null;
  effect_data: Record<string, unknown>;
};

export type AdminCategoryInput = {
  name: string;
  api_category_key: string;
};

export type AdminApiKeyInput = {
  name?: string | null;
  key_value?: string | null;
  provider?: string | null;
  is_active?: boolean;
};

export type AdminPlanInput = {
  name: string;
  slug: string;
  price: number;
  billing_interval: string;
  scan_limit: number;
  history_days: number;
  description?: string | null;
  features: string[];
  badge?: string | null;
  is_active?: boolean;
};

export type AdminPlanPatch = Partial<AdminPlanInput>;

export type AdminSubscriptionInput = {
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  started_at: string;
  expires_at: string | null;
};

export type AdminSubscriptionPatch = Partial<AdminSubscriptionInput> & {
  cancelled_at?: string | null;
};

export type AdminRecommendationInput = {
  productId: string;
  reason?: string;
};
