import type { AdminUseCaseDependencies } from './admin-dependencies';
import { mapAdminApiKey, mapAdminPlan, mapAdminSubscription } from '@/application/mappers/admin-mappers';
import type {
  AdminApiKeyInput,
  AdminPlanInput,
  AdminPlanPatch,
  AdminSubscriptionInput,
  AdminSubscriptionPatch,
} from '@/application/dtos/admin';
import type { Order, OrderStatus } from '@/core/entities';

export function createAdminCommerceUseCases(deps: AdminUseCaseDependencies) {
  return {
    async getAdminApiKeys() {
      const keys = await deps.apiKeyRepo.getAll();
      return keys.map(mapAdminApiKey);
    },
    async createApiKey(input: AdminApiKeyInput) {
      const key = await deps.apiKeyRepo.create({
        name: input.name ?? null,
        keyValue: input.key_value ?? null,
        provider: input.provider ?? null,
        isActive: input.is_active ?? true,
      });
      return mapAdminApiKey(key);
    },
    async updateApiKey(id: string, input: AdminApiKeyInput) {
      const key = await deps.apiKeyRepo.update(id, {
        name: input.name,
        keyValue: input.key_value,
        provider: input.provider,
        isActive: input.is_active,
      });
      return mapAdminApiKey(key);
    },
    deleteApiKey: (id: string) => deps.apiKeyRepo.delete(id),

    getOrders: () => deps.orderRepo.getAll(),
    createOrder: (order: Order) => deps.orderRepo.create(order),
    deleteOrder: (orderId: string) => deps.orderRepo.delete(orderId),
    updateOrderStatus: (orderId: string, status: OrderStatus) =>
      deps.orderRepo.updateStatus(orderId, status),
    seedOrders: () => deps.orderRepo.getAll(),

    async getPlans() {
      const plans = await deps.planRepo.getAll();
      return plans.map(mapAdminPlan);
    },
    async createPlan(plan: AdminPlanInput) {
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
      return mapAdminPlan(created);
    },
    async updatePlan(id: string, patch: AdminPlanPatch) {
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
      return mapAdminPlan(updated);
    },
    deletePlan: (id: string) => deps.planRepo.delete(id),

    async getSubscriptions() {
      const subscriptions = await deps.subscriptionRepo.getAll();
      return subscriptions.map(mapAdminSubscription);
    },
    async createSubscription(input: AdminSubscriptionInput) {
      const created = await deps.subscriptionRepo.create({
        userId: input.user_id,
        planId: input.plan_id,
        status: input.status,
        startedAt: input.started_at,
        expiresAt: input.expires_at,
      });
      return mapAdminSubscription(created);
    },
    async updateSubscription(id: string, patch: AdminSubscriptionPatch) {
      const updated = await deps.subscriptionRepo.update(id, {
        planId: patch.plan_id,
        status: patch.status,
        startedAt: patch.started_at,
        expiresAt: patch.expires_at,
        cancelledAt: patch.cancelled_at,
      });
      return mapAdminSubscription(updated);
    },
    async cancelSubscription(id: string) {
      const updated = await deps.subscriptionRepo.cancel(id);
      return mapAdminSubscription(updated);
    },
  };
}
