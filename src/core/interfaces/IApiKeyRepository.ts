import type { ApiKey, CreateApiKeyInput, UpdateApiKeyInput } from '@/core/entities';

/**
 * Repository interface for API Key operations.
 */
export interface IApiKeyRepository {
  getAll(): Promise<Omit<ApiKey, 'keyValue'>[]>;
  create(input: CreateApiKeyInput): Promise<Omit<ApiKey, 'keyValue'>>;
  update(id: string, input: UpdateApiKeyInput): Promise<Omit<ApiKey, 'keyValue'>>;
  delete(id: string): Promise<void>;
}
