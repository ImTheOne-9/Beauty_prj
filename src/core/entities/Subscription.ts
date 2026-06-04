/**
 * Core Subscription domain entity.
 */
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  plan?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    billingInterval: string;
  };
}

export interface CreateSubscriptionInput {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string | null;
}
