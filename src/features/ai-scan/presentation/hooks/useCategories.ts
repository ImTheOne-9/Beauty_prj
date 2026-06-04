import { useQuery } from '@tanstack/react-query'
import { useDependencies } from '@/app/providers/DependencyProvider'

export function useCategories() {
  const { useCases } = useDependencies()
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => useCases.catalog.listCategories(),
    staleTime: 1000 * 60 * 5,
  })
}
