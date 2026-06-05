import type { CreatePlanInput, CreateSubscriptionInput, Plan, Subscription, UpdatePlanInput } from '@/core/entities';

export interface IPlanRepository {
  getAll(): Promise<Plan[]>;
  getActivePlans(): Promise<Plan[]>;
  create(input: CreatePlanInput): Promise<Plan>;
  update(id: string, input: UpdatePlanInput): Promise<Plan>;
  delete(id: string): Promise<void>;
}

export interface ISubscriptionRepository {
  getActiveByUserId(userId: string): Promise<Subscription | null>;
  getAll(): Promise<Subscription[]>;
  create(input: CreateSubscriptionInput): Promise<Subscription>;
  update(id: string, patch: Partial<Subscription>): Promise<Subscription>;
  cancel(id: string): Promise<Subscription>;
}
