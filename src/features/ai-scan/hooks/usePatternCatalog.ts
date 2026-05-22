import { useQuery } from '@tanstack/react-query'
import { fetchPatternCatalog, hasPatternCatalog } from '@/features/ai-scan/lib/makeup-patterns'

export function usePatternCatalog(category: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['makeup', 'patterns', category],
    queryFn: () => fetchPatternCatalog(category!),
    enabled: Boolean(enabled && category && hasPatternCatalog(category)),
    staleTime: 1000 * 60 * 60,
  })
}
