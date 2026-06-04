import { useQuery } from '@tanstack/react-query'
import { ScanProductGrid } from '@/shared/components/ui/ScanProductGrid'
import { databaseService } from '@/services/supabase/database-service'
import { parseProductTags } from '@/shared/lib/product-tags'
import { type ProductRecommendation } from '@/shared/lib/types'

const PRODUCT_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80'

export default function ProductRecommendations() {
  const { data } = useQuery({
    queryKey: ['landing', 'products'],
    queryFn: async () => databaseService.getProducts(),
  })

  const products: ProductRecommendation[] = (data ?? [])
    .map((product) => {
      const parsed = parseProductTags(product)
      const tagLabel = parsed.cleanTags.join(', ') || parsed.category || product.brand || 'core skincare'
      return {
        ...parsed,
        image: parsed.image || PRODUCT_PLACEHOLDER_IMAGE,
        reason: `Featured because it fits ${tagLabel} needs.`,
        externalLink: product.external_url ?? '',
      }
    })
    .slice(0, 6)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-accent">Recommended</p>
          <h3 className="mt-2 font-brand text-3xl font-extrabold text-brand-ink">Curated Luxury Picks</h3>
          <p className="mt-2 max-w-2xl text-sm text-brand-muted">Here is a temporary hardcoded reference layout so you can immediately see the product direction.</p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/40 bg-white/55 p-4 shadow-[0_24px_60px_rgba(255,192,203,0.12)] backdrop-blur-sm">
        {products.length === 0 ? (
          <div className="rounded-[1.5rem] border border-brand-blush bg-brand-surface/85 p-8 text-center text-sm text-brand-muted">
            No products have been added yet. Please update the product catalog in the admin page.
          </div>
        ) : (
          <ScanProductGrid products={products} />
        )}
      </div>
    </div>
  )
}
