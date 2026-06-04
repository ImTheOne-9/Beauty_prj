// Core interfaces — barrel export
export type { IProductRepository, IProductConfigRepository, IProductVariantRepository } from './IProductRepository';
export type { ICategoryRepository } from './ICategoryRepository';
export type { IAuthRepository, IUserRepository, AuthResult } from './IAuthRepository';
export type { IScanRepository, IRecommendationRepository, IMakeupCatalogRepository } from './IScanRepository';
export type { IOrderRepository } from './IOrderRepository';
export type { IPlanRepository, ISubscriptionRepository } from './IPlanRepository';
export type { IApiKeyRepository } from './IApiKeyRepository';
export type { IMakeupVtoService, IFaceDetector, IStorageService } from './IServices';
