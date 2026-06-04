import { supabase } from '@/infrastructure/supabase/client';

type DatabaseService = typeof import('@/services/supabase/database-service').databaseService;

type AdminOperations = {
  pingDatabase(): Promise<void>;
  getProfilesWithPlans(): Promise<any[]>;
  updateUserProfile(input: {
    userId: string;
    planId: string;
    role: string;
    firstName: string;
    lastName: string;
  }): Promise<void>;
};

export function createAdminUseCases(): DatabaseService & AdminOperations {
  const operations: AdminOperations = {
    async pingDatabase() {
      const { error } = await supabase.from('products').select('id').limit(1);
      if (error) throw error;
    },

    async getProfilesWithPlans() {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select(`
          *,
          plan:plans(id, name, slug, price, billing_interval)
        `);
      if (error) throw error;
      return data ?? [];
    },

    async updateUserProfile(input) {
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
    },
  };

  return new Proxy(operations as DatabaseService & AdminOperations, {
    get(target, property, receiver) {
      if (property in target) {
        return Reflect.get(target, property, receiver);
      }

      return async (...args: unknown[]) => {
        const { databaseService } = await import('@/services/supabase/database-service');
        const method = databaseService[property as keyof DatabaseService] as (...params: unknown[]) => unknown;
        return method(...args);
      };
    },
  });
}
