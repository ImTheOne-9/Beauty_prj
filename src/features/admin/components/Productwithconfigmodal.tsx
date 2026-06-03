import { useEffect, useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  SwatchBook,
  Trash2,
  X,
} from 'lucide-react'

import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { cn } from '@/shared/lib/cn'
import {
  databaseService,
  type AdminProductVariantRecord,
} from '@/services/supabase/database-service'

type Category = { id: string; name: string; api_category_key: string }

type ProductInitial = {
  id: string
  name: string
  description?: string | null
  image_url?: string | null
  external_url?: string | null
  category_id: string
  brand?: string | null
}

type VariantForm = {
  id?: string
  name: string
  colorHex: string
  texture: string
  shimmerColor: string
  imageUrl: string
  sku: string
  sortOrder: number
  isActive: boolean
}

const DEFAULT_COLOR = '#FF8BA7'
const DEFAULT_TEXTURE = 'matte'

const TEXTURES = [
  'matte',
  'satin',
  'shimmer',
  'gloss',
  'metallic',
  'sheer',
  'holographic',
]

function textureNeedsShimmerColor(texture: string) {
  return texture === 'shimmer' || texture === 'holographic'
}

function categorySupportsTexture(apiCategoryKey?: string) {
  return Boolean(
    apiCategoryKey &&
      [
        'blush',
        'eye_liner',
        'eye_shadow',
        'eyebrows',
        'lip_color',
        'lip_liner',
      ].includes(apiCategoryKey),
  )
}

function categoryUsesVariants(apiCategoryKey?: string) {
  return apiCategoryKey !== 'skin_smooth'
}

function emptyVariant(sortOrder = 0): VariantForm {
  return {
    name: '',
    colorHex: DEFAULT_COLOR,
    texture: DEFAULT_TEXTURE,
    shimmerColor: '#FFFFFF',
    imageUrl: '',
    sku: '',
    sortOrder,
    isActive: true,
  }
}

