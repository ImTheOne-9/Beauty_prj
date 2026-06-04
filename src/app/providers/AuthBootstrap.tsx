import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/presentation/store/auth-store'

export function AuthBootstrap() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    void initialize()
  }, [initialize])

  return null
}
