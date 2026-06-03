import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ExternalLink,
  Shapes,
} from 'lucide-react'
import { useState } from 'react'
import type {
  AdminProductRecord,
  AdminProductVariantRecord,
  MakeupCatalogRow,
} from '@/services/supabase/database-service'
import {
  type BeautyAppliedSelection,
  getBeautySelectionColorCount,
} from '@/features/beauty-try-on/lib/beauty-selection'
import {
  hasPatternCatalog,
  isColorPatternCategory,
} from '@/features/ai-scan/lib/makeup-patterns'

interface Props {
  mobile?: boolean
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  appliedProducts: BeautyAppliedSelection[]
  hiddenProducts: string[]
  products: AdminProductRecord[]
  variants: AdminProductVariantRecord[]
  makeupCatalog: MakeupCatalogRow[]
  onToggleVisibility: (id: string) => void
  onOpenPatternPicker: (selection: BeautyAppliedSelection) => void
  onChangeColor: (selection: BeautyAppliedSelection, colorIndex: number, variantId: string) => void
  onOpenExternal: (url?: string | null) => void
  onClear: () => void
  onClose?: () => void
}

function getProductImage(product?: AdminProductRecord) {
  return product?.image_url ?? ''
}

function isDualColorTexture(texture?: string | null) {
  return texture === 'shimmer' || texture === 'holographic'
}

function getVariantSwatchStyle(variant?: AdminProductVariantRecord | null) {
  if (!variant) return { backgroundColor: '#d4d4d4' }

  if (isDualColorTexture(variant.texture)) {
    const shimmerColor = variant.shimmer_color ?? '#FFFFFF'
    return {
      background: `linear-gradient(135deg, ${variant.color_hex} 0 50%, ${shimmerColor} 50% 100%)`,
    }
  }

  return { backgroundColor: variant.color_hex }
}

