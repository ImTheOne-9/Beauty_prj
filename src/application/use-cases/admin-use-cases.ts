import type { IAdminRepository } from '@/core/interfaces';

type AdminUseCaseDependencies = {
  productRepo: any;
  productConfigRepo: any;
  productVariantRepo: any;
  categoryRepo: any;
  apiKeyRepo: any;
  scanRepo: any;
  recommendationRepo: any;
  userRepo: any;
  orderRepo: any;
  planRepo: any;
  subscriptionRepo: any;
  makeupCatalogRepo: any;
};

function mapProduct(product: any) {
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

function mapVariant(variant: any) {
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

function mapConfig(config: any) {
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

function mapCategory(category: any) {
  return {
    id: category.id,
    name: category.name,
    api_category_key: category.apiCategoryKey,
    created_at: category.createdAt,
  };
}

function mapApiKey(key: any) {
  return {
    id: key.id,
    name: key.name,
    key_value: key.keyValue ?? null,
    provider: key.provider,
    is_active: key.isActive,
    created_at: key.createdAt,
  };
}

function mapPlan(plan: any) {
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

function mapSubscription(subscription: any) {
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

function mapScan(scan: any) {
  return {
    id: scan.id,
    created_at: scan.createdAt,
    user_id: scan.userId,
    original_image: scan.originalImage,
    image_url: scan.imageUrl,
    effects: scan.effects,
    mode: scan.mode,
  };
}

export function createAdminUseCases(adminRepo: IAdminRepository, deps: AdminUseCaseDependencies) {
  return {
    pingDatabase: () => adminRepo.pingDatabase(),
    getProfilesWithPlans: () => adminRepo.getProfilesWithPlans(),
    updateUserProfile: (input: any) => adminRepo.updateUserProfile(input),

    async getMakeupCatalog() {
      const items = await deps.makeupCatalogRepo.getMakeupCatalog();
      return items.map((item: any) => ({
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
      }));
    },

    async getProducts() {
      const products = await deps.productRepo.getAll();
      return products.map(mapProduct);
    },
    async getAdminProducts() {
      const products = await deps.productRepo.getAll();
      return products.map(mapProduct);
    },
    async createProduct(input: any) {
      const product = await deps.productRepo.create({
        name: input.name,
        description: input.description,
        imageUrl: input.image_url,
        externalUrl: input.external_url,
        brand: input.brand,
        categoryId: input.category_id,
      });
      return mapProduct(product);
    },
    async updateProduct(id: string, input: any) {
      const product = await deps.productRepo.update(id, {
        name: input.name,
        description: input.description,
        imageUrl: input.image_url,
        externalUrl: input.external_url,
        brand: input.brand,
        categoryId: input.category_id,
      });
      return mapProduct(product);
    },
    deleteProduct: (id: string) => deps.productRepo.delete(id),

    async getAdminProductVariants() {
      const variants = await deps.productVariantRepo.getAll();
      return variants.map(mapVariant);
    },
    async replaceProductVariants(productId: string, variants: any[]) {
      const result = await deps.productVariantRepo.replaceForProduct(
        productId,
        variants.map((variant) => ({
          name: variant.name ?? null,
          colorHex: variant.color_hex,
          texture: variant.texture ?? null,
          shimmerColor: variant.shimmer_color ?? null,
          imageUrl: variant.image_url ?? null,
          sku: variant.sku ?? null,
          sortOrder: variant.sort_order,
          isActive: variant.is_active,
        })),
      );
      return result.map(mapVariant);
    },
    deleteProductVariant: (id: string) => deps.productVariantRepo.delete(id),

    async getAdminProductConfigs() {
      const configs = await deps.productConfigRepo.getAll();
      return configs.map(mapConfig);
    },
    async getProductConfigsByProductId(productId: string) {
      const configs = await deps.productConfigRepo.getByProductId(productId);
      return configs.map(mapConfig);
    },
    async createProductConfig(input: any) {
      const config = await deps.productConfigRepo.create({
        productId: input.product_id,
        categoryId: input.category_id,
        primaryColor: input.primary_color,
        texture: input.texture,
      });
      return mapConfig(config);
    },
    async updateProductConfig(id: string, input: any) {
      const config = await deps.productConfigRepo.update(id, {
        categoryId: input.category_id,
        primaryColor: input.primary_color,
        texture: input.texture,
      });
      return mapConfig(config);
    },
    deleteProductConfig: (id: string) => deps.productConfigRepo.delete(id),
    async replaceProductConfigs(productId: string, configs: any[]) {
      const result = await deps.productConfigRepo.replaceForProduct(productId, configs);
      return result.map(mapConfig);
    },

    async getAdminCategories() {
      const categories = await deps.categoryRepo.getAll();
      return categories.map(mapCategory);
    },
    async getCategories() {
      const categories = await deps.categoryRepo.getAll();
      return categories.map(mapCategory);
    },
    async createCategory(input: any) {
      const category = await deps.categoryRepo.create({
        name: input.name,
        apiCategoryKey: input.api_category_key,
      });
      return mapCategory(category);
    },
    async updateCategory(id: string, input: any) {
      const category = await deps.categoryRepo.update(id, {
        name: input.name,
        apiCategoryKey: input.api_category_key,
      });
      return mapCategory(category);
    },
    deleteCategory: (id: string) => deps.categoryRepo.delete(id),

    async getAdminApiKeys() {
      const keys = await deps.apiKeyRepo.getAll();
      return keys.map(mapApiKey);
    },
    async createApiKey(input: any) {
      const key = await deps.apiKeyRepo.create({
        name: input.name ?? null,
        keyValue: input.key_value ?? null,
        provider: input.provider ?? null,
        isActive: input.is_active ?? true,
      });
      return mapApiKey(key);
    },
    async updateApiKey(id: string, input: any) {
      const key = await deps.apiKeyRepo.update(id, {
        name: input.name,
        keyValue: input.key_value,
        provider: input.provider,
        isActive: input.is_active,
      });
      return mapApiKey(key);
    },
    deleteApiKey: (id: string) => deps.apiKeyRepo.delete(id),

    async getScanHistory(userId: string) {
      const scans = await deps.scanRepo.getScanHistory(userId);
      return scans.map(mapScan);
    },
    getScanCountThisMonth: (userId: string) => deps.scanRepo.getScanCountThisMonth(userId),
    async getAdminScans() {
      const scans = await deps.scanRepo.getAdminScans();
      return scans.map(mapScan);
    },
    deleteScan: (id: string) => deps.scanRepo.deleteScan(id),
    saveScan: (userId: string, scanResult: any) => deps.scanRepo.saveScan(userId, scanResult),
    async saveRecommendations(scanId: string, items: any[]) {
      await deps.recommendationRepo.save(
        scanId,
        items.map((item) => ({
          productId: item.productId,
          reason: item.reason,
        })),
      );
    },
    async getAdminRecommendations() {
      const recommendations = await deps.recommendationRepo.getAll();
      return recommendations.map((recommendation: any) => ({
        id: recommendation.id,
        scan_id: recommendation.scanId,
        product_id: recommendation.productId,
        reason: recommendation.reason,
        created_at: recommendation.createdAt,
      }));
    },

    async getProfiles() {
      const profiles = await deps.userRepo.getProfiles();
      return profiles.map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        role: profile.role,
        updated_at: profile.updated_at,
      }));
    },
    async getUsersWithRoles() {
      const users = await deps.userRepo.getUsersWithRoles();
      return users.map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        subscription_tier: user.subscriptionTier,
        updated_at: user.updatedAt,
        created_at: user.createdAt,
      }));
    },
    async updateUserRole(userId: string, role: string) {
      const users = await deps.userRepo.updateUserRole(userId, role);
      return users.map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        updated_at: user.updated_at ?? user.updatedAt,
        created_at: user.created_at ?? user.createdAt,
      }));
    },
    async updateUserSubscriptionTier(userId: string, subscriptionTier: string) {
      const user = await deps.userRepo.updateUserSubscriptionTier(userId, subscriptionTier);
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        updated_at: user.updated_at ?? user.updatedAt,
        created_at: user.created_at ?? user.createdAt,
      };
    },
    createUserWithRole: (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      role: 'admin' | 'user',
      planId = '',
    ) => deps.userRepo.createUserWithRole(email, password, firstName, lastName, role, planId),
    deleteUserRole: (userId: string) => deps.userRepo.deleteUser(userId),

    getOrders: () => deps.orderRepo.getAll(),
    createOrder: (order: any) => deps.orderRepo.create(order),
    deleteOrder: (orderId: string) => deps.orderRepo.delete(orderId),
    updateOrderStatus: (orderId: string, status: 'pending' | 'completed' | 'canceled') =>
      deps.orderRepo.updateStatus(orderId, status),
    seedOrders: () => deps.orderRepo.getAll(),

    async getPlans() {
      const plans = await deps.planRepo.getAll();
      return plans.map(mapPlan);
    },
    async createPlan(plan: any) {
      const created = await deps.planRepo.create({
        name: plan.name,
        slug: plan.slug,
        price: plan.price,
        billingInterval: plan.billing_interval,
        scanLimit: plan.scan_limit,
        historyDays: plan.history_days,
        description: plan.description ?? null,
        features: plan.features,
        badge: plan.badge ?? null,
        isActive: plan.is_active ?? true,
      });
      return mapPlan(created);
    },
    async updatePlan(id: string, patch: any) {
      const updated = await deps.planRepo.update(id, {
        name: patch.name,
        slug: patch.slug,
        price: patch.price,
        billingInterval: patch.billing_interval,
        scanLimit: patch.scan_limit,
        historyDays: patch.history_days,
        description: patch.description,
        features: patch.features,
        badge: patch.badge,
        isActive: patch.is_active,
      });
      return mapPlan(updated);
    },
    deletePlan: (id: string) => deps.planRepo.delete(id),

    async getSubscriptions() {
      const subscriptions = await deps.subscriptionRepo.getAll();
      return subscriptions.map(mapSubscription);
    },
    async createSubscription(input: any) {
      const created = await deps.subscriptionRepo.create({
        userId: input.user_id,
        planId: input.plan_id,
        status: input.status,
        startedAt: input.started_at,
        expiresAt: input.expires_at,
      });
      return mapSubscription(created);
    },
    async updateSubscription(id: string, patch: any) {
      const updated = await deps.subscriptionRepo.update(id, {
        planId: patch.plan_id,
        status: patch.status,
        startedAt: patch.started_at,
        expiresAt: patch.expires_at,
        cancelledAt: patch.cancelled_at,
      });
      return mapSubscription(updated);
    },
    async cancelSubscription(id: string) {
      const updated = await deps.subscriptionRepo.cancel(id);
      return mapSubscription(updated);
    },
  };
}
