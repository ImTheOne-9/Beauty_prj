import type { ISubscriptionRepository } from '@/core/interfaces';
import type { Subscription, CreateSubscriptionInput } from '@/core/entities';
import { supabase } from '@/infrastructure/supabase/client';

/**
 * Supabase implementation of ISubscriptionRepository.
 */
export class SupabaseSubscriptionRepository implements ISubscriptionRepository {
  async getActiveByUserId(userId: string): Promise<Subscription | null> {
    const { data, error } = await (supabase as any)
      .from('subscriptions')
      .select(`*, plan:plans(id, name, slug, price, billing_interval)`)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? mapRowToSubscription(data) : null;
  }

  async getAll(): Promise<Subscription[]> {
    const { data, error } = await (supabase as any)
      .from('subscriptions')
      .select(`*, plan:plans(id, name, slug, price, billing_interval)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data as any[]) ?? []).map(mapRowToSubscription);
  }

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    const row = {
      user_id: input.userId,
      plan_id: input.planId,
      status: input.status,
      started_at: input.startedAt,
      expires_at: input.expiresAt,
    };
    const { data, error } = await (supabase as any)
      .from('subscriptions')
      .insert(row)
      .select(`*, plan:plans(id, name, slug, price, billing_interval)`)
      .single();
    if (error) throw error;
    return mapRowToSubscription(data);
  }

  async update(id: string, patch: Partial<Subscription>): Promise<Subscription> {
    const row: Record<string, unknown> = {};
    if (patch.planId !== undefined) row.plan_id = patch.planId;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.startedAt !== undefined) row.started_at = patch.startedAt;
    if (patch.cancelledAt !== undefined) row.cancelled_at = patch.cancelledAt;
    if (patch.expiresAt !== undefined) row.expires_at = patch.expiresAt;

    const { data, error } = await (supabase as any)
      .from('subscriptions')
      .update(row)
      .eq('id', id)
      .select(`*, plan:plans(id, name, slug, price, billing_interval)`)
      .single();
    if (error) throw error;
    return mapRowToSubscription(data);
  }

  async cancel(id: string): Promise<Subscription> {
    return this.update(id, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    } as any);
  }
}

function mapRowToSubscription(row: any): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    plan: row.plan
      ? {
          id: row.plan.id,
          name: row.plan.name,
          slug: row.plan.slug,
          price: row.plan.price,
          billingInterval: row.plan.billing_interval,
        }
      : undefined,
  };
}
