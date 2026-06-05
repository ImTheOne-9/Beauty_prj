import type { ApiKey, Category, MakeupCatalogItem, Plan, Product, ProductConfig, ProductVariant, Recommendation, Scan, Subscription } from '@/core/entities';
import type {
  AdminApiKeyRecord,
  AdminCategoryRecord,
  AdminPlanRecord,
  AdminProductConfigRecord,
  AdminProductRecord,
  AdminProductVariantRecord,
  AdminRecommendationRecord,
  AdminScanEffect,
  AdminScanRecord,
  AdminSubscriptionRecord,
} from '@/application/dtos/admin';

export function mapAdminProduct(product: Product): AdminProductRecord {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image_url: product.imageUrl,
    external_url: product.externalUrl,
    brand: product.brand,
    category_id: product.categoryId,
    created_at: product.createdAt,
  };
}

export function mapAdminVariant(variant: ProductVariant): AdminProductVariantRecord {
  return {
    id: variant.id,
    product_id: variant.productId,
    name: variant.name,
    color_hex: variant.colorHex,
    texture: variant.texture,
    shimmer_color: variant.shimmerColor,
    image_url: variant.imageUrl,
    sku: variant.sku,
    sort_order: variant.sortOrder,
    is_active: variant.isActive,
    created_at: variant.createdAt,
  };
}

export function mapAdminConfig(config: ProductConfig): AdminProductConfigRecord {
  return {
    id: config.id,
    product_id: config.productId,
    category_id: config.categoryId,
    primary_color: config.primaryColor,
    texture: config.texture,
    hex_color: config.hexColor ?? null,
    color_intensity: config.colorIntensity ?? null,
    pattern_name: config.patternName ?? null,
    extra_params: config.extraParams ?? null,
    created_at: config.createdAt,
  };
}

export function mapAdminCategory(category: Category): AdminCategoryRecord {
  return {
    id: category.id,
    name: category.name,
    api_category_key: category.apiCategoryKey,
    created_at: category.createdAt,
  };
}

export function mapAdminApiKey(key: Omit<ApiKey, 'keyValue'> & { keyValue?: string | null }): AdminApiKeyRecord {
  return {
    id: key.id,
    name: key.name,
    key_value: key.keyValue ?? null,
    provider: key.provider,
    is_active: key.isActive,
    created_at: key.createdAt,
  };
}

export function mapAdminPlan(plan: Plan): AdminPlanRecord {
  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    price: plan.price,
    billing_interval: plan.billingInterval,
    scan_limit: plan.scanLimit,
    history_days: plan.historyDays,
    description: plan.description,
    features: plan.features,
    badge: plan.badge,
    is_active: plan.isActive,
    created_at: plan.createdAt,
  };
}

export function mapAdminSubscription(subscription: Subscription): AdminSubscriptionRecord {
  return {
    id: subscription.id,
    user_id: subscription.userId,
    plan_id: subscription.planId,
    status: subscription.status,
    started_at: subscription.startedAt,
    expires_at: subscription.expiresAt,
    cancelled_at: subscription.cancelledAt,
    created_at: subscription.createdAt,
    plan: subscription.plan
      ? {
          id: subscription.plan.id,
          name: subscription.plan.name,
          slug: subscription.plan.slug,
          price: subscription.plan.price,
          billing_interval: subscription.plan.billingInterval,
        }
      : undefined,
  };
}

export function mapAdminScan(scan: Scan): AdminScanRecord {
  return {
    id: scan.id,
    created_at: scan.createdAt,
    user_id: scan.userId,
    original_image: scan.originalImage,
    image_url: scan.imageUrl,
    effects: scan.effects as AdminScanEffect[],
    mode: scan.mode,
  };
}

export function mapAdminRecommendation(recommendation: Recommendation): AdminRecommendationRecord {
  return {
    id: recommendation.id,
    scan_id: recommendation.scanId,
    product_id: recommendation.productId,
    reason: recommendation.reason,
    created_at: recommendation.createdAt,
  };
}

export function mapAdminMakeupCatalogItem(item: MakeupCatalogItem) {
  return {
    productId: item.productId,
    name: item.name,
    description: item.description,
    image: item.image,
    externalLink: item.externalLink,
    brand: item.brand,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    apiCategoryKey: item.apiCategoryKey,
    primaryColor: item.primaryColor,
    colorIntensity: item.colorIntensity ?? null,
    texture: item.texture ?? null,
  };
}
