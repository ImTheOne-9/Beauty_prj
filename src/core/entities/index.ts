// Core domain entities — barrel export
export type { Product, CreateProductInput, UpdateProductInput, ProductConfig, CreateProductConfigInput, UpdateProductConfigInput, ProductVariant, CreateProductVariantInput } from './Product';
export type { Category, CreateCategoryInput, UpdateCategoryInput } from './Category';
export type { UserProfile, UpdateProfileInput, Plan, CreatePlanInput, UpdatePlanInput, AdminUserProfile } from './User';
export { type UserRole, type SubscriptionTier } from './User';
export type { Order, ShippingInfo } from './Order';
export { type PaymentMethod, type OrderStatus } from './Order';
export type { Subscription, CreateSubscriptionInput } from './Subscription';
export { type SubscriptionStatus } from './Subscription';
export type { Scan, ScanResult, Recommendation, ScanProductRecommendation, SaveRecommendationInput, MakeupPalette, MakeupEffect, MakeupVtoPayload, MakeupCatalogItem, MatchedMakeupProduct, ProductRecommendation, SkinMetric, FaceDetectionResult } from './Scan';
export { type MakeupTexture, type MakeupVtoTaskStatus } from './Scan';
export type { ApiKey, CreateApiKeyInput, UpdateApiKeyInput } from './ApiKey';
export type { AdminRole, AdminSection, AdminAuthUser } from './Admin';
export { adminSections, getAdminRole, isAdminUser, getAdminSections, canAccessAdminSection, getAdminRoleLabel } from './Admin';
