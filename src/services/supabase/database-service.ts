import { dependencies } from "@/app/providers/DependencyProvider";
import type { Json } from "@/services/supabase/client";
import type { ScanResult, Order } from "@/core/entities";

type SaveRecommendationInput = {
  productId: string;
  reason?: string;
};

export type AdminProductRecord = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  external_url: string | null;
  brand: string | null;
  category_id: string;
  created_at: string;
};

export type AdminApiKeyRecord = {
  id: string;
  name: string | null;
  key_value?: string | null;
  provider: string | null;
  is_active: boolean;
  created_at: string;
};

export type AdminScanRecord = {
  id: string;
  created_at: string;
  user_id: string;
  original_image: string | null;
  image_url: string | null;
  effects: any[];
  mode: "api" | "demo";
};

export type AdminRecommendationRecord = {
  id: string;
  scan_id: string;
  product_id: string;
  reason: string;
  created_at: string;
};

export type AdminCategoryRecord = {
  id: string;
  name: string;
  api_category_key: string;
  created_at: string;
};

export type AdminProductConfigRecord = {
  id: string;
  product_id: string;
  category_id: string;
  hex_color?: string | null;
  primary_color: string | null;
  color_intensity?: number | string | null;
  pattern_name?: string | null;
  texture: string | null;
  extra_params?: Json | null;
  created_at: string;
};

export type ProductConfigInput = Omit<AdminProductConfigRecord, "id" | "created_at">;

export type AdminProductVariantRecord = {
  id: string;
  product_id: string;
  name: string | null;
  color_hex: string;
  texture: string | null;
  shimmer_color: string | null;
  image_url: string | null;
  sku: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type ProductVariantInput = Omit<
  AdminProductVariantRecord,
  "id" | "created_at"
>;

export type AdminUserProfileRecord = {
  id: string;
  email: string;
  role: string;
  subscription_tier: string;
  updated_at: string;
  created_at: string;
};

export type CreateProductInput = Omit<AdminProductRecord, "id" | "created_at">;

export type CreateApiKeyInput = Omit<AdminApiKeyRecord, "id" | "created_at">;

export type UpdateProductInput = Partial<CreateProductInput>;

export type UpdateApiKeyInput = Partial<CreateApiKeyInput>;

export type MakeupCatalogRow = {
  productId: string;
  name: string;
  description: string | null;
  image: string;
  externalLink: string;
  brand: string | null;
  categoryId: string;
  categoryName: string;
  apiCategoryKey: string;
  primaryColor: string | null;
  colorIntensity: number | null;
  texture: string | null;
};

export type Plan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  billing_interval: "month" | "year";
  scan_limit: number;
  history_days: number;
  description: string | null;
  features: string[];
  badge: string | null;
  is_active: boolean;
  created_at: string;
};

export type SubscriptionStatus =
  | "active"
  | "cancelled"
  | "expired"
  | "pending";

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  plan?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    billing_interval: string;
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapProductToRecord(p: any): AdminProductRecord {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    image_url: p.imageUrl,
    external_url: p.externalUrl,
    brand: p.brand,
    category_id: p.categoryId,
    created_at: p.createdAt,
  };
}

function mapVariantToRecord(v: any): AdminProductVariantRecord {
  return {
    id: v.id,
    product_id: v.productId,
    name: v.name,
    color_hex: v.colorHex,
    texture: v.texture,
    shimmer_color: v.shimmerColor,
    image_url: v.imageUrl,
    sku: v.sku,
    sort_order: v.sortOrder,
    is_active: v.isActive,
    created_at: v.createdAt,
  };
}

function mapConfigToRecord(c: any): AdminProductConfigRecord {
  return {
    id: c.id,
    product_id: c.productId,
    category_id: c.categoryId,
    primary_color: c.primaryColor,
    texture: c.texture,
    hex_color: c.hexColor ?? null,
    color_intensity: c.colorIntensity ?? null,
    pattern_name: c.patternName ?? null,
    extra_params: c.extraParams as Json,
    created_at: c.createdAt,
  };
}

function mapCategoryToRecord(c: any): AdminCategoryRecord {
  return {
    id: c.id,
    name: c.name,
    api_category_key: c.apiCategoryKey,
    created_at: c.createdAt,
  };
}

