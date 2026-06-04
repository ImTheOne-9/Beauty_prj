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
