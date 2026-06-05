import type { AdminUseCaseDependencies } from './admin-dependencies';
import {
  mapAdminCategory,
  mapAdminConfig,
  mapAdminMakeupCatalogItem,
  mapAdminProduct,
  mapAdminVariant,
} from '@/application/mappers/admin-mappers';
import type {
  AdminCategoryInput,
  AdminProductConfigInput,
  AdminProductConfigReplaceInput,
  AdminProductInput,
  AdminProductVariantInput,
} from '@/application/dtos/admin';

export function createAdminCatalogUseCases(deps: AdminUseCaseDependencies) {
  return {
    async getMakeupCatalog() {
      const items = await deps.makeupCatalogRepo.getMakeupCatalog();
      return items.map(mapAdminMakeupCatalogItem);
    },

    async getProducts() {
      const products = await deps.productRepo.getAll();
      return products.map(mapAdminProduct);
    },
    async getAdminProducts() {
      const products = await deps.productRepo.getAll();
      return products.map(mapAdminProduct);
    },
    async createProduct(input: AdminProductInput) {
      const product = await deps.productRepo.create({
        name: input.name,
        description: input.description,
        imageUrl: input.image_url,
        externalUrl: input.external_url,
        brand: input.brand,
        categoryId: input.category_id,
      });
      return mapAdminProduct(product);
    },
    async updateProduct(id: string, input: Partial<AdminProductInput>) {
      const product = await deps.productRepo.update(id, {
        name: input.name,
        description: input.description,
        imageUrl: input.image_url,
        externalUrl: input.external_url,
        brand: input.brand,
        categoryId: input.category_id,
      });
      return mapAdminProduct(product);
    },
    deleteProduct: (id: string) => deps.productRepo.delete(id),

    async getAdminProductVariants() {
      const variants = await deps.productVariantRepo.getAll();
      return variants.map(mapAdminVariant);
    },
    async replaceProductVariants(productId: string, variants: AdminProductVariantInput[]) {
      const result = await deps.productVariantRepo.replaceForProduct(
        productId,
        variants.map((variant) => ({
          name: variant.name ?? null,
          colorHex: variant.color_hex,
          texture: variant.texture ?? null,
          shimmerColor: variant.shimmer_color ?? null,
          imageUrl: variant.image_url ?? null,
          sku: variant.sku ?? null,
          sortOrder: variant.sort_order,
          isActive: variant.is_active,
        })),
      );
      return result.map(mapAdminVariant);
    },
    deleteProductVariant: (id: string) => deps.productVariantRepo.delete(id),

    async getAdminProductConfigs() {
      const configs = await deps.productConfigRepo.getAll();
      return configs.map(mapAdminConfig);
    },
    async getProductConfigsByProductId(productId: string) {
      const configs = await deps.productConfigRepo.getByProductId(productId);
      return configs.map(mapAdminConfig);
    },
    async createProductConfig(input: AdminProductConfigInput) {
      const config = await deps.productConfigRepo.create({
        productId: input.product_id,
        categoryId: input.category_id,
        primaryColor: input.primary_color,
        texture: input.texture,
      });
      return mapAdminConfig(config);
    },
    async updateProductConfig(id: string, input: Partial<AdminProductConfigInput>) {
      const config = await deps.productConfigRepo.update(id, {
        categoryId: input.category_id,
        primaryColor: input.primary_color,
        texture: input.texture,
      });
      return mapAdminConfig(config);
    },
    deleteProductConfig: (id: string) => deps.productConfigRepo.delete(id),
    async replaceProductConfigs(productId: string, configs: AdminProductConfigReplaceInput[]) {
      const result = await deps.productConfigRepo.replaceForProduct(productId, configs);
      return result.map(mapAdminConfig);
    },

    async getAdminCategories() {
      const categories = await deps.categoryRepo.getAll();
      return categories.map(mapAdminCategory);
    },
    async getCategories() {
      const categories = await deps.categoryRepo.getAll();
      return categories.map(mapAdminCategory);
    },
    async createCategory(input: AdminCategoryInput) {
      const category = await deps.categoryRepo.create({
        name: input.name,
        apiCategoryKey: input.api_category_key,
      });
      return mapAdminCategory(category);
    },
    async updateCategory(id: string, input: Partial<AdminCategoryInput>) {
      const category = await deps.categoryRepo.update(id, {
        name: input.name,
        apiCategoryKey: input.api_category_key,
      });
      return mapAdminCategory(category);
    },
    deleteCategory: (id: string) => deps.categoryRepo.delete(id),
  };
}
