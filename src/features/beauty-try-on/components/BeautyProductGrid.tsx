import type {
  AdminProductRecord,
  AdminProductVariantRecord,
} from '@/services/supabase/database-service'
import type { BeautyAppliedSelection } from '@/features/beauty-try-on/lib/beauty-selection'

interface Props {
  mobile?: boolean
  products: AdminProductRecord[]
  variants: AdminProductVariantRecord[]
  appliedProducts: BeautyAppliedSelection[]
  onToggle: (productId: string, variantId: string) => void
}

function isDualColorTexture(texture?: string | null) {
  return texture === 'shimmer' || texture === 'holographic'
}

function getVariantSwatchStyle(variant: AdminProductVariantRecord) {
  if (isDualColorTexture(variant.texture)) {
    const shimmerColor = variant.shimmer_color ?? '#FFFFFF'
    return {
      background: `linear-gradient(135deg, ${variant.color_hex} 0 50%, ${shimmerColor} 50% 100%)`,
    }
  }

  return { backgroundColor: variant.color_hex }
}

export default function BeautyProductGrid({
  mobile = false,
  products,
  variants,
  appliedProducts,
  onToggle,
}: Props) {
  if (products.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed p-8 text-center text-sm text-neutral-500">
        No products available for this category.
      </div>
    )
  }

  if (mobile) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4 p-4">
        {products.map((product) => {
          const productVariants = variants.filter(
            (variant) => variant.product_id === product.id && variant.is_active,
          )
          const selected = appliedProducts.find((item) => item.productId === product.id)
          const active = Boolean(selected)

          return (
            <article
              key={product.id}
              className="flex items-center gap-3 border-b pb-4"
            >
              <img
                src={product.image_url ?? ''}
                alt={product.name}
                className="h-20 w-20 rounded-lg border object-contain"
              />

              <div className="flex-1">
                <h3 className="font-bold">
                  {product.brand}
                </h3>

                <p className="text-sm text-neutral-500">
                  {product.name}
                </p>
              </div>

              <button
                onClick={() =>
                  productVariants[0] && onToggle(product.id, productVariants[0].id)
                }
                disabled={productVariants.length === 0}
                className={`rounded-full px-5 py-2 text-sm font-medium ${
                  active
                    ? 'bg-black text-white'
                    : 'border'
                }`}
              >
                {active
                  ? 'Applied'
                  : 'Apply'}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => {
          const productVariants = variants.filter(
            (variant) => variant.product_id === product.id && variant.is_active,
          )
          const selected = appliedProducts.find((item) => item.productId === product.id)
          const active = Boolean(selected)

          return (
            <article
              key={product.id}
              className="group rounded-2xl border bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="overflow-hidden rounded-xl bg-neutral-50">
                <img
                  src={product.image_url ?? ''}
                  alt={product.name}
                  className="aspect-square w-full object-contain p-4"
                />
              </div>

              <div className="mt-4">
                <h3 className="text-center text-sm font-bold uppercase">
                  {product.brand}
                </h3>

                <p className="mt-2 text-center text-sm text-neutral-600">
                  {product.name}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {productVariants.length === 0 ? (
                  <span className="text-xs text-neutral-400">
                    No variants
                  </span>
                ) : (
                  productVariants.map((variant) => {
                    const selectedVariant = selected?.variantId === variant.id
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => onToggle(product.id, variant.id)}
                        className={`h-7 w-7 rounded-full border-2 ${
                          selectedVariant
                            ? 'border-black'
                            : 'border-white shadow-sm ring-1 ring-neutral-200'
                        }`}
                        style={getVariantSwatchStyle(variant)}
                        aria-label={variant.name ?? variant.color_hex}
                        title={`${variant.name ?? variant.color_hex}${variant.texture ? ` - ${variant.texture}` : ''}`}
                      />
                    )
                  })
                )}
              </div>

              <button
                onClick={() =>
                  productVariants[0] && onToggle(product.id, selected?.variantId ?? productVariants[0].id)
                }
                disabled={productVariants.length === 0}
                className={`mt-5 w-full rounded-xl py-3 ${
                  active
                    ? 'bg-black text-white'
                    : 'border disabled:cursor-not-allowed disabled:opacity-50'
                }`}
              >
                {active
                  ? 'Applied'
                  : 'Try On'}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