export default function BeautyAppliedProducts({
  mobile = false,
  expanded,
  setExpanded,
  appliedProducts,
  hiddenProducts,
  products,
  variants,
  makeupCatalog,
  onToggleVisibility,
  onOpenPatternPicker,
  onChangeColor,
  onOpenExternal,
  onClear,
  onClose,
}: Props) {
  const [openColorPickers, setOpenColorPickers] = useState<string[]>([])

  const toggleColorPicker = (id: string) => {
    setOpenColorPickers((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const appliedProductDetails = appliedProducts.map((selection) => {
    const product = products.find((item) => item.id === selection.productId)
    const variant = variants.find((item) => item.id === selection.variantId)
    const productVariants = variants.filter(
      (item) => item.product_id === selection.productId && item.is_active && item.color_hex?.trim(),
    )
    const catalogItem = makeupCatalog.find((item) => item.productId === selection.productId)
    const canChoosePattern = Boolean(
      catalogItem?.apiCategoryKey && hasPatternCatalog(catalogItem.apiCategoryKey),
    )
    const canChoosePatternColors = Boolean(
      catalogItem?.apiCategoryKey && isColorPatternCategory(catalogItem.apiCategoryKey),
    )
    const isLipColor = catalogItem?.apiCategoryKey === 'lip_color'
    const isSkinSmooth = catalogItem?.apiCategoryKey === 'skin_smooth'
    const requiredColorCount = getBeautySelectionColorCount(
      catalogItem?.apiCategoryKey,
      selection.patternName,
    )
    const canChoosePaletteColors = canChoosePatternColors || requiredColorCount > 1
    const colorVariantIds = selection.colorVariantIds?.length
      ? selection.colorVariantIds
      : [selection.variantId]
    const colorSlots = Array.from({ length: requiredColorCount }).map((_, index) => {
      const selectedVariant = variants.find((item) => item.id === colorVariantIds[index])
      return {
        index,
        variant: selectedVariant ?? null,
        variantId: selectedVariant?.id ?? null,
        color: selectedVariant?.color_hex ?? null,
        label: selectedVariant?.name ?? selectedVariant?.color_hex ?? 'Not selected',
      }
    })
    return {
      id: selection.variantId,
      selection,
      productId: selection.productId,
      brand: product?.brand ?? 'Product',
      name: product?.name ?? `Product ${selection.productId}`,
      externalUrl: product?.external_url ?? null,
      variantName: variant?.name ?? null,
      texture: variant?.texture ?? null,
      patternName: selection.patternName ?? null,
      isLipColor,
      isSkinSmooth,
      canChoosePattern,
      canChoosePaletteColors,
      productVariants,
      colorSlots,
      colorsOpen: openColorPickers.includes(selection.variantId),
      imageUrl: variant?.image_url || getProductImage(product),
      color: colorSlots[0]?.color ?? variant?.color_hex ?? null,
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
            {appliedProductDetails.map((product, productIndex) => (
              <div
                key={product.id || `${product.productId || 'applied'}-${productIndex}`}
                className={`grid grid-cols-[44px_32px_minmax(0,1fr)_32px_32px_32px] items-start gap-3 rounded-lg px-1 py-2 ${
                  product.hidden ? 'opacity-50' : ''
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden bg-neutral-200">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : null}
                </div>

                <div className="flex h-8 w-8 items-center justify-center">
                  {!product.isSkinSmooth && !product.canChoosePaletteColors && (
                    <span
                      className="h-8 w-8 rounded-full border border-neutral-200"
                      style={getVariantSwatchStyle(product.colorSlots[0]?.variant)}
                      aria-label={product.color ? `Color ${product.color}` : 'No color configured'}
                      title={product.color ?? 'No color configured'}
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {product.brand} {product.name}
                  </p>
                  {(product.variantName || product.texture || product.patternName) && (
                    <p className="truncate text-xs text-neutral-500">
                      {[product.variantName, product.texture, product.patternName].filter(Boolean).join(' / ')}
                    </p>
                  )}
                  {product.canChoosePaletteColors && product.productVariants.length > 0 && (
                    <div className="mt-2 rounded-md bg-neutral-50">
                      <button
                        type="button"
                        onClick={() => toggleColorPicker(product.id)}
                        className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left"
                        aria-expanded={product.colorsOpen}
                      >
                        <span className="text-[11px] font-semibold uppercase text-neutral-500">
                          Colors
                        </span>
                        <span className="flex min-w-0 flex-1 justify-end gap-1">
                          {product.colorSlots.map((slot) => (
                            <span
                              key={slot.index}
                              className="h-4 w-4 rounded-full border border-white ring-1 ring-neutral-200"
                              style={getVariantSwatchStyle(slot.variant)}
                              title={slot.label}
                            />
                          ))}
                        </span>
                        {product.colorsOpen ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>

                      {product.colorsOpen && (
                        <div className="space-y-2 border-t border-neutral-200 p-2">
                          {product.colorSlots.map((slot) => (
                            <div key={slot.index} className="min-w-0">
                              <div className="mb-1 flex min-w-0 items-center justify-between gap-2">
                                <span className="text-[10px] font-semibold uppercase text-neutral-500">
                                  Color {slot.index + 1}
                                </span>
                                <span className="truncate text-[10px] text-neutral-500">
                                  {slot.label}
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-wrap gap-2">
                                {product.productVariants.map((variant, variantIndex) => {
                                  const selected = slot.variantId === variant.id
                                  return (
                                    <button
                                      key={`${slot.index}-${variant.id || variantIndex}`}
                                      type="button"
                                      onClick={() => onChangeColor(product.selection, slot.index, variant.id)}
                                      className={`h-6 w-6 rounded-full border-2 transition ${
                                        selected
                                          ? 'border-black ring-2 ring-black/10'
                                          : 'border-white shadow-sm ring-1 ring-neutral-200 hover:ring-neutral-400'
                                      }`}
                                      style={getVariantSwatchStyle(variant)}
                                      aria-label={`Use ${variant.name ?? variant.color_hex} for color ${slot.index + 1}`}
                                      title={`${variant.name ?? variant.color_hex}${variant.texture ? ` - ${variant.texture}` : ''}`}
                                    />
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenPatternPicker(product.selection)
                  }
                  disabled={!product.canChoosePattern}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={product.patternName ? 'Change pattern' : 'Choose pattern'}
                  title={product.patternName ? `Pattern: ${product.patternName}` : 'Choose pattern'}
                >
                  <Shapes size={19} />
                </button>

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
                  onClick={() => onOpenExternal(product.externalUrl)}
                  disabled={!product.externalUrl}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Open product link"
                  title="Open product link"
                >
                  <ExternalLink size={19} />
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
