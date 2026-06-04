import { useState } from 'react'
import { RecommendationGrid } from '@/shared/components/ui/RecommendationGrid'
import { Loader } from '@/shared/components/ui/Loader'
import { useQuery } from '@tanstack/react-query'
import { useDependencies } from '@/app/providers/DependencyProvider'
import { type ProductRecommendation } from '@/core/entities'
import { parseProductTags } from '@/shared/lib/product-tags'
import { Button } from '@/shared/components/ui/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductsPage() {
  const { productRepo } = useDependencies()
  const { data, isLoading } = useQuery({
    queryKey: ['catalog', 'products'],
    queryFn: async () => productRepo.getAll(),
  })

  const [page, setPage] = useState(1)
  const itemsPerPage = 9

  const products: ProductRecommendation[] = (data ?? []).map((product) => {
    const parsed = parseProductTags(product)
    return {
      ...parsed,
      externalLink: product.externalUrl ?? '',
      reason: `Catalog pick for ${product.brand ?? 'general skincare'}.`,
    }
  })

  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage))
  const paginated = products.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  if (isLoading) {
    return <Loader fullScreen label="Loading product catalog" />
  }

  return (
    <section className="app-shell section-shell min-h-screen space-y-6 bg-app-subtle pb-12 pt-4">
      <div className="app-panel p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-app-accent">Catalog</p>
        <h1 className="mt-2 font-ui text-3xl font-semibold text-app-ink">AI Curated Product Library</h1>
      </div>
      {products.length === 0 ? (
        <div className="app-panel p-12 text-center text-sm text-app-muted">
          No products in the catalog. Please add new products from the admin page.
        </div>
      ) : (
        <>
          <RecommendationGrid products={paginated} />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <Button className="app-secondary" variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="text-sm font-semibold text-app-ink">Page {page} of {totalPages}</span>
              <Button className="app-secondary" variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
