import type { IMakeupCatalogRepository } from '@/core/interfaces';
import type { MakeupCatalogItem } from '@/core/entities';
import { supabase } from '@/infrastructure/supabase/client';

export class SupabaseMakeupCatalogRepository implements IMakeupCatalogRepository {
  async getMakeupCatalog(): Promise<MakeupCatalogItem[]> {
    const { data, error } = await (supabase as any)
      .from('products')
      .select(`
        id,
        name,
        description,
        image_url,
        external_url,
        brand,
        category_id,
        categories(id, name, api_category_key),
        product_configs(primary_color, texture)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return ((data as any[]) ?? []).flatMap((product) => {
      const category = Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories;
      const configs = Array.isArray(product.product_configs) && product.product_configs.length > 0
        ? product.product_configs
        : [null];

      return configs.map((config: any) => ({
        productId: product.id,
        name: product.name,
        description: product.description ?? null,
        image: product.image_url ?? '',
        externalLink: product.external_url ?? '',
        brand: product.brand ?? null,
        categoryId: product.category_id,
        categoryName: category?.name ?? '',
        apiCategoryKey: category?.api_category_key ?? '',
        primaryColor: config?.primary_color ?? null,
        colorIntensity: null,
        texture: config?.texture ?? null,
      }));
    });
  }
}
