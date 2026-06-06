import { useQuery } from '@tanstack/react-query'
import { useDependencies } from '@/app/providers/DependencyProvider'

export function useBlogPost(slug?: string) {
  const { useCases } = useDependencies()

  return useQuery({
    queryKey: ['blog', 'post', slug],
    queryFn: () => useCases.blogs.getPostBySlug(slug ?? ''),
    enabled: Boolean(slug),
  })
}
