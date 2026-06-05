import type { IApiKeyRepository } from '@/core/interfaces';
import type { ApiKey, CreateApiKeyInput, UpdateApiKeyInput } from '@/core/entities';
import { supabase } from '@/infrastructure/supabase/client';

type ApiKeyRow = {
  id: string;
  name: string | null;
  provider: string | null;
  is_active: boolean;
  created_at: string;
};

function mapApiKeyRow(row: ApiKeyRow): Omit<ApiKey, 'keyValue'> {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

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
    return (((data as unknown as ApiKeyRow[]) ?? [])).map(mapApiKeyRow);
  }

  async create(input: CreateApiKeyInput): Promise<Omit<ApiKey, 'keyValue'>> {
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
    return mapApiKeyRow(data as ApiKeyRow);
  }

  async update(id: string, input: UpdateApiKeyInput): Promise<Omit<ApiKey, 'keyValue'>> {
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.keyValue !== undefined) payload.key_value = input.keyValue;
    if (input.provider !== undefined) payload.provider = input.provider;
    if (input.isActive !== undefined) payload.is_active = input.isActive;

    const { data, error } = await supabase.functions.invoke('manage-api-key', {
      body: { action: 'update', id, payload },
    });
    if (error) throw error;
    return mapApiKeyRow(data as ApiKeyRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.functions.invoke('manage-api-key', {
      body: { action: 'delete', id },
    });
    if (error) throw error;
  }
}
