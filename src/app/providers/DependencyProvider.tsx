import { createContext, useContext, type PropsWithChildren } from 'react';
import { SupabaseProductRepository } from '@/infrastructure/supabase/SupabaseProductRepository';
import { SupabaseProductConfigRepository } from '@/infrastructure/supabase/SupabaseProductConfigRepository';
import { SupabaseProductVariantRepository } from '@/infrastructure/supabase/SupabaseProductVariantRepository';
import { SupabaseCategoryRepository } from '@/infrastructure/supabase/SupabaseCategoryRepository';
import { SupabaseAuthRepository } from '@/infrastructure/supabase/SupabaseAuthRepository';
import { SupabaseUserRepository } from '@/infrastructure/supabase/SupabaseUserRepository';
import { SupabaseScanRepository } from '@/infrastructure/supabase/SupabaseScanRepository';
import { SupabaseRecommendationRepository } from '@/infrastructure/supabase/SupabaseRecommendationRepository';
import { SupabaseMakeupCatalogRepository } from '@/infrastructure/supabase/SupabaseMakeupCatalogRepository';
import { LocalStorageOrderRepository } from '@/infrastructure/local-storage/LocalStorageOrderRepository';
import { SupabasePlanRepository } from '@/infrastructure/supabase/SupabasePlanRepository';
import { SupabaseSubscriptionRepository } from '@/infrastructure/supabase/SupabaseSubscriptionRepository';
import { SupabaseApiKeyRepository } from '@/infrastructure/supabase/SupabaseApiKeyRepository';
import { SupabaseAdminRepository } from '@/infrastructure/supabase/SupabaseAdminRepository';
import { SupabaseStorageService } from '@/infrastructure/supabase/SupabaseStorageService';
import { MakeupArApiService } from '@/infrastructure/supabase/MakeupArApiService';
import { FaceApiDetector } from '@/infrastructure/supabase/FaceApiDetector';
import {
  createCatalogUseCases,
  createAdminUseCases,
  createPlanUseCases,
  createProductUseCases,
  createScanUseCases,
  createAuthUseCases,
} from '@/application/use-cases';

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

export const dependencies = {
  ...repositories,
  useCases: {
    admin: createAdminUseCases(repositories.adminRepo, repositories),
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

export type Dependencies = typeof dependencies;

const DependencyContext = createContext<Dependencies | null>(null);

export function DependencyProvider({ children }: PropsWithChildren) {
  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
}

export function useDependencies() {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error('useDependencies must be used within a DependencyProvider');
  }
  return context;
}
