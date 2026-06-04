import type { IAuthRepository, IPlanRepository, ISubscriptionRepository } from '@/core/interfaces';

export function createPlanUseCases(
  planRepo: IPlanRepository,
  subscriptionRepo: ISubscriptionRepository,
  authRepo: IAuthRepository,
) {
  return {
    listActivePlans() {
      return planRepo.getActivePlans();
    },

    getActiveSubscription(userId: string) {
      return subscriptionRepo.getActiveByUserId(userId);
    },

    async subscribeToFreePlan(userId: string, planId: string) {
      const active = await subscriptionRepo.getActiveByUserId(userId);
      if (active) {
        await subscriptionRepo.cancel(active.id);
      }

      return subscriptionRepo.create({
        userId,
        planId,
        status: 'active',
        startedAt: new Date().toISOString(),
        expiresAt: null,
      });
    },

    async createStripeCheckout(planId: string) {
      const session = await authRepo.getSession();
      if (!session) throw new Error('Chua dang nhap');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ planId }),
        },
      );

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.url as string;
    },
  };
}
