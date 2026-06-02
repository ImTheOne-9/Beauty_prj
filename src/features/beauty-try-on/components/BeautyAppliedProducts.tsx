import {
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react'
import type { AdminProductRecord } from '@/services/supabase/database-service'

interface Props {
  mobile?: boolean

  expanded: boolean

  setExpanded: React.Dispatch<
    React.SetStateAction<boolean>
  >

  appliedProducts: string[]
  products: AdminProductRecord[]
  onToggle: (id: string) => void
  onClear: () => void

  onClose?: () => void
}

export default function BeautyAppliedProducts({
  mobile = false,
  expanded,
  setExpanded,
  appliedProducts,
  products,
  onToggle,
  onClear,
  onClose,
}: Props) {
  const appliedProductDetails = appliedProducts.map((id) => {
    const product = products.find((item) => item.id === id)
    return {
      id,
      brand: product?.brand ?? 'Product',
      name: product?.name ?? `Product ${id}`,
      imageUrl: product?.image_url ?? '',
    }
  })

  // MOBILE DRAWER
  if (mobile) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
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

        {/* Scroll List */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {appliedProducts.length === 0 ? (
            <div className="text-sm text-neutral-500">
              No products applied
            </div>
          ) : (
            <div className="space-y-3">
              {appliedProductDetails.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-xl border p-3"
                >
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg border object-contain"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {product.brand}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {product.name}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      onToggle(product.id)
                    }
                    className="rounded-md p-1 hover:bg-neutral-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t p-4">
          <button className="w-full rounded-full bg-black py-3 font-semibold text-white">
            Add to cart (
            {appliedProducts.length})
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
      </div>
    )
  }

  // DESKTOP
  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden border-t bg-white transition-all duration-300 ${
        expanded
          ? 'flex-[3]'
          : 'h-[72px]'
      }`}
    >
      {/* Header */}
      <div className="shrink-0 px-5 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setExpanded(!expanded)
            }
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
            className="text-sm font-medium text-neutral-500 hover:text-black"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Scroll List */}
      {expanded && (
        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          {appliedProducts.length === 0 ? (
            <div className="py-4 text-sm text-neutral-500">
              No products applied
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {appliedProductDetails.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-xl border p-3"
                >
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg border object-contain"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {product.brand}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {product.name}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      onToggle(product.id)
                    }
                    className="rounded-md p-1 hover:bg-neutral-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="shrink-0 border-t p-4">
        <button className="w-full rounded-full bg-black py-3 text-sm font-semibold text-white">
          Add to cart (
          {appliedProducts.length})
        </button>
      </div>
    </div>
  )
}
