import type {
  CreateProductConfigInput,
  CreateProductInput,
  CreateProductVariantInput,
  Product,
  ProductConfig,
  ProductVariant,
  UpdateProductConfigInput,
  UpdateProductInput,
} from '@/core/entities';

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: string, input: UpdateProductInput): Promise<Product>;
  delete(id: string): Promise<void>;
}

export interface IProductConfigRepository {
  getAll(): Promise<ProductConfig[]>;
  getByProductId(productId: string): Promise<ProductConfig[]>;
  create(input: CreateProductConfigInput): Promise<ProductConfig>;
  update(id: string, input: UpdateProductConfigInput): Promise<ProductConfig>;
  delete(id: string): Promise<void>;
  replaceForProduct(
    productId: string,
    configs: Array<{
      effect_category: string;
      primary_color: string | null;
      effect_data: Record<string, unknown>;
    }>,
  ): Promise<ProductConfig[]>;
}

export interface IProductVariantRepository {
  getAll(): Promise<ProductVariant[]>;
  replaceForProduct(
    productId: string,
    variants: Omit<CreateProductVariantInput, 'productId'>[],
  ): Promise<ProductVariant[]>;
  delete(id: string): Promise<void>;
}
