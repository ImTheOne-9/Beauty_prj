import { useQuery } from '@tanstack/react-query'
import { useDependencies } from '@/app/providers/DependencyProvider'
import type { MakeupCatalogItem } from '@/core/entities'

export function useMakeupCatalog() {
  const { useCases } = useDependencies()
  return useQuery({
    queryKey: ['makeup', 'catalog'],
    queryFn: async (): Promise<MakeupCatalogItem[]> => {
      const rows = await useCases.catalog.listMakeupCatalog()
      return rows.map((row) => ({ ...row }))
    },
    staleTime: 1000 * 60 * 5,
  })
}
