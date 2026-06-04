import { ExternalLink } from 'lucide-react'
import type {
  AdminProductRecord,
  AdminProductVariantRecord,
  MakeupCatalogRow,
} from '@/services/supabase/database-service'
import type { BeautyAppliedSelection } from '@/features/beauty-try-on/lib/beauty-selection'

interface Props {
  mobile?: boolean
  products: AdminProductRecord[]
  variants: AdminProductVariantRecord[]
  makeupCatalog: MakeupCatalogRow[]
  appliedProducts: BeautyAppliedSelection[]
  onToggle: (productId: string, variantId?: string) => void
  onOpenExternal: (url?: string | null) => void
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
  makeupCatalog,
  appliedProducts,
  onToggle,
  onOpenExternal,
}: Props) {
  if (products.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-studio-border p-8 text-center text-sm text-studio-muted">
        No products available for this category.
      </div>
    )
  }

  if (mobile) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4 p-4">
        {products.map((product, productIndex) => {
          const productVariants = variants.filter(
            (variant) => variant.product_id === product.id && variant.is_active,
          )
          const canApplyWithoutVariant =
            makeupCatalog.find((item) => item.productId === product.id)?.apiCategoryKey === 'skin_smooth'
          const selected = appliedProducts.find((item) => item.productId === product.id)
          const active = Boolean(selected)

          return (
            <article
              key={product.id || `mobile-product-${productIndex}`}
              className="flex items-center gap-3 border-b border-studio-border pb-4"
            >
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-studio-border bg-studio-subtle">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                ) : null}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-studio-ink">
                  {product.brand}
                </h3>

                <p className="text-sm text-studio-muted">
                  {product.name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onToggle(product.id, productVariants[0]?.id)
                  }
                  disabled={!canApplyWithoutVariant && productVariants.length === 0}
                  className={`rounded-full px-5 py-2 text-sm font-medium ${
                    active
                      ? 'bg-studio-accent text-white'
                      : 'border border-studio-border text-studio-ink'
                  }`}
                >
                  {active
                    ? 'Applied'
                    : 'Apply'}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenExternal(product.external_url)}
                  disabled={!product.external_url}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-studio-border text-studio-ink transition hover:bg-studio-subtle disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Open product link"
                  title="Open product link"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
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
        {products.map((product, productIndex) => {
          const productVariants = variants.filter(
            (variant) => variant.product_id === product.id && variant.is_active,
          )
          const canApplyWithoutVariant =
            makeupCatalog.find((item) => item.productId === product.id)?.apiCategoryKey === 'skin_smooth'
          const selected = appliedProducts.find((item) => item.productId === product.id)
          const active = Boolean(selected)
          const canApplyProduct = productVariants.length > 0 || canApplyWithoutVariant

          return (
            <article
              key={product.id || `product-${productIndex}`}
              className="group rounded-lg border border-studio-border bg-studio-surface p-4 transition-all duration-200 hover:border-zinc-300 hover:shadow-studio"
            >
              <div className="overflow-hidden rounded-md bg-studio-subtle">
                <div className="flex aspect-square w-full items-center justify-center p-4">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : null}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-center text-xs font-bold uppercase tracking-[0.12em] text-studio-ink">
                  {product.brand}
                </h3>

                <p className="mt-2 line-clamp-2 min-h-10 text-center text-sm leading-5 text-studio-muted">
                  {product.name}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {productVariants.length === 0 ? (
                  null
                ) : (
                  productVariants.map((variant, variantIndex) => {
                    const selectedVariant = selected?.variantId === variant.id
                    return (
                      <button
                        key={variant.id || `${product.id || productIndex}-variant-${variantIndex}`}
                        type="button"
                        onClick={() => onToggle(product.id, variant.id)}
                        className={`h-7 w-7 rounded-full border-2 ${
                          selectedVariant
                            ? 'border-studio-accent ring-2 ring-studio-accent/15'
                            : 'border-white shadow-sm ring-1 ring-studio-border'
                        }`}
                        style={getVariantSwatchStyle(variant)}
                        aria-label={variant.name ?? variant.color_hex}
                        title={`${variant.name ?? variant.color_hex}${variant.texture ? ` - ${variant.texture}` : ''}`}
                      />
                    )
                  })
                )}
              </div>

              <div className="mt-5 grid grid-cols-[1fr_44px] gap-2">
                <button
                  onClick={() =>
                    onToggle(product.id, selected?.variantId ?? productVariants[0]?.id)
                  }
                  disabled={!canApplyProduct}
                  className={`rounded-xl py-3 ${
                    active
                      ? 'bg-studio-accent text-white'
                      : 'border border-studio-border text-studio-ink transition hover:bg-studio-subtle disabled:cursor-not-allowed disabled:opacity-50'
                  }`}
                >
                  {active
                    ? 'Applied'
                    : 'Try On'}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenExternal(product.external_url)}
                  disabled={!product.external_url}
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-studio-border text-studio-ink transition hover:bg-studio-subtle disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Open product link"
                  title="Open product link"
                >
                  <ExternalLink size={17} />
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
