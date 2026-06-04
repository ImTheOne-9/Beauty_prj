import type { IPlanRepository } from '@/core/interfaces';
import type { Plan, CreatePlanInput, UpdatePlanInput } from '@/core/entities';
import { supabase } from '@/infrastructure/supabase/client';

/**
 * Supabase implementation of IPlanRepository.
 */
export class SupabasePlanRepository implements IPlanRepository {
  async getAll(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('plans' as any)
      .select('*')
      .order('price', { ascending: true });
    if (error) throw error;
    return ((data as any[]) ?? []).map(mapRowToPlan);
  }

  async getActivePlans(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('plans' as any)
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });
    if (error) throw new Error((error as any).message);
    return ((data as any[]) ?? []).map(mapRowToPlan);
  }

  async create(plan: CreatePlanInput): Promise<Plan> {
    const row = mapPlanToRow(plan);
    const { data, error } = await (supabase as any).from('plans').insert(row).select().single();
    if (error) throw error;
    return mapRowToPlan(data);
  }

  async update(id: string, patch: UpdatePlanInput): Promise<Plan> {
    const row = mapPlanToRow(patch);
    const { data, error } = await (supabase as any).from('plans').update(row).eq('id', id).select().single();
    if (error) throw error;
    return mapRowToPlan(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await (supabase as any).from('plans').delete().eq('id', id);
    if (error) throw error;
  }
}

function mapRowToPlan(row: any): Plan {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    billingInterval: row.billing_interval,
    scanLimit: row.scan_limit,
    historyDays: row.history_days,
    description: row.description,
    features: row.features ?? [],
    badge: row.badge,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function mapPlanToRow(plan: Partial<CreatePlanInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (plan.name !== undefined) row.name = plan.name;
  if (plan.slug !== undefined) row.slug = plan.slug;
  if (plan.price !== undefined) row.price = plan.price;
  if (plan.billingInterval !== undefined) row.billing_interval = plan.billingInterval;
  if (plan.scanLimit !== undefined) row.scan_limit = plan.scanLimit;
  if (plan.historyDays !== undefined) row.history_days = plan.historyDays;
  if (plan.description !== undefined) row.description = plan.description;
  if (plan.features !== undefined) row.features = plan.features;
  if (plan.badge !== undefined) row.badge = plan.badge;
  if (plan.isActive !== undefined) row.is_active = plan.isActive;
  return row;
}
