/**
 * Core User domain entity.
 */
export type UserRole = 'guest' | 'user' | 'admin';
export type SubscriptionTier = 'guest' | 'free' | 'pro' | 'premium' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  planId: string | null;
  plan: Plan | null;
  avatarUrl: string | null;
  updatedAt: string;
  stripeCustomerId?: string | null;
}

export type UpdateProfileInput = Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'avatarUrl'>>;

/** Minimal plan info embedded in UserProfile */
export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  billingInterval: string;
  scanLimit: number;
  historyDays: number;
  description: string | null;
  features: string[];
  badge: string | null;
  isActive: boolean;
  createdAt?: string;
}

export type CreatePlanInput = Omit<Plan, 'id' | 'createdAt'>;
export type UpdatePlanInput = Partial<CreatePlanInput>;

export interface AdminUserProfile {
  id: string;
  email: string;
  role: string;
  subscriptionTier: string;
  updatedAt: string;
  createdAt: string;
}
