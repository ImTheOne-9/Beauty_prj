/**
 * Core ApiKey domain entity.
 */
export interface ApiKey {
  id: string;
  name: string | null;
  keyValue?: string | null;
  provider: string | null;
  isActive: boolean;
  createdAt: string;
}

export type CreateApiKeyInput = Omit<ApiKey, 'id' | 'createdAt'>;
export type UpdateApiKeyInput = Partial<CreateApiKeyInput>;
