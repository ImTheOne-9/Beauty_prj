import type { AdminUseCaseDependencies } from './admin/admin-dependencies';
import { createAdminAccessUseCases } from './admin/admin-access-use-cases';
import { createAdminCatalogUseCases } from './admin/admin-catalog-use-cases';
import { createAdminCommerceUseCases } from './admin/admin-commerce-use-cases';
import { createAdminScanUseCases } from './admin/admin-scan-use-cases';

export function createAdminUseCases(deps: AdminUseCaseDependencies) {
  return {
    ...createAdminAccessUseCases(deps),
    ...createAdminCatalogUseCases(deps),
    ...createAdminScanUseCases(deps),
    ...createAdminCommerceUseCases(deps),
  };
}

export type AdminUseCases = ReturnType<typeof createAdminUseCases>;
