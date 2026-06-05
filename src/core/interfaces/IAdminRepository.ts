export type AdminProfileWithPlan = {
  id: string;
  email: string;
  [key: string]: unknown;
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
