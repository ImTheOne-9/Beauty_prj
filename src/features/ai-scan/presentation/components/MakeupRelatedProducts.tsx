import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/shared/components/ui/ProductCard'
import type { MatchedMakeupProduct, ProductRecommendation } from '@/core/entities'

type MakeupRelatedProductsProps = {
  products: MatchedMakeupProduct[]
  isLoading: boolean
  activeCategories: string[]
}

const PAGE_SIZE = 3

function toGridProduct(product: MatchedMakeupProduct): ProductRecommendation & { matchReason: string } {
  return {
    id: product.productId,
    name: product.name,
    image: product.image,
    description: product.description ?? '',
    reason: product.matchReason,
    externalLink: product.externalLink,
    category: product.categoryName,
    matchReason: product.matchReason,
  }
}

export function MakeupRelatedProducts({ products, isLoading, activeCategories }: MakeupRelatedProductsProps) {
  const [page, setPage] = useState(1)
  const gridProducts = products.map(toGridProduct)
  const totalPages = Math.max(1, Math.ceil(gridProducts.length / PAGE_SIZE))
  const paginatedProducts = gridProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [products.length])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-app-border bg-app-surface shadow-sm">
      <div className="shrink-0 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <label className="flex flex-col gap-1 text-xl font-semibold text-app-ink">
            <span className="inline-flex items-center gap-1">Related Products</span>
            <span className="text-xs font-normal text-app-muted">Browse matching products that align with your selected makeup effect.</span>
          </label>
        </div>
        {activeCategories.length > 0 ? (
          <p className="mt-2 text-[10px] text-app-accent">
            Active: {activeCategories.join(', ')}
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-app-muted">Loading product catalog...</p>
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-app-border bg-app-subtle p-6 text-center text-xs text-app-muted">
            <p className="font-semibold text-app-ink">No matching products yet</p>
            <p className="mt-2">
              Add products in Admin with category API keys (e.g. lip_color, blush) and AI configs (hex color, texture).
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-xs font-bold text-[var(--ui-accent)] transition hover:bg-[var(--ui-subtle)] disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                <span className="text-xs font-semibold text-app-muted">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-xs font-bold text-[var(--ui-accent)] transition hover:bg-[var(--ui-subtle)] disabled:pointer-events-none disabled:opacity-30"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
