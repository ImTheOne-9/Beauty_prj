import type { IProductConfigRepository } from '@/core/interfaces';
import type { ProductConfig, CreateProductConfigInput } from '@/core/entities';
import { supabase, type Json } from '@/infrastructure/supabase/client';

/**
 * Supabase implementation of IProductConfigRepository.
 */
export class SupabaseProductConfigRepository implements IProductConfigRepository {
  async getAll(): Promise<ProductConfig[]> {
    const { data, error } = await supabase
      .from('product_configs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRowToConfig);
  }

  async getByProductId(productId: string): Promise<ProductConfig[]> {
    const { data, error } = await supabase
      .from('product_configs')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapRowToConfig);
  }

  async create(input: CreateProductConfigInput): Promise<ProductConfig> {
    const payload = {
      product_id: input.productId,
      category_id: input.categoryId,
      primary_color: input.primaryColor,
      texture: input.texture,
    };
    const { data, error } = await supabase
      .from('product_configs')
      .insert(payload as any)
      .select('*')
      .single();
    if (error) throw error;
    return mapRowToConfig(data);
  }

  async update(id: string, input: Partial<CreateProductConfigInput>): Promise<ProductConfig> {
    const payload: Record<string, unknown> = {};
    if (input.categoryId !== undefined) payload.category_id = input.categoryId;
    if (input.primaryColor !== undefined) payload.primary_color = input.primaryColor;
    if (input.texture !== undefined) payload.texture = input.texture;

    const { data, error } = await supabase
      .from('product_configs')
      .update(payload as any)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return mapRowToConfig(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('product_configs').delete().eq('id', id);
    if (error) throw error;
  }

  async replaceForProduct(
    productId: string,
    configs: Array<{
      effect_category: string;
      primary_color: string | null;
      effect_data: Record<string, unknown>;
    }>,
  ): Promise<ProductConfig[]> {
    // 1. Delete all existing configs
    const { error: delErr } = await supabase
      .from('product_configs')
      .delete()
      .eq('product_id', productId);
    if (delErr) throw delErr;

    // 2. Insert new (if any)
    if (configs.length === 0) return [];

    const rows = configs.map((c) => ({
      product_id: productId,
      effect_category: c.effect_category,
      primary_color: c.primary_color ?? extractPrimaryColor(c.effect_data),
      effect_data: c.effect_data as Json,
    }));

    const { data, error: insErr } = await supabase
      .from('product_configs')
      .insert(rows as any)
      .select('*');
    if (insErr) throw insErr;
    return (data ?? []).map(mapRowToConfig);
  }
}

function extractPrimaryColor(effectData: Record<string, unknown>): string | null {
  const palettes = effectData.palettes as Array<{ color?: string }> | undefined;
  return palettes?.[0]?.color ?? null;
}

function mapRowToConfig(row: Record<string, unknown>): ProductConfig {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    categoryId: row.category_id as string,
    primaryColor: (row.primary_color as string | null) ?? null,
    texture: row.texture as string | null,
    hexColor: row.hex_color as string | null | undefined,
    colorIntensity: row.color_intensity as number | string | null | undefined,
    patternName: row.pattern_name as string | null | undefined,
    extraParams: row.extra_params as unknown,
    createdAt: row.created_at as string,
  };
}
