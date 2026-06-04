// features/plans/presentation/hooks/useActiveSubscription.ts
import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/presentation/hooks/useAuth'
import { useDependencies } from '@/app/providers/DependencyProvider'

export interface ActiveSubscription {
  plan_id: string
  expires_at: string | null
  current_period_end: string | null
  status: string
}

export function useActiveSubscription() {
  const { user } = useAuth()
  const { useCases } = useDependencies()
  const [subscription, setSubscription] = useState<ActiveSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    useCases.plans
      .getActiveSubscription(user.id)
      .then((data) => {
        setSubscription(data ? {
          plan_id: data.planId,
          expires_at: data.expiresAt,
          current_period_end: data.expiresAt,
          status: data.status,
        } : null)
        setLoading(false)
      })
      .catch(() => {
        setSubscription(null)
        setLoading(false)
      })
  }, [user, useCases.plans])

  return { subscription, loading }
}
