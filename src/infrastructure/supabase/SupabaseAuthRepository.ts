import type { AuthResult, IAuthRepository } from '@/core/interfaces';
import type { UpdateProfileInput, UserProfile } from '@/core/entities';
import { supabase } from '@/infrastructure/supabase/client';
import type { Session } from '@supabase/supabase-js';

export class SupabaseAuthRepository implements IAuthRepository {
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { user: data.user, session: data.session };
  }

  async signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });
    if (error) throw error;
    return { user: data.user, session: data.session };
  }

  async signInWithGoogle(): Promise<{ url: string } | null> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw error;
    return data.url ? { url: data.url } : null;
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPasswordForEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, plans(*)')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProfile(data as Record<string, unknown>) : null;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        avatar_url: input.avatarUrl,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', userId)
      .select('*, plans(*)')
      .single();
    if (error) throw error;
    return mapProfile(data as Record<string, unknown>);
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void): { unsubscribe: () => void } {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return { unsubscribe: () => data.subscription.unsubscribe() };
  }
}

function mapProfile(row: Record<string, unknown>): UserProfile {
  const planRow = row.plans as Record<string, unknown> | null | undefined;
  return {
    id: row.id as string,
    email: row.email as string,
    firstName: (row.first_name as string | null) ?? null,
    lastName: (row.last_name as string | null) ?? null,
    role: row.role === 'admin' ? 'admin' : 'user',
    planId: (row.plan_id as string | null) ?? null,
    plan: planRow
      ? {
          id: planRow.id as string,
          name: planRow.name as string,
          slug: planRow.slug as string,
          price: Number(planRow.price ?? 0),
          billingInterval: String(planRow.billing_interval ?? 'month'),
          scanLimit: Number(planRow.scan_limit ?? 0),
          historyDays: Number(planRow.history_days ?? 0),
          description: (planRow.description as string | null) ?? null,
          features: Array.isArray(planRow.features) ? (planRow.features as string[]) : [],
          badge: (planRow.badge as string | null) ?? null,
          isActive: Boolean(planRow.is_active ?? true),
          createdAt: planRow.created_at as string | undefined,
        }
      : null,
    avatarUrl: (row.avatar_url as string | null) ?? null,
    updatedAt: row.updated_at as string,
    stripeCustomerId: (row.stripe_customer_id as string | null) ?? null,
  };
}