function mapVariant(variant: AdminProductVariantRecord): VariantForm {
  return {
    id: variant.id,
    name: variant.name ?? '',
    colorHex: variant.color_hex,
    texture: variant.texture ?? DEFAULT_TEXTURE,
    shimmerColor: variant.shimmer_color ?? '#FFFFFF',
    imageUrl: variant.image_url ?? '',
    sku: variant.sku ?? '',
    sortOrder: variant.sort_order,
    isActive: variant.is_active,
  }
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      {[
        { n: 1, label: 'Product Info', icon: Package },
        { n: 2, label: 'Variants', icon: SwatchBook },
      ].map(({ n, label, icon: Icon }, index) => (
        <div key={n} className="flex items-center gap-2">
          {index > 0 && (
            <div
              className={cn(
                'h-px w-8 transition-colors',
                step > 1 ? 'bg-rose-300' : 'bg-rose-100',
              )}
            />
          )}
          <div
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
              step === n
                ? 'bg-rose-600 text-white shadow-sm'
                : step > n
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-rose-50 text-mist',
            )}
          >
            {step > n ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Icon className="h-3.5 w-3.5" />
            )}
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProductWithConfigModal({
  open,
  onClose,
  categories,
  initial,
  existingConfigs = [],
  configOnly = false,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  categories: Category[]
  initial?: ProductInitial | null
  existingConfigs?: AdminProductVariantRecord[]
  configOnly?: boolean
  onSaved: () => void
}) {
  const isEdit = Boolean(initial?.id)
  const [step, setStep] = useState<1 | 2>(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    imageUrl: '',
    externalUrl: '',
    categoryId: '',
    brand: '',
  })

  const [variants, setVariants] = useState<VariantForm[]>([emptyVariant()])

  useEffect(() => {
    if (!open) return

    setError(null)
    setStep(configOnly ? 2 : 1)

    if (initial) {
      setForm({
        id: initial.id,
        name: initial.name,
        description: initial.description ?? '',
        imageUrl: initial.image_url ?? '',
        externalUrl: initial.external_url ?? '',
        categoryId: initial.category_id,
        brand: initial.brand ?? '',
      })
    } else {
      setForm({
        id: '',
        name: '',
        description: '',
        imageUrl: '',
        externalUrl: '',
        categoryId: '',
        brand: '',
      })
    }

    setVariants(
      existingConfigs.length > 0
        ? existingConfigs.map(mapVariant)
        : [emptyVariant()],
    )
  }, [open, initial, configOnly, existingConfigs])

  if (!open) return null

  const inputCls =
    'w-full rounded-2xl border border-rose-200/80 bg-white/85 px-4 py-3 text-sm text-pearl placeholder:text-mist/60 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/25'

  const updateVariant = (index: number, patch: Partial<VariantForm>) => {
    setVariants((current) =>
      current.map((variant, itemIndex) =>
        itemIndex === index ? { ...variant, ...patch } : variant,
      ),
    )
  }

  const selectedCategory = categories.find((category) => category.id === form.categoryId)
  const supportsTexture = categorySupportsTexture(selectedCategory?.api_category_key)
  const usesVariants = categoryUsesVariants(selectedCategory?.api_category_key)

  const removeVariant = (index: number) => {
    setVariants((current) =>
      current.length === 1
        ? current
        : current.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  async function handleSave() {
    setError(null)
    setSaving(true)

    try {
      let productId = form.id
      const productPayload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        image_url: form.imageUrl.trim() || null,
        external_url: form.externalUrl.trim() || null,
        brand: form.brand.trim() || null,
        category_id: form.categoryId,
      }

      if (!configOnly) {
        if (!productPayload.name) throw new Error('Please enter a product name.')
        if (!productPayload.category_id) throw new Error('Please select a category.')

        if (isEdit) {
          await databaseService.updateProduct(productId, productPayload)
        } else {
          const created = await databaseService.createProduct(productPayload)
          productId = created.id
        }
      }

      if (!productId) {
        throw new Error('Please save product details before editing variants.')
      }

      if (!usesVariants) {
        await databaseService.replaceProductVariants(productId, [])
        onSaved()
        onClose()
        return
      }

      const normalizedVariants = variants.map((variant, index) => ({
        name: variant.name.trim() || null,
        color_hex: variant.colorHex.trim(),
        texture: supportsTexture ? variant.texture.trim() || null : null,
        shimmer_color: supportsTexture && textureNeedsShimmerColor(variant.texture)
          ? variant.shimmerColor.trim()
          : null,
        image_url: variant.imageUrl.trim() || null,
        sku: variant.sku.trim() || null,
        sort_order: variant.sortOrder || index,
        is_active: variant.isActive,
      }))

      if (normalizedVariants.length === 0) {
        throw new Error('Please add at least one variant.')
      }

      const invalidVariant = normalizedVariants.find(
        (variant) => !/^#[0-9A-Fa-f]{6}$/.test(variant.color_hex),
      )
      if (invalidVariant) {
        throw new Error('Variant color must be a valid hex value like #FF8BA7.')
      }

      const invalidShimmerVariant = normalizedVariants.find(
        (variant) =>
          supportsTexture &&
          textureNeedsShimmerColor(variant.texture ?? '') &&
          !/^#[0-9A-Fa-f]{6}$/.test(variant.shimmer_color ?? ''),
      )
      if (invalidShimmerVariant) {
        throw new Error('Shimmer color must be a valid hex value like #FFFFFF.')
      }

      await databaseService.replaceProductVariants(productId, normalizedVariants)

      onSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-rose-100 bg-white shadow-2xl">
        <div className="shrink-0 border-b border-rose-50 px-6 pb-4 pt-6">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-1.5 text-mist transition hover:bg-rose-50 hover:text-rose-600"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="font-display pr-8 text-2xl text-rose-950">
            {configOnly ? 'Edit Product Variants' : isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="mt-1 text-xs text-mist">
            {configOnly
              ? `Editing shades and textures for "${initial?.name}".`
              : isEdit
                ? 'Update product details and variants.'
                : 'Fill in product details and add at least one variant.'}
          </p>
          {!configOnly && (
            <div className="mt-4">
              <StepIndicator step={step} />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!configOnly && step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-rose-950">
                  Product Name <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="e.g. MAC Matte Lipstick Ruby Woo"
                  value={form.name}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, name: event.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-rose-950">
                    Brand
                  </label>
                  <Input
                    placeholder="e.g. MAC Cosmetics"
                    value={form.brand}
                    onChange={(event) =>
                      setForm((state) => ({ ...state, brand: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-rose-950">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    className={inputCls}
                    value={form.categoryId}
                    onChange={(event) =>
                      setForm((state) => ({ ...state, categoryId: event.target.value }))
                    }
                  >
                    <option value="">Select category...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-rose-950">
                  Description
                </label>
                <textarea
                  className={cn(inputCls, 'min-h-[80px] resize-none')}
                  placeholder="Product description..."
                  value={form.description}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, description: event.target.value }))
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-rose-950">
                  Image URL
                </label>
                <Input
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, imageUrl: event.target.value }))
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-rose-950">
                  Partner URL
                </label>
                <Input
                  placeholder="https://..."
                  value={form.externalUrl}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, externalUrl: event.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {(configOnly || step === 2) && usesVariants && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-rose-950">Variants</h3>
                  <p className="text-xs text-mist">
                    Add one row for each shade, texture, SKU, or product color.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setVariants((current) => [
                      ...current,
                      emptyVariant(current.length),
                    ])
                  }
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add variant
                </Button>
              </div>

              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div
                    key={variant.id ?? index}
                    className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-6 w-6 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: variant.colorHex }}
                        />
                        <span className="text-sm font-semibold text-rose-950">
                          Variant {index + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        disabled={variants.length === 1}
                        className="rounded-full p-1.5 text-mist hover:bg-white hover:text-rose-600 disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        placeholder="Shade name"
                        value={variant.name}
                        onChange={(event) =>
                          updateVariant(index, { name: event.target.value })
                        }
                      />
                      <Input
                        placeholder="SKU"
                        value={variant.sku}
                        onChange={(event) =>
                          updateVariant(index, { sku: event.target.value })
                        }
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={variant.colorHex}
                          onChange={(event) =>
                            updateVariant(index, { colorHex: event.target.value })
                          }
                          className="h-10 w-10 cursor-pointer rounded-xl border border-rose-100 bg-white p-0.5"
                        />
                        <input
                          type="text"
                          value={variant.colorHex.toUpperCase()}
                          onChange={(event) =>
                            updateVariant(index, { colorHex: event.target.value })
                          }
                          className="flex-1 rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-mono uppercase text-rose-950 focus:outline-none focus:ring-1 focus:ring-rose-300"
                          maxLength={7}
                        />
                      </div>
                      {supportsTexture ? (
                        <>
                          <select
                            className={inputCls}
                            value={variant.texture}
                            onChange={(event) =>
                              updateVariant(index, { texture: event.target.value })
                            }
                          >
                            {TEXTURES.map((texture) => (
                              <option key={texture} value={texture}>
                                {texture}
                              </option>
                            ))}
                          </select>
                          {textureNeedsShimmerColor(variant.texture) && (
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={variant.shimmerColor}
                                onChange={(event) =>
                                  updateVariant(index, { shimmerColor: event.target.value })
                                }
                                className="h-10 w-10 cursor-pointer rounded-xl border border-rose-100 bg-white p-0.5"
                                aria-label="Shimmer color"
                              />
                              <input
                                type="text"
                                value={variant.shimmerColor.toUpperCase()}
                                onChange={(event) =>
                                  updateVariant(index, { shimmerColor: event.target.value })
                                }
                                className="flex-1 rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-mono uppercase text-rose-950 focus:outline-none focus:ring-1 focus:ring-rose-300"
                                maxLength={7}
                                placeholder="#FFFFFF"
                              />
                            </div>
                          )}
                        </>
                      ) : null}
                      <Input
                        placeholder="Variant image URL"
                        value={variant.imageUrl}
                        onChange={(event) =>
                          updateVariant(index, { imageUrl: event.target.value })
                        }
                      />
                      <label className="flex items-center gap-2 text-sm text-mist">
                        <input
                          type="checkbox"
                          checked={variant.isActive}
                          onChange={(event) =>
                            updateVariant(index, { isActive: event.target.checked })
                          }
                        />
                        Active
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-rose-50 px-6 py-4">
          <span className="text-xs text-mist">
            {configOnly ? initial?.name ?? '' : `Step ${step} / 2`}
          </span>
          <div className="flex items-center gap-2">
            {!configOnly && step === 2 && (
              <Button variant="ghost" onClick={() => setStep(1)} disabled={saving}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            {!configOnly && step === 1 ? (
              <Button
                onClick={() => {
                  if (!form.name.trim()) {
                    setError('Please enter a product name.')
                    return
                  }
                  if (!form.categoryId) {
                    setError('Please select a category.')
                    return
                  }
                  const nextCategory = categories.find((category) => category.id === form.categoryId)
                  if (!categoryUsesVariants(nextCategory?.api_category_key)) {
                    handleSave()
                    return
                  }
                  setError(null)
                  setStep(2)
                }}
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
