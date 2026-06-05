import type { Category } from './Category';

/**
 * Core Product domain entity.
 * Pure data — no infrastructure dependencies.
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  externalUrl: string | null;
  brand: string | null;
  categoryId: string;
  createdAt: string;
  category?: Category | null;
  variants?: ProductVariant[];
}

export type CreateProductInput = Omit<Product, 'id' | 'createdAt'>;
export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductConfig {
  id: string;
  productId: string;
  categoryId: string;
  primaryColor: string | null;
  texture: string | null;
  hexColor?: string | null;
  colorIntensity?: number | string | null;
  patternName?: string | null;
  extraParams?: unknown;
  createdAt: string;
}

export type CreateProductConfigInput = Omit<ProductConfig, 'id' | 'createdAt'>;
export type UpdateProductConfigInput = Partial<CreateProductConfigInput>;

export interface ProductVariant {
  id: string;
  productId: string;
  name: string | null;
  colorHex: string;
  texture: string | null;
  shimmerColor: string | null;
  imageUrl: string | null;
  sku: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export type CreateProductVariantInput = Omit<ProductVariant, 'id' | 'createdAt'>;
