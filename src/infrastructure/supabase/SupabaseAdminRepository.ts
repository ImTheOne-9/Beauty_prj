import type { AdminProfileWithPlan, IAdminRepository, UpdateAdminUserProfileInput } from '@/core/interfaces';
import { supabase } from '@/infrastructure/supabase/client';

export class SupabaseAdminRepository implements IAdminRepository {
  async pingDatabase(): Promise<void> {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error) throw error;
  }

  async getProfilesWithPlans(): Promise<AdminProfileWithPlan[]> {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select(`
        *,
        plan:plans(id, name, slug, price, billing_interval)
      `);
    if (error) throw error;
    return (data ?? []) as AdminProfileWithPlan[];
  }

  async updateUserProfile(input: UpdateAdminUserProfileInput): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        plan_id: input.planId || null,
        role: input.role,
        first_name: input.firstName,
        last_name: input.lastName,
      } as any)
      .eq('id', input.userId);
    if (error) throw error;
  }
}
