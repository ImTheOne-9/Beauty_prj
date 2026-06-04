import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/core/entities';

/**
 * Repository interface for Category operations.
 */
export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  create(input: CreateCategoryInput): Promise<Category>;
  update(id: string, input: UpdateCategoryInput): Promise<Category>;
  delete(id: string): Promise<void>;
}
