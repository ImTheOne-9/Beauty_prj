export type AdminProfileWithPlan = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string;
  avatar_url?: string | null;
  plan_id?: string | null;
  updated_at: string;
  plan?: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    billing_interval: string;
  } | null;
};

export type UpdateAdminUserProfileInput = {
  userId: string;
  planId: string;
  role: string;
  firstName: string;
  lastName: string;
};

export interface IAdminRepository {
  pingDatabase(): Promise<void>;
  getProfilesWithPlans(): Promise<AdminProfileWithPlan[]>;
  updateUserProfile(input: UpdateAdminUserProfileInput): Promise<void>;
}
