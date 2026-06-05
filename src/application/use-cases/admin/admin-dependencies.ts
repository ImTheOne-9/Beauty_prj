import type {
  IAdminRepository,
  IApiKeyRepository,
  ICategoryRepository,
  IMakeupCatalogRepository,
  IOrderRepository,
  IPlanRepository,
  IProductConfigRepository,
  IProductRepository,
  IProductVariantRepository,
  IRecommendationRepository,
  IScanRepository,
  ISubscriptionRepository,
  IUserRepository,
} from '@/core/interfaces';

export type AdminUseCaseDependencies = {
  adminRepo: IAdminRepository;
  productRepo: IProductRepository;
  productConfigRepo: IProductConfigRepository;
  productVariantRepo: IProductVariantRepository;
  categoryRepo: ICategoryRepository;
  apiKeyRepo: IApiKeyRepository;
  scanRepo: IScanRepository;
  recommendationRepo: IRecommendationRepository;
  userRepo: IUserRepository;
  orderRepo: IOrderRepository;
  planRepo: IPlanRepository;
  subscriptionRepo: ISubscriptionRepository;
  makeupCatalogRepo: IMakeupCatalogRepository;
};
