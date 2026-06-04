import type { IProductRepository } from '@/core/interfaces';
import type { CreateProductInput, Product, UpdateProductInput } from '@/core/entities';
import { supabase } from '@/infrastructure/supabase/client';

export class SupabaseProductRepository implements IProductRepository {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRowToProduct);
  }

  async create(input: CreateProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: input.name,
        description: input.description,
        image_url: input.imageUrl,
        external_url: input.externalUrl,
        brand: input.brand,
        category_id: input.categoryId,
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapRowToProduct(data);
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.description !== undefined) payload.description = input.description;
    if (input.imageUrl !== undefined) payload.image_url = input.imageUrl;
    if (input.externalUrl !== undefined) payload.external_url = input.externalUrl;
    if (input.brand !== undefined) payload.brand = input.brand;
    if (input.categoryId !== undefined) payload.category_id = input.categoryId;

    const { data, error } = await supabase
      .from('products')
      .update(payload as any)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return mapRowToProduct(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }
}

function mapRowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | null,
    imageUrl: row.image_url as string | null,
    externalUrl: row.external_url as string | null,
    brand: row.brand as string | null,
    categoryId: row.category_id as string,
    createdAt: row.created_at as string,
  };
}
