import { useQuery } from '@tanstack/react-query'
import { databaseService } from '@/services/supabase/database-service'
import { parseProductTags } from '@/shared/lib/product-tags'

export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations', 'products'],
    queryFn: async () => {
      const products = await databaseService.getProducts()
      return products.map((product) => {
        const parsed = parseProductTags(product)
        return {
          ...parsed,
          externalLink: product.external_url,
          reason: `Recommended for balanced routine support in ${parsed.cleanTags.join(', ') || 'general skincare'}.`,
        }
      })
    },
  })
}
