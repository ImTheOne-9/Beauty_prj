import type { ApiKey, CreateApiKeyInput, UpdateApiKeyInput } from '@/core/entities';

/**
 * Repository interface for API Key operations.
 */
export interface IApiKeyRepository {
  getAll(): Promise<Omit<ApiKey, 'keyValue'>[]>;
  create(input: CreateApiKeyInput): Promise<unknown>;
  update(id: string, input: UpdateApiKeyInput): Promise<unknown>;
  delete(id: string): Promise<void>;
}
