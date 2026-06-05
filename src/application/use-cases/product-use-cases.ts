import type { IProductRepository, IProductVariantRepository } from '@/core/interfaces';
import type { ProductRecommendation } from '@/core/entities';

export function createProductUseCases(
  productRepo: IProductRepository,
  productVariantRepo: IProductVariantRepository,
) {
  return {
    async listProducts() {
      return productRepo.getAll();
    },

    async listProductVariants() {
      return productVariantRepo.getAll();
    },

    async listProductRecommendations(): Promise<ProductRecommendation[]> {
      const products = await productRepo.getAll();
      return products.map((product) => ({
        id: product.id,
        name: product.name,
        image: product.imageUrl ?? '',
        description: product.description ?? '',
        reason: `Catalog pick for ${product.brand ?? 'skincare'}.`,
        externalLink: product.externalUrl ?? '',
        category: product.category?.name ?? '',
        brand: product.brand,
        variants: product.variants
          ?.filter((variant) => variant.isActive)
          .map((variant) => ({
            id: variant.id,
            name: variant.name,
            colorHex: variant.colorHex,
            texture: variant.texture,
            shimmerColor: variant.shimmerColor,
            imageUrl: variant.imageUrl,
            sku: variant.sku,
          })),
      }));
    },
  };
}
