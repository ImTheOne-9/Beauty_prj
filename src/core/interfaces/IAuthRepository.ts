import type { UserProfile, UpdateProfileInput, AdminUserProfile } from '@/core/entities';
import type { Session } from '@supabase/supabase-js';

export interface AuthResult {
  user: { id: string; email?: string } | null;
  session: Session | null;
}

/**
 * Repository interface for Authentication operations.
 */
export interface IAuthRepository {
  getSession(): Promise<Session | null>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResult>;
  signInWithGoogle(): Promise<{ url: string } | null>;
  signOut(): Promise<void>;
  resetPasswordForEmail(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  getProfile(userId: string): Promise<UserProfile | null>;
  updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile>;
  onAuthStateChange(callback: (event: string, session: Session | null) => void): { unsubscribe: () => void };
}

/**
 * Repository interface for User management (admin).
 */
export interface IUserRepository {
  getProfiles(): Promise<Array<{ id: string; email: string; role: string; updated_at: string }>>;
  getUsersWithRoles(): Promise<AdminUserProfile[]>;
  updateUserRole(userId: string, role: string): Promise<unknown>;
  updateUserSubscriptionTier(userId: string, tier: string): Promise<unknown>;
  createUserWithRole(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'admin' | 'user',
    planId?: string,
  ): Promise<unknown>;
  deleteUser(userId: string): Promise<unknown>;
}
