import type { IApiKeyRepository } from '@/core/interfaces';
import type { ApiKey, CreateApiKeyInput, UpdateApiKeyInput } from '@/core/entities';
import { supabase } from '@/infrastructure/supabase/client';

/**
 * Supabase implementation of IApiKeyRepository.
 */
export class SupabaseApiKeyRepository implements IApiKeyRepository {
  async getAll(): Promise<Omit<ApiKey, 'keyValue'>[]> {
    const { data, error } = await supabase
      .from('api_keys' as any)
      .select('id, name, provider, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data as any[]) ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      provider: row.provider,
      isActive: row.is_active,
      createdAt: row.created_at,
    }));
  }

  async create(input: CreateApiKeyInput): Promise<unknown> {
    const { data, error } = await supabase.functions.invoke('manage-api-key', {
      body: {
        action: 'create',
        payload: {
          name: input.name,
          key_value: input.keyValue,
          provider: input.provider,
          is_active: input.isActive,
        },
      },
    });
    if (error) throw error;
    return data;
  }

  async update(id: string, input: UpdateApiKeyInput): Promise<unknown> {
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.keyValue !== undefined) payload.key_value = input.keyValue;
    if (input.provider !== undefined) payload.provider = input.provider;
    if (input.isActive !== undefined) payload.is_active = input.isActive;

    const { data, error } = await supabase.functions.invoke('manage-api-key', {
      body: { action: 'update', id, payload },
    });
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.functions.invoke('manage-api-key', {
      body: { action: 'delete', id },
    });
    if (error) throw error;
  }
}
