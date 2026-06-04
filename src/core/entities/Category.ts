/**
 * Core Category domain entity.
 */
export interface Category {
  id: string;
  name: string;
  apiCategoryKey: string;
  createdAt: string;
}

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt'>;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
