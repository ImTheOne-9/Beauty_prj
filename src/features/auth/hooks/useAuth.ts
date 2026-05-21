import { useAuthStore } from '@/features/auth/store/auth-store'
import { getAdminRole, type AdminRole } from '@/shared/lib/admin'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const session = useAuthStore((state) => state.session)
  const role = useAuthStore((state) => state.role)
  const isLoading = useAuthStore((state) => state.isLoading)
  const initialized = useAuthStore((state) => state.initialized)
  const signOut = useAuthStore((state) => state.signOut)

  // Compute admin role from session user
  const adminRole: AdminRole | null = getAdminRole(session?.user ?? null)
  const isAdmin = role === 'admin' || !!adminRole

  return {
    user,
    session,
    role,
    adminRole,
    isAdmin,
    isLoading,
    initialized,
    signOut,
  }
}
