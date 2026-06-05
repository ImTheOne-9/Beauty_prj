import { createAdminUseCases, createAuthUseCases, createCatalogUseCases, createPlanUseCases, createProductUseCases, createScanUseCases } from '@/application/use-cases';
import { FaceApiDetector } from '@/infrastructure/supabase/FaceApiDetector';
import { LocalStorageOrderRepository } from '@/infrastructure/local-storage/LocalStorageOrderRepository';
import { MakeupArApiService } from '@/infrastructure/supabase/MakeupArApiService';
import { SupabaseAdminRepository } from '@/infrastructure/supabase/SupabaseAdminRepository';
import { SupabaseApiKeyRepository } from '@/infrastructure/supabase/SupabaseApiKeyRepository';
import { SupabaseAuthRepository } from '@/infrastructure/supabase/SupabaseAuthRepository';
import { SupabaseCategoryRepository } from '@/infrastructure/supabase/SupabaseCategoryRepository';
import { SupabaseMakeupCatalogRepository } from '@/infrastructure/supabase/SupabaseMakeupCatalogRepository';
import { SupabasePlanRepository } from '@/infrastructure/supabase/SupabasePlanRepository';
import { SupabaseProductConfigRepository } from '@/infrastructure/supabase/SupabaseProductConfigRepository';
import { SupabaseProductRepository } from '@/infrastructure/supabase/SupabaseProductRepository';
import { SupabaseProductVariantRepository } from '@/infrastructure/supabase/SupabaseProductVariantRepository';
import { SupabaseRecommendationRepository } from '@/infrastructure/supabase/SupabaseRecommendationRepository';
import { SupabaseScanRepository } from '@/infrastructure/supabase/SupabaseScanRepository';
import { SupabaseStorageService } from '@/infrastructure/supabase/SupabaseStorageService';
import { SupabaseSubscriptionRepository } from '@/infrastructure/supabase/SupabaseSubscriptionRepository';
import { SupabaseUserRepository } from '@/infrastructure/supabase/SupabaseUserRepository';

function createDependencies() {
  const storageService = new SupabaseStorageService();

  const repositories = {
    productRepo: new SupabaseProductRepository(),
    productConfigRepo: new SupabaseProductConfigRepository(),
    productVariantRepo: new SupabaseProductVariantRepository(),
    categoryRepo: new SupabaseCategoryRepository(),
    authRepo: new SupabaseAuthRepository(),
    userRepo: new SupabaseUserRepository(),
    scanRepo: new SupabaseScanRepository(storageService),
    recommendationRepo: new SupabaseRecommendationRepository(),
    makeupCatalogRepo: new SupabaseMakeupCatalogRepository(),
    orderRepo: new LocalStorageOrderRepository(),
    planRepo: new SupabasePlanRepository(),
    subscriptionRepo: new SupabaseSubscriptionRepository(),
    apiKeyRepo: new SupabaseApiKeyRepository(),
    adminRepo: new SupabaseAdminRepository(),
    storageService,
    makeupVtoService: new MakeupArApiService(),
    faceDetector: new FaceApiDetector(),
  };

  return {
    ...repositories,
    useCases: {
      admin: createAdminUseCases(repositories),
      auth: createAuthUseCases(repositories.authRepo, repositories.storageService),
      products: createProductUseCases(repositories.productRepo, repositories.productVariantRepo),
      catalog: createCatalogUseCases(repositories.categoryRepo, repositories.makeupCatalogRepo),
      plans: createPlanUseCases(repositories.planRepo, repositories.subscriptionRepo, repositories.authRepo),
      scans: createScanUseCases(
        repositories.scanRepo,
        repositories.recommendationRepo,
        repositories.makeupCatalogRepo,
        repositories.productRepo,
        repositories.makeupVtoService,
        repositories.faceDetector,
      ),
    },
  };
}

let dependencies: ReturnType<typeof createDependencies> | null = null;

export function getDependencies() {
  dependencies ??= createDependencies();
  return dependencies;
}

export type Dependencies = ReturnType<typeof createDependencies>;
