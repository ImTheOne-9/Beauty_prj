import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ShoppingBag,
} from 'lucide-react'
import type {
  AdminProductRecord,
  AdminProductVariantRecord,
} from '@/services/supabase/database-service'
import type { BeautyAppliedSelection } from '@/features/beauty-try-on/lib/beauty-makeup-adapter'

interface Props {
  mobile?: boolean
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  appliedProducts: BeautyAppliedSelection[]
  hiddenProducts: string[]
  products: AdminProductRecord[]
  variants: AdminProductVariantRecord[]
  onToggleVisibility: (id: string) => void
  onAddToCart: (id: string) => void
  onClear: () => void
  onClose?: () => void
}

function getProductImage(product?: AdminProductRecord) {
  return product?.image_url ?? ''
}

export default function BeautyAppliedProducts({
  mobile = false,
  expanded,
  setExpanded,
  appliedProducts,
  hiddenProducts,
  products,
  variants,
  onToggleVisibility,
  onAddToCart,
  onClear,
  onClose,
}: Props) {
  const appliedProductDetails = appliedProducts.map((selection) => {
    const product = products.find((item) => item.id === selection.productId)
    const variant = variants.find((item) => item.id === selection.variantId)
    return {
      id: selection.variantId,
      productId: selection.productId,
      brand: product?.brand ?? 'Product',
      name: product?.name ?? `Product ${selection.productId}`,
      variantName: variant?.name ?? null,
      texture: variant?.texture ?? null,
      imageUrl: variant?.image_url || getProductImage(product),
      color: variant?.color_hex ?? null,
      hidden: hiddenProducts.includes(selection.variantId),
    }
  })

  const content = (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {appliedProductDetails.length === 0 ? (
          <div className="py-4 text-sm text-neutral-500">
            No products applied
          </div>
        ) : (
          <div className="space-y-2">
            {appliedProductDetails.map((product) => (
              <div
                key={product.id}
                className={`grid grid-cols-[44px_32px_minmax(0,1fr)_32px_32px] items-center gap-3 rounded-lg px-1 py-1.5 ${
                  product.hidden ? 'opacity-50' : ''
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden bg-neutral-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-neutral-400" />
                  )}
                </div>

                <span
                  className="h-8 w-8 rounded-full border border-neutral-200"
                  style={{ backgroundColor: product.color ?? '#d4d4d4' }}
                  aria-label={product.color ? `Color ${product.color}` : 'No color configured'}
                  title={product.color ?? 'No color configured'}
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {product.brand} {product.name}
                  </p>
                  {(product.variantName || product.texture) && (
                    <p className="truncate text-xs text-neutral-500">
                      {[product.variantName, product.texture].filter(Boolean).join(' / ')}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onToggleVisibility(product.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
                  aria-label={product.hidden ? 'Show product effect' : 'Hide product effect'}
                  title={product.hidden ? 'Show product effect' : 'Hide product effect'}
                >
                  {product.hidden ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onAddToCart(product.id)}
                  className="relative inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
                  aria-label="Add to cart"
                  title="Add to cart"
                >
                  <ShoppingBag size={20} />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-white text-[13px] font-semibold leading-none">
                    +
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t p-4">
        <button className="w-full rounded-full bg-black py-3 text-sm font-semibold text-white">
          Add to cart ({appliedProducts.length})
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-3 w-full text-sm"
          >
            Close
          </button>
        )}
      </div>
    </>
  )

  if (mobile) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              Applied products
            </h3>

            <button
              onClick={onClear}
              className="text-sm font-medium"
            >
              Clear all
            </button>
          </div>
        </div>

        {content}
      </div>
    )
  }

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden border-t bg-white transition-all duration-300 ${
        expanded
          ? 'flex-[3]'
          : 'h-[72px]'
      }`}
    >
      <div className="shrink-0 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 font-semibold"
          >
            Applied products
            {expanded ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronUp size={18} />
            )}
          </button>

          <button
            onClick={onClear}
            className="text-sm font-semibold text-neutral-900 hover:text-neutral-500"
          >
            Clear all
          </button>
        </div>
      </div>

      {expanded && content}
    </div>
  )
}
