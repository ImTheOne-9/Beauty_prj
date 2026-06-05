import type { IAuthRepository, IStorageService } from '@/core/interfaces';
import type { UpdateProfileInput } from '@/core/entities';

export function createAuthUseCases(authRepo: IAuthRepository, storageService: IStorageService) {
  return {
    getSession() {
      return authRepo.getSession();
    },

    getProfile(userId: string) {
      return authRepo.getProfile(userId);
    },

    onAuthStateChange(callback: Parameters<IAuthRepository['onAuthStateChange']>[0]) {
      return authRepo.onAuthStateChange(callback);
    },

    signIn(email: string, password: string) {
      return authRepo.signIn(email, password);
    },

    signUp(email: string, password: string, firstName?: string, lastName?: string) {
      return authRepo.signUp(email, password, firstName, lastName);
    },

    signInWithGoogle() {
      return authRepo.signInWithGoogle();
    },

    signOut() {
      return authRepo.signOut();
    },

    resetPasswordForEmail(email: string) {
      return authRepo.resetPasswordForEmail(email);
    },

    updatePassword(password: string) {
      return authRepo.updatePassword(password);
    },

    updateProfile(userId: string, input: UpdateProfileInput) {
      return authRepo.updateProfile(userId, input);
    },

    async uploadAvatar(userId: string, file: File) {
      const avatarUrl = await storageService.uploadAvatar(userId, file);
      await authRepo.updateProfile(userId, { avatarUrl });
      return avatarUrl;
    },
  };
}
