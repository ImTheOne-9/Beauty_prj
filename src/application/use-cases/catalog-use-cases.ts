import type { ICategoryRepository, IMakeupCatalogRepository } from '@/core/interfaces';

export function createCatalogUseCases(
  categoryRepo: ICategoryRepository,
  makeupCatalogRepo: IMakeupCatalogRepository,
) {
  return {
    listCategories() {
      return categoryRepo.getAll();
    },

    listMakeupCatalog() {
      return makeupCatalogRepo.getMakeupCatalog();
    },
  };
}
