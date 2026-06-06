import { useQuery } from '@tanstack/react-query'
import { useDependencies } from '@/app/providers/DependencyProvider'

export function useBlogPosts() {
  const { useCases } = useDependencies()

  return useQuery({
    queryKey: ['blog', 'published'],
    queryFn: () => useCases.blogs.getPublishedPosts(),
  })
}
