import { ScanProductGrid } from '@/shared/components/ui/ScanProductGrid'
import type { MatchedMakeupProduct } from '@/features/ai-scan/types/makeup-vto'
import type { ProductRecommendation } from '@/shared/lib/types'

type MakeupRelatedProductsProps = {
  products: MatchedMakeupProduct[]
  isLoading: boolean
  activeCategories: string[]
}

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
          <ScanProductGrid products={products.map(toGridProduct)} pageSize={4} />
        )}
      </div>
    </div>
  )
}
