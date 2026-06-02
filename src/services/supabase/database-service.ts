import { supabase, type Json } from "@/services/supabase/client";
import { type ScanResult, type OrderRecord } from "@/shared/lib/types";
import {
  getSubscriptionTier,
  setSubscriptionTier,
} from "@/shared/lib/subscription";
import { storageService } from "./storage-service";

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

type AdminApiKeyRecord = {
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

/**
 * Schema mới sau migration:
 * - effect_category : text  (blush, lip_color, v.v.)
 * - primary_color   : text  (hex màu palette đầu tiên, để hiển thị swatch)
 * - effect_data     : jsonb (toàn bộ effect object gửi lên MakeupAR API)
 *
 * Các cột cũ (hex_color, texture, color_intensity, pattern_name, extra_params)
 * đã bị drop trong migration.
 */
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

/** Input khi create/update config — không cần id và created_at */
export type ProductConfigInput = Omit<AdminProductConfigRecord, "id" | "created_at">;

export type AdminUserProfileRecord = {
  id: string;
  email: string;
  role: string;
  subscription_tier: string;
  updated_at: string;
  created_at: string;
};

type CreateProductInput = Omit<AdminProductRecord, "id" | "created_at">;

type CreateApiKeyInput = Omit<AdminApiKeyRecord, "id" | "created_at">;

type UpdateProductInput = Partial<CreateProductInput>;

type UpdateApiKeyInput = Partial<CreateApiKeyInput>;

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
  patternName: string | null;
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

/** Lấy hex màu đầu tiên từ effect_data để hiển thị swatch */
function extractPrimaryColor(effectData: Record<string, unknown>): string | null {
  const palettes = effectData.palettes as Array<{ color?: string }> | undefined;
  return palettes?.[0]?.color ?? null;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const databaseService = {
  // ── Makeup Catalog ──────────────────────────────────────────────────────────

  async getMakeupCatalog(): Promise<MakeupCatalogRow[]> {
    const [
      { data: products, error: productsError },
      { data: categories, error: categoriesError },
      { data: configs, error: configsError },
    ] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*"),
      supabase.from("product_configs").select("*"),
    ]);

    if (productsError) throw productsError;
    if (categoriesError) throw categoriesError;
    if (configsError) throw configsError;

    const categoryMap = new Map(
      (categories ?? []).map((c) => [c.id, c as AdminCategoryRecord]),
    );

    // Một product có thể có nhiều configs (multi-effect) → group theo product_id
    const configsByProduct = new Map<string, AdminProductConfigRecord[]>();
    for (const raw of configs ?? []) {
      const config = raw as unknown as AdminProductConfigRecord;
      if (!configsByProduct.has(config.product_id)) {
        configsByProduct.set(config.product_id, []);
      }
      configsByProduct.get(config.product_id)!.push(config);
    }

    return ((products ?? []) as AdminProductRecord[]).map((product) => {
      const category = categoryMap.get(product.category_id);
      const productConfigs = configsByProduct.get(product.id) ?? [];
      const firstConfig = productConfigs[0];

      return {
        productId: product.id,
        name: product.name,
        description: product.description,
        image: product.image_url ?? "",
        externalLink: product.external_url ?? "",
        brand: product.brand,
        categoryId: product.category_id,
        categoryName: category?.name ?? "Uncategorized",
        apiCategoryKey: category?.api_category_key ?? "general",
        texture: firstConfig?.texture ?? null,
        primaryColor: firstConfig?.primary_color ?? firstConfig?.hex_color ?? null,
        colorIntensity:
          typeof firstConfig?.color_intensity === "number"
            ? firstConfig.color_intensity
            : typeof firstConfig?.color_intensity === "string"
              ? Number(firstConfig.color_intensity) || null
              : null,
        patternName: firstConfig?.pattern_name ?? null,
      };
    });
  },

  // ── Products ────────────────────────────────────────────────────────────────

  async getProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as AdminProductRecord[];
  },

  async getAdminProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as AdminProductRecord[];
  },

  async createProduct(input: CreateProductInput) {
    const { data, error } = await supabase
      .from("products")
      .insert(input)
      .select("*")
      .single();
    if (error) throw error;
    return data as AdminProductRecord;
  },

  async updateProduct(id: string, input: UpdateProductInput) {
    const { data, error } = await supabase
      .from("products")
      .update(input)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as AdminProductRecord;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  // ── Product Configs ─────────────────────────────────────────────────────────

  async getAdminProductConfigs() {
    const { data, error } = await supabase
      .from("product_configs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as AdminProductConfigRecord[];
  },

  /** Lấy tất cả configs của 1 product — dùng cho ProductWithConfigModal khi edit */
  async getProductConfigsByProductId(productId: string) {
    const { data, error } = await supabase
      .from("product_configs")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as AdminProductConfigRecord[];
  },

  async createProductConfig(input: ProductConfigInput) {
    const payload = {
      product_id: input.product_id,
      category_id: input.category_id,
      primary_color: input.primary_color,
      texture: input.texture,
    };
    const { data, error } = await supabase
      .from("product_configs")
      .insert(payload as any)
      .select("*")
      .single();
    if (error) throw error;
    return data as unknown as AdminProductConfigRecord;
  },

  async updateProductConfig(id: string, input: Partial<ProductConfigInput>) {
    const payload: Record<string, unknown> = {};
    if (input.category_id !== undefined) payload.category_id = input.category_id;
    if (input.primary_color !== undefined) payload.primary_color = input.primary_color;
    if (input.texture !== undefined) payload.texture = input.texture;

    const { data, error } = await supabase
      .from("product_configs")
      .update(payload as any)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as unknown as AdminProductConfigRecord;
  },

  async deleteProductConfig(id: string) {
    const { error } = await supabase.from("product_configs").delete().eq("id", id);
    if (error) throw error;
  },

  /**
   * Replace toàn bộ configs của 1 product.
   * Dùng trong ProductWithConfigModal khi save.
   * Delete all → insert new (đơn giản, atomic hơn diff).
   */
  async replaceProductConfigs(
    productId: string,
    configs: Array<{
      effect_category: string;
      primary_color: string | null;
      effect_data: Record<string, unknown>;
    }>,
  ) {
    // 1. Xóa hết config cũ
    const { error: delErr } = await supabase
      .from("product_configs")
      .delete()
      .eq("product_id", productId);
    if (delErr) throw delErr;

    // 2. Insert mới (nếu có)
    if (configs.length === 0) return [];

    const rows = configs.map((c) => ({
      product_id: productId,
      effect_category: c.effect_category,
      primary_color: c.primary_color ?? extractPrimaryColor(c.effect_data),
      effect_data: c.effect_data as Json,
    }));

    const { data, error: insErr } = await supabase
      .from("product_configs")
      .insert(rows as any)
      .select("*");
    if (insErr) throw insErr;
    return (data ?? []) as unknown as AdminProductConfigRecord[];
  },

  // ── Categories ──────────────────────────────────────────────────────────────

  async getAdminCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as AdminCategoryRecord[];
  },

  async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as AdminCategoryRecord[];
  },

  async createCategory(input: Omit<AdminCategoryRecord, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("categories")
      .insert(input)
      .select("*")
      .single();
    if (error) throw error;
    return data as AdminCategoryRecord;
  },

  async updateCategory(
    id: string,
    input: Partial<Omit<AdminCategoryRecord, "id" | "created_at">>,
  ) {
    const { data, error } = await supabase
      .from("categories")
      .update(input)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as AdminCategoryRecord;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  },

  // ── API Keys ────────────────────────────────────────────────────────────────

  async getAdminApiKeys() {
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, name, provider, is_active, created_at, updated_at") // key_value bị ẩn
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Omit<AdminApiKeyRecord, "key_value">[];
  },

  async createApiKey(input: CreateApiKeyInput) {
    const { data, error } = await supabase.functions.invoke("manage-api-key", {
      body: { action: "create", payload: input },
    });
    if (error) throw error;
    return data;
  },

  async updateApiKey(id: string, input: UpdateApiKeyInput) {
    const { data, error } = await supabase.functions.invoke("manage-api-key", {
      body: { action: "update", id, payload: input },
    });
    if (error) throw error;
    return data;
  },

  async deleteApiKey(id: string) {
    const { error } = await supabase.functions.invoke("manage-api-key", {
      body: { action: "delete", id },
    });
    if (error) throw error;
  },

  // ── Scans ───────────────────────────────────────────────────────────────────

  async getScanHistory(userId: string) {
    const { data, error } = await supabase
      .from("scans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getScanCountThisMonth(userId: string) {
    const startOfMonth = new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
    ).toISOString();
    const { data, error } = await supabase
      .from("scans")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", startOfMonth);
    if (error) throw error;
    return (data ?? []).length;
  },

  async getAdminScans() {
    const { data, error } = await supabase
      .from("scans")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }
    return (data ?? []) as AdminScanRecord[];
  },

  async deleteScan(id: string) {
    const { error } = await supabase.from("scans").delete().eq("id", id);
    if (error) throw error;
  },

  async saveScan(userId: string, scanResult: ScanResult) {
    const { data, error: insertError } = await supabase
      .from("scans")
      .insert({
        user_id: userId,
        original_image: scanResult.originalImage,
        image_url: null,
        effects: scanResult.appliedEffects.filter((e) => e.enabled) as unknown as Json,
        mode: scanResult.mode,
      } as any)
      .select("id")
      .single();

    if (insertError) throw insertError;
    const scanId = data.id;

    const storedResultUrl = await storageService.uploadMakeupResult(
      userId,
      scanResult.resultImageUrl,
      scanId,
    );

    const { error: updateError } = await supabase
      .from("scans")
      .update({ image_url: storedResultUrl })
      .eq("id", scanId);

    if (updateError) throw updateError;
    return scanId;
  },

  // ── Recommendations ─────────────────────────────────────────────────────────

  async saveRecommendations(scanId: string, items: SaveRecommendationInput[]) {
    if (items.length === 0) return;
    const { error } = await supabase.from("recommendations").insert(
      items.map((item) => ({
        scan_id: scanId,
        product_id: item.productId,
        reason: item.reason ?? "",
      })) as any,
    );
    if (error) throw error;
  },

  async getAdminRecommendations() {
    const { data, error } = await supabase
      .from("recommendations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as AdminRecommendationRecord[];
  },

  // ── Users / Profiles ────────────────────────────────────────────────────────

  async getProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, role, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getUsersWithRoles() {
    try {
      const profiles = await this.getProfiles();
      const stored = localStorage.getItem("lumina_user_roles");
      let localOverrides: Array<{ id: string; email: string; role: string; created_at: string }> = [];
      if (stored) {
        try { localOverrides = JSON.parse(stored); } catch { /* ignore */ }
      }
      const mapped = profiles.map((profile) => {
        const local = localOverrides.find(
          (u) => u.email.toLowerCase() === (profile as any).email.toLowerCase(),
        );
        return { ...profile, role: local?.role ?? (profile as any).role, created_at: (profile as any).updated_at };
      });
      if (mapped.length > 0) return mapped;
    } catch { /* fallback */ }

    const stored = localStorage.getItem("lumina_user_roles");
    if (stored) {
      try {
        const users = JSON.parse(stored) as Array<{ id: string; email: string; role: string; created_at: string }>;
        return users.map((user) => ({
          ...user,
          role: user.role === "admin" ? "admin" : "user",
          subscription_tier: getSubscriptionTier(user.id) ?? "free",
        }));
      } catch { /* ignore */ }
    }

    const defaultUsers = [
      { id: "u1", email: "admin@lumina.ai", role: "admin", created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString() },
      { id: "u6", email: "guest-customer@gmail.com", role: "user", created_at: new Date().toISOString() },
    ];
    localStorage.setItem("lumina_user_roles", JSON.stringify(defaultUsers));
    defaultUsers.forEach((user) => setSubscriptionTier(user.id, "free"));
    return defaultUsers.map((user) => ({ ...user, subscription_tier: "free" }));
  },

  async updateUserRole(userId: string, role: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select("id, email, role, updated_at")
        .single();
      if (error) throw error;
      return [{ ...data, created_at: data.updated_at }];
    } catch {
      const users = await this.getUsersWithRoles();
      const updated = users.map((u: any) => u.id === userId ? { ...u, role } : u);
      localStorage.setItem("lumina_user_roles", JSON.stringify(updated));
      return updated;
    }
  },

  async updateUserSubscriptionTier(userId: string, subscriptionTier: string) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ subscription_tier: subscriptionTier, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select("id, email, role, updated_at")
      .single();
    if (error) throw error;
    return { ...data, created_at: data.updated_at };
  },

  async createUserWithRole(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "admin" | "user",
    planId: string = "",
  ) {
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: { email, firstName, lastName, password, role, planId: planId || null },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  },

  async deleteUserRole(userId: string) {
    const { data, error } = await supabase.functions.invoke("delete-user", {
      body: { userId },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  },

  // ── Orders (localStorage) ───────────────────────────────────────────────────

  getOrders(): OrderRecord[] {
    const stored = localStorage.getItem("lumina_orders");
    if (stored) {
      try { return JSON.parse(stored) as OrderRecord[]; } catch { /* ignore */ }
    }
    return this.seedOrders();
  },

  createOrder(order: OrderRecord): OrderRecord {
    const orders = this.getOrders();
    localStorage.setItem("lumina_orders", JSON.stringify([order, ...orders]));
    return order;
  },

  deleteOrder(orderId: string): OrderRecord[] {
    const updated = this.getOrders().filter((o) => o.id !== orderId);
    localStorage.setItem("lumina_orders", JSON.stringify(updated));
    return updated;
  },

  updateOrderStatus(orderId: string, status: "pending" | "completed" | "canceled"): OrderRecord[] {
    const updated = this.getOrders().map((o) => o.id === orderId ? { ...o, status } : o);
    localStorage.setItem("lumina_orders", JSON.stringify(updated));
    return updated;
  },

  seedOrders(): OrderRecord[] {
    const products = [
      { id: "p1", name: "La Roche-Posay Hyalu B5 Serum", category: "Serum", price: 390000, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80" },
      { id: "p2", name: "CeraVe Moisturising Cream", category: "Moisturizer", price: 490000, image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80" },
      { id: "p3", name: "Paula's Choice 2% BHA Liquid Exfoliant", category: "Toner", price: 590000, image: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=400&q=80" },
      { id: "p4", name: "Cetaphil Gentle Skin Cleanser", category: "Cleanser", price: 290000, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80" },
    ];
    const firstNames = ["John", "Jane", "Michael", "Emily", "Chris", "Sarah", "David", "Jessica", "Daniel"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez"];
    const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia"];
    const paymentMethods = ["cod", "momo", "visa", "apple"] as const;
    const statuses = ["completed", "completed", "completed", "pending", "canceled"] as const;

    const orders: OrderRecord[] = Array.from({ length: 24 }, () => {
      const prod = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      return {
        id: `BG-${Math.floor(100000 + Math.random() * 900000)}`,
        productId: prod.id,
        productName: prod.name,
        productImage: prod.image,
        productCategory: prod.category,
        quantity,
        price: prod.price,
        totalPrice: prod.price * quantity,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        shippingInfo: {
          name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
          address: `${Math.floor(Math.random() * 150) + 1} Main St, ${cities[Math.floor(Math.random() * cities.length)]}`,
        },
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 8) * 24 * 3600 * 1000).toISOString(),
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    localStorage.setItem("lumina_orders", JSON.stringify(orders));
    return orders;
  },

  // ── Plans ───────────────────────────────────────────────────────────────────

  async getPlans() {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Plan[];
  },

  async createPlan(plan: any) {
    const { data, error } = await (supabase as any).from("plans").insert(plan).select().single();
    if (error) throw error;
    return data;
  },

  async updatePlan(id: string, patch: any) {
    const { data, error } = await (supabase as any).from("plans").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async deletePlan(id: string) {
    const { error } = await (supabase as any).from("plans").delete().eq("id", id);
    if (error) throw error;
  },

  // ── Subscriptions ───────────────────────────────────────────────────────────

  async getSubscriptions() {
    const { data, error } = await (supabase as any)
      .from("subscriptions")
      .select(`*, plan:plans(id, name, slug, price, billing_interval)`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Subscription[];
  },

  async createSubscription(input: {
    user_id: string;
    plan_id: string;
    status: SubscriptionStatus;
    started_at: string;
    expires_at: string | null;
  }) {
    const { data, error } = await (supabase as any).from("subscriptions").insert(input).select().single();
    if (error) throw error;
    return data as Subscription;
  },

  async updateSubscription(id: string, patch: any) {
    const { data, error } = await (supabase as any).from("subscriptions").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data as Subscription;
  },

  async cancelSubscription(id: string) {
    return this.updateSubscription(id, {
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    });
  },
};
