import type { AdminUseCaseDependencies } from './admin-dependencies';
import type { UpdateAdminUserProfileInput } from '@/core/interfaces';

export function createAdminAccessUseCases(deps: AdminUseCaseDependencies) {
  return {
    pingDatabase: () => deps.adminRepo.pingDatabase(),
    getProfilesWithPlans: () => deps.adminRepo.getProfilesWithPlans(),
    updateUserProfile: (input: UpdateAdminUserProfileInput) => deps.adminRepo.updateUserProfile(input),

    async getProfiles() {
      const profiles = await deps.userRepo.getProfiles();
      return profiles.map((profile) => ({
        id: profile.id,
        email: profile.email,
        role: profile.role,
        updated_at: profile.updated_at,
      }));
    },
    async getUsersWithRoles() {
      const users = await deps.userRepo.getUsersWithRoles();
      return users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        subscription_tier: user.subscriptionTier,
        updated_at: user.updatedAt,
        created_at: user.createdAt,
      }));
    },
    async updateUserRole(userId: string, role: string) {
      const users = await deps.userRepo.updateUserRole(userId, role);
      return users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        updated_at: user.updatedAt,
        created_at: user.createdAt,
      }));
    },
    async updateUserSubscriptionTier(userId: string, subscriptionTier: string) {
      const user = await deps.userRepo.updateUserSubscriptionTier(userId, subscriptionTier);
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        updated_at: user.updatedAt,
        created_at: user.createdAt,
      };
    },
    createUserWithRole: (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      role: 'admin' | 'user',
      planId = '',
    ) => deps.userRepo.createUserWithRole(email, password, firstName, lastName, role, planId),
    deleteUserRole: (userId: string) => deps.userRepo.deleteUser(userId),
  };
}