function mapApiKeyToRecord(k: any): AdminApiKeyRecord {
  return {
    id: k.id,
    name: k.name,
    key_value: k.keyValue ?? null,
    provider: k.provider,
    is_active: k.isActive,
    created_at: k.createdAt,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const databaseService = {
  // ── Makeup Catalog ──────────────────────────────────────────────────────────

  async getMakeupCatalog(): Promise<MakeupCatalogRow[]> {
    const items = await dependencies.makeupCatalogRepo.getMakeupCatalog();
    return items.map((item) => ({
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

  // ── Products ────────────────────────────────────────────────────────────────

  async getProducts() {
    const products = await dependencies.productRepo.getAll();
    return products.map(mapProductToRecord);
  },

  async getAdminProducts() {
    const products = await dependencies.productRepo.getAll();
    return products.map(mapProductToRecord);
  },

  async createProduct(input: CreateProductInput) {
    const product = await dependencies.productRepo.create({
      name: input.name,
      description: input.description,
      imageUrl: input.image_url,
      externalUrl: input.external_url,
      brand: input.brand,
      categoryId: input.category_id,
    });
    return mapProductToRecord(product);
  },

  async updateProduct(id: string, input: UpdateProductInput) {
    const product = await dependencies.productRepo.update(id, {
      name: input.name,
      description: input.description,
      imageUrl: input.image_url,
      externalUrl: input.external_url,
      brand: input.brand,
      categoryId: input.category_id,
    });
    return mapProductToRecord(product);
  },

  async deleteProduct(id: string) {
    await dependencies.productRepo.delete(id);
  },

  async getAdminProductVariants() {
    const variants = await dependencies.productVariantRepo.getAll();
    return variants.map(mapVariantToRecord);
  },

  async replaceProductVariants(
    productId: string,
    variants: Omit<ProductVariantInput, "product_id">[],
  ) {
    const result = await dependencies.productVariantRepo.replaceForProduct(
      productId,
      variants.map((v) => ({
        name: v.name ?? null,
        colorHex: v.color_hex,
        texture: v.texture ?? null,
        shimmerColor: v.shimmer_color ?? null,
        imageUrl: v.image_url ?? null,
        sku: v.sku ?? null,
        sortOrder: v.sort_order,
        isActive: v.is_active,
      })),
    );
    return result.map(mapVariantToRecord);
  },

  async deleteProductVariant(id: string) {
    await dependencies.productVariantRepo.delete(id);
  },

  // ── Product Configs ─────────────────────────────────────────────────────────

  async getAdminProductConfigs() {
    const configs = await dependencies.productConfigRepo.getAll();
    return configs.map(mapConfigToRecord);
  },

  async getProductConfigsByProductId(productId: string) {
    const configs = await dependencies.productConfigRepo.getByProductId(productId);
    return configs.map(mapConfigToRecord);
  },

  async createProductConfig(input: ProductConfigInput) {
    const config = await dependencies.productConfigRepo.create({
      productId: input.product_id,
      categoryId: input.category_id,
      primaryColor: input.primary_color,
      texture: input.texture,
    });
    return mapConfigToRecord(config);
  },

  async updateProductConfig(id: string, input: Partial<ProductConfigInput>) {
    const config = await dependencies.productConfigRepo.update(id, {
      categoryId: input.category_id,
      primaryColor: input.primary_color,
      texture: input.texture,
    });
    return mapConfigToRecord(config);
  },

  async deleteProductConfig(id: string) {
    await dependencies.productConfigRepo.delete(id);
  },

  async replaceProductConfigs(
    productId: string,
    configs: Array<{
      effect_category: string;
      primary_color: string | null;
      effect_data: Record<string, unknown>;
    }>,
  ) {
    const result = await dependencies.productConfigRepo.replaceForProduct(productId, configs);
    return result.map(mapConfigToRecord);
  },

  // ── Categories ──────────────────────────────────────────────────────────────

  async getAdminCategories() {
    const categories = await dependencies.categoryRepo.getAll();
    return categories.map(mapCategoryToRecord);
  },

  async getCategories() {
    const categories = await dependencies.categoryRepo.getAll();
    return categories.map(mapCategoryToRecord);
  },

  async createCategory(input: Omit<AdminCategoryRecord, "id" | "created_at">) {
    const category = await dependencies.categoryRepo.create({
      name: input.name,
      apiCategoryKey: input.api_category_key,
    });
    return mapCategoryToRecord(category);
  },

  async updateCategory(
    id: string,
    input: Partial<Omit<AdminCategoryRecord, "id" | "created_at">>,
  ) {
    const category = await dependencies.categoryRepo.update(id, {
      name: input.name,
      apiCategoryKey: input.api_category_key,
    });
    return mapCategoryToRecord(category);
  },

  async deleteCategory(id: string) {
    await dependencies.categoryRepo.delete(id);
  },

  // ── API Keys ────────────────────────────────────────────────────────────────

  async getAdminApiKeys() {
    const keys = await dependencies.apiKeyRepo.getAll();
    return keys.map((key) => ({
      id: key.id,
      name: key.name,
      provider: key.provider,
      is_active: key.isActive,
      created_at: key.createdAt,
    }));
  },

  async createApiKey(input: CreateApiKeyInput) {
    const key = await dependencies.apiKeyRepo.create({
      name: input.name ?? null,
      keyValue: input.key_value ?? null,
      provider: input.provider ?? null,
      isActive: input.is_active ?? true,
    });
    return mapApiKeyToRecord(key);
  },

  async updateApiKey(id: string, input: UpdateApiKeyInput) {
    const key = await dependencies.apiKeyRepo.update(id, {
      name: input.name,
      keyValue: input.key_value,
      provider: input.provider,
      isActive: input.is_active,
    });
    return mapApiKeyToRecord(key);
  },

  async deleteApiKey(id: string) {
    await dependencies.apiKeyRepo.delete(id);
  },

  // ── Scans ───────────────────────────────────────────────────────────────────

  async getScanHistory(userId: string) {
    const scans = await dependencies.scanRepo.getScanHistory(userId);
    return scans.map((s) => ({
      id: s.id,
      created_at: s.createdAt,
      user_id: s.userId,
      original_image: s.originalImage,
      image_url: s.imageUrl,
      effects: s.effects as any[],
      mode: s.mode,
    }));
  },

  async getScanCountThisMonth(userId: string) {
    return dependencies.scanRepo.getScanCountThisMonth(userId);
  },

  async getAdminScans() {
    const scans = await dependencies.scanRepo.getAdminScans();
    return scans.map((s) => ({
      id: s.id,
      created_at: s.createdAt,
      user_id: s.userId,
      original_image: s.originalImage,
      image_url: s.imageUrl,
      effects: s.effects as any[],
      mode: s.mode,
    }));
  },

  async deleteScan(id: string) {
    await dependencies.scanRepo.deleteScan(id);
  },

  async saveScan(userId: string, scanResult: ScanResult) {
    return dependencies.scanRepo.saveScan(userId, scanResult);
  },

  // ── Recommendations ─────────────────────────────────────────────────────────

  async saveRecommendations(scanId: string, items: SaveRecommendationInput[]) {
    await dependencies.recommendationRepo.save(
      scanId,
      items.map((item) => ({
        productId: item.productId,
        reason: item.reason,
      })),
    );
  },

  async getAdminRecommendations() {
    const recs = await dependencies.recommendationRepo.getAll();
    return recs.map((r: any) => ({
      id: r.id,
      scan_id: r.scanId,
      product_id: r.productId,
      reason: r.reason,
      created_at: r.createdAt,
    }));
  },

  // ── Users / Profiles ────────────────────────────────────────────────────────

  async getProfiles() {
    const profiles = await dependencies.userRepo.getProfiles();
    return profiles.map((p: any) => ({
      id: p.id,
      email: p.email,
      role: p.role,
      updated_at: p.updated_at,
    }));
  },

  async getUsersWithRoles() {
    const users = (await dependencies.userRepo.getUsersWithRoles()) as any[];
    return users.map((u: any) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      subscription_tier: u.subscriptionTier,
      updated_at: u.updatedAt,
      created_at: u.createdAt,
    }));
  },

  async updateUserRole(userId: string, role: string) {
    const users = (await dependencies.userRepo.updateUserRole(userId, role)) as any[];
    return users.map((u: any) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      updated_at: u.updated_at ?? u.updatedAt,
      created_at: u.created_at ?? u.createdAt,
    }));
  },

  async updateUserSubscriptionTier(userId: string, subscriptionTier: string) {
    const user = (await dependencies.userRepo.updateUserSubscriptionTier(userId, subscriptionTier)) as any;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      updated_at: user.updated_at ?? user.updatedAt,
      created_at: user.created_at ?? user.createdAt,
    };
  },

  async createUserWithRole(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "admin" | "user",
    planId: string = "",
  ) {
    return dependencies.userRepo.createUserWithRole(email, password, firstName, lastName, role, planId);
  },

  async deleteUserRole(userId: string) {
    return dependencies.userRepo.deleteUser(userId);
  },

  // ── Orders (localStorage) ───────────────────────────────────────────────────

  getOrders(): Order[] {
    return dependencies.orderRepo.getAll();
  },

  createOrder(order: Order): Order {
    return dependencies.orderRepo.create(order);
  },

  deleteOrder(orderId: string): Order[] {
    return dependencies.orderRepo.delete(orderId);
  },

  updateOrderStatus(orderId: string, status: "pending" | "completed" | "canceled"): Order[] {
    return dependencies.orderRepo.updateStatus(orderId, status);
  },

  seedOrders(): Order[] {
    return dependencies.orderRepo.getAll();
  },

  // ── Plans ───────────────────────────────────────────────────────────────────

  async getPlans() {
    const plans = await dependencies.planRepo.getAll();
    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      billing_interval: p.billingInterval,
      scan_limit: p.scanLimit,
      history_days: p.historyDays,
      description: p.description,
      features: p.features,
      badge: p.badge,
      is_active: p.isActive,
      created_at: p.createdAt,
    }));
  },

  async createPlan(plan: any) {
    const created = await dependencies.planRepo.create({
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
    return {
      id: created.id,
      name: created.name,
      slug: created.slug,
      price: created.price,
      billing_interval: created.billingInterval,
      scan_limit: created.scanLimit,
      history_days: created.historyDays,
      description: created.description,
      features: created.features,
      badge: created.badge,
      is_active: created.isActive,
      created_at: created.createdAt,
    };
  },

  async updatePlan(id: string, patch: any) {
    const updated = await dependencies.planRepo.update(id, {
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
    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      price: updated.price,
      billing_interval: updated.billingInterval,
      scan_limit: updated.scanLimit,
      history_days: updated.historyDays,
      description: updated.description,
      features: updated.features,
      badge: updated.badge,
      is_active: updated.isActive,
      created_at: updated.createdAt,
    };
  },

  async deletePlan(id: string) {
    await dependencies.planRepo.delete(id);
  },

  // ── Subscriptions ───────────────────────────────────────────────────────────

  async getSubscriptions() {
    const subs = await dependencies.subscriptionRepo.getAll();
    return subs.map((s) => ({
      id: s.id,
      user_id: s.userId,
      plan_id: s.planId,
      status: s.status,
      started_at: s.startedAt,
      expires_at: s.expiresAt,
      cancelled_at: s.cancelledAt,
      created_at: s.createdAt,
      plan: s.plan
        ? {
            id: s.plan.id,
            name: s.plan.name,
            slug: s.plan.slug,
            price: s.plan.price,
            billing_interval: s.plan.billingInterval,
          }
        : undefined,
    }));
  },

  async createSubscription(input: {
    user_id: string;
    plan_id: string;
    status: SubscriptionStatus;
    started_at: string;
    expires_at: string | null;
  }) {
    const created = await dependencies.subscriptionRepo.create({
      userId: input.user_id,
      planId: input.plan_id,
      status: input.status,
      startedAt: input.started_at,
      expiresAt: input.expires_at,
    });
    return {
      id: created.id,
      user_id: created.userId,
      plan_id: created.planId,
      status: created.status,
      started_at: created.startedAt,
      expires_at: created.expiresAt,
      cancelled_at: created.cancelledAt,
      created_at: created.createdAt,
    };
  },

  async updateSubscription(id: string, patch: any) {
    const updated = await dependencies.subscriptionRepo.update(id, {
      status: patch.status,
      expiresAt: patch.expires_at,
      cancelledAt: patch.cancelled_at,
    });
    return {
      id: updated.id,
      user_id: updated.userId,
      plan_id: updated.planId,
      status: updated.status,
      started_at: updated.startedAt,
      expires_at: updated.expiresAt,
      cancelled_at: updated.cancelledAt,
      created_at: updated.createdAt,
    };
  },

  async cancelSubscription(id: string) {
    const updated = await dependencies.subscriptionRepo.cancel(id);
    return {
      id: updated.id,
      user_id: updated.userId,
      plan_id: updated.planId,
      status: updated.status,
      started_at: updated.startedAt,
      expires_at: updated.expiresAt,
      cancelled_at: updated.cancelledAt,
      created_at: updated.createdAt,
    };
  },
};
