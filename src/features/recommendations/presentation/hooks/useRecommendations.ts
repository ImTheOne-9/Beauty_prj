import { useQuery } from '@tanstack/react-query'
import { useDependencies } from '@/app/providers/DependencyProvider'
import { parseProductTags } from '@/shared/lib/product-tags'

export function useRecommendations() {
  const { useCases } = useDependencies()
  return useQuery({
    queryKey: ['recommendations', 'products'],
    queryFn: async () => {
      const products = await useCases.products.listProducts()
      return products.map((product) => {
        const parsed = parseProductTags(product)
        return {
          ...parsed,
          externalLink: product.externalUrl,
          reason: `Recommended for balanced routine support in ${parsed.cleanTags.join(', ') || 'general skincare'}.`,
        }
      })
    },
  })
}
