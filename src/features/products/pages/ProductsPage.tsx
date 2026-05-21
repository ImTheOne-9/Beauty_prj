import { RecommendationGrid } from '@/shared/components/ui/RecommendationGrid'
import { Loader } from '@/shared/components/ui/Loader'
import { mockProducts } from '@/shared/data/mock-products'
import { useQuery } from '@tanstack/react-query'
import { databaseService } from '@/services/supabase/database-service'
import { type ProductRecommendation } from '@/shared/lib/types'
import { parseProductTags } from '@/shared/lib/product-tags'

export default function ProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['catalog', 'products'],
    queryFn: async () => databaseService.getProducts(),
  })

  const products: ProductRecommendation[] = (data && data.length
    ? data.map((product) => {
        const parsed = parseProductTags(product)
        return {
          ...parsed,
          externalLink: product.external_url,
          reason: `Catalog pick tagged for ${parsed.cleanTags.join(', ') || 'general skincare'}.`,
        }
      })
    : mockProducts)

  if (isLoading) {
    return <Loader fullScreen label="Loading product catalog" />
  }

  return (
    <section className="section-shell space-y-6 pb-12">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan">Catalog</p>
        <h1 className="mt-3 font-display text-4xl text-pearl">AI Curated Product Library</h1>
      </div>
      <RecommendationGrid products={products} />
    </section>
  )
}
