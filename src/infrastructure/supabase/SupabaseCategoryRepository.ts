import type { ICategoryRepository } from '@/core/interfaces';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/core/entities';
import { supabase } from '@/infrastructure/supabase/client';

export class SupabaseCategoryRepository implements ICategoryRepository {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapRowToCategory);
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: input.name, api_category_key: input.apiCategoryKey })
      .select('*')
      .single();
    if (error) throw error;
    return mapRowToCategory(data);
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.apiCategoryKey !== undefined) payload.api_category_key = input.apiCategoryKey;

    const { data, error } = await supabase
      .from('categories')
      .update(payload as any)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return mapRowToCategory(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  }
}

function mapRowToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    apiCategoryKey: row.api_category_key as string,
    createdAt: row.created_at as string,
  };
}
