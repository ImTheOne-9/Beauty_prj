import type { IProductVariantRepository } from '@/core/interfaces';
import type { ProductVariant, CreateProductVariantInput } from '@/core/entities';
import { supabase } from '@/infrastructure/supabase/client';

/**
 * Supabase implementation of IProductVariantRepository.
 */
export class SupabaseProductVariantRepository implements IProductVariantRepository {
  async getAll(): Promise<ProductVariant[]> {
    const { data, error } = await (supabase as any)
      .from('product_variants')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapRowToVariant);
  }

  async replaceForProduct(
    productId: string,
    variants: Omit<CreateProductVariantInput, 'productId'>[],
  ): Promise<ProductVariant[]> {
    const { error: deleteError } = await (supabase as any)
      .from('product_variants')
      .delete()
      .eq('product_id', productId);
    if (deleteError) throw deleteError;

    if (variants.length === 0) return [];

    const rows = variants.map((variant, index) => ({
      product_id: productId,
      name: variant.name?.trim() || null,
      color_hex: variant.colorHex,
      texture: variant.texture?.trim() || null,
      shimmer_color: variant.shimmerColor?.trim() || null,
      image_url: variant.imageUrl?.trim() || null,
      sku: variant.sku?.trim() || null,
      sort_order: variant.sortOrder ?? index,
      is_active: variant.isActive ?? true,
    }));

    const { data, error } = await (supabase as any)
      .from('product_variants')
      .insert(rows)
      .select('*');
    if (error) throw error;
    return (data ?? []).map(mapRowToVariant);
  }

  async delete(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('product_variants')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}

function mapRowToVariant(row: Record<string, unknown>): ProductVariant {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    name: row.name as string | null,
    colorHex: row.color_hex as string,
    texture: row.texture as string | null,
    shimmerColor: row.shimmer_color as string | null,
    imageUrl: row.image_url as string | null,
    sku: row.sku as string | null,
    sortOrder: row.sort_order as number,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  };
}
