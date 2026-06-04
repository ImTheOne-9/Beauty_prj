import { useQuery } from '@tanstack/react-query'
import { useDependencies } from '@/app/providers/DependencyProvider'

export function useScanHistory(userId?: string) {
  const { useCases } = useDependencies()
  return useQuery({
    queryKey: ['scan-history', userId],
    enabled: true,
    queryFn: async () => useCases.scans.getScanHistory(userId),
  })
}
