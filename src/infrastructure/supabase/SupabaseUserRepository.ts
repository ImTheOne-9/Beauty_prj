import type { IUserRepository } from '@/core/interfaces';
import type { AdminUserProfile } from '@/core/entities';
import { supabase } from '@/infrastructure/supabase/client';
import {
  getSubscriptionTier,
  setSubscriptionTier,
} from '@/shared/lib/subscription';

/**
 * Supabase implementation of IUserRepository (admin user management).
 */
export class SupabaseUserRepository implements IUserRepository {
  async getProfiles(): Promise<Array<{ id: string; email: string; role: string; updated_at: string }>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, updated_at')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as any;
  }

  async getUsersWithRoles(): Promise<AdminUserProfile[]> {
    try {
      const profiles = await this.getProfiles();
      const stored = localStorage.getItem('lumina_user_roles');
      let localOverrides: Array<{ id: string; email: string; role: string; created_at: string }> = [];
      if (stored) {
        try { localOverrides = JSON.parse(stored); } catch { /* ignore */ }
      }
      const mapped = profiles.map((profile: any) => {
        const local = localOverrides.find(
          (u) => u.email.toLowerCase() === profile.email.toLowerCase(),
        );
        return {
          id: profile.id,
          email: profile.email,
          role: local?.role ?? profile.role,
          subscriptionTier: 'free',
          updatedAt: profile.updated_at,
          createdAt: profile.updated_at,
        };
      });
      if (mapped.length > 0) return mapped;
    } catch { /* fallback */ }

    const stored = localStorage.getItem('lumina_user_roles');
    if (stored) {
      try {
        const users = JSON.parse(stored) as Array<{ id: string; email: string; role: string; created_at: string }>;
        return users.map((user) => ({
          id: user.id,
          email: user.email,
          role: user.role === 'admin' ? 'admin' : 'user',
          subscriptionTier: getSubscriptionTier(user.id) ?? 'free',
          updatedAt: user.created_at,
          createdAt: user.created_at,
        }));
      } catch { /* ignore */ }
    }

    const defaultUsers = [
      { id: 'u1', email: 'admin@lumina.ai', role: 'admin', created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString() },
      { id: 'u6', email: 'guest-customer@gmail.com', role: 'user', created_at: new Date().toISOString() },
    ];
    localStorage.setItem('lumina_user_roles', JSON.stringify(defaultUsers));
    defaultUsers.forEach((user) => setSubscriptionTier(user.id, 'free'));
    return defaultUsers.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      subscriptionTier: 'free',
      updatedAt: user.created_at,
      createdAt: user.created_at,
    }));
  }

  async updateUserRole(userId: string, role: string): Promise<AdminUserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() } as any)
        .eq('id', userId)
        .select('id, email, role, updated_at')
        .single();
      if (error) throw error;
      return [{
        id: data.id,
        email: data.email,
        role: data.role,
        subscriptionTier: 'free',
        updatedAt: data.updated_at,
        createdAt: data.updated_at,
      }];
    } catch {
      const users = await this.getUsersWithRoles();
      const updated = users.map((u: any) => u.id === userId ? { ...u, role } : u);
      localStorage.setItem('lumina_user_roles', JSON.stringify(updated));
      return updated;
    }
  }

  async updateUserSubscriptionTier(userId: string, tier: string): Promise<AdminUserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ subscription_tier: tier, updated_at: new Date().toISOString() } as any)
      .eq('id', userId)
      .select('id, email, role, updated_at')
      .single();
    if (error) throw error;
    return {
      id: data.id,
      email: data.email,
      role: data.role,
      subscriptionTier: tier,
      updatedAt: data.updated_at,
      createdAt: data.updated_at,
    };
  }

  async createUserWithRole(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'admin' | 'user',
    planId: string = '',
  ): Promise<unknown> {
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: { email, firstName, lastName, password, role, planId: planId || null },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  }

  async deleteUser(userId: string): Promise<unknown> {
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { userId },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  }
}
