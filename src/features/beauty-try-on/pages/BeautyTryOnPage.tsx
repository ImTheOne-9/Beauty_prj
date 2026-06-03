import { useEffect, useMemo, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'

import BeautyAppliedProducts from '@/features/beauty-try-on/components/BeautyAppliedProducts'
import BeautyProductGrid from '@/features/beauty-try-on/components/BeautyProductGrid'
import BeautyProductTabs from '@/features/beauty-try-on/components/BeautyProductTabs'
import BeautyVirtualMirror from '@/features/beauty-try-on/components/BeautyVirtualMirror'
import { PatternPickerModal } from '@/features/ai-scan/components/PatternPickerModal'
import { usePatternCatalog } from '@/features/ai-scan/hooks/usePatternCatalog'
import { getPatternColorCount, hasPatternCatalog } from '@/features/ai-scan/lib/makeup-patterns'
import { runMakeupVirtualTryOn } from '@/features/ai-scan/services/makeup-vto-service'
import { useFaceValidation } from '@/features/ai-scan/hooks/useFaceValidation'
import type { MakeupVtoTaskStatus } from '@/features/ai-scan/types/makeup-vto'
import {
  type BeautyAppliedSelection,
  buildBeautyMakeupEffects,
  hasBeautyMakeupPayload,
} from '@/features/beauty-try-on/lib/beauty-makeup-adapter'
import { Loader } from '@/shared/components/ui/Loader'
import { databaseService } from '@/services/supabase/database-service'
import { useToast } from '@/shared/hooks/useToast'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function BeautyTryOnPage() {
  const toast = useToast()
  const { user } = useAuth()
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => databaseService.getCategories(),
    staleTime: 1000 * 60 * 5,
  })

  const productsQuery = useQuery({
    queryKey: ['catalog', 'products'],
    queryFn: () => databaseService.getProducts(),
    staleTime: 1000 * 60 * 5,
  })

  const makeupCatalogQuery = useQuery({
    queryKey: ['makeup', 'catalog'],
    queryFn: () => databaseService.getMakeupCatalog(),
    staleTime: 1000 * 60 * 5,
  })

  const variantsQuery = useQuery({
    queryKey: ['admin', 'product-configs'],
    queryFn: () => databaseService.getAdminProductVariants(),
    staleTime: 1000 * 60 * 5,
  })

  const categories = categoriesQuery.data ?? []
  const products = productsQuery.data ?? []
  const makeupCatalog = makeupCatalogQuery.data ?? []
  const variants = variantsQuery.data ?? []

  const [activeTab, setActiveTab] = useState('')
  const [expanded, setExpanded] = useState(true)
  const [mobileAppliedOpen, setMobileAppliedOpen] = useState(false)
  const [appliedProducts, setAppliedProducts] = useState<BeautyAppliedSelection[]>([])
  const [hiddenAppliedProducts, setHiddenAppliedProducts] = useState<string[]>([])
  const [patternPickerSelection, setPatternPickerSelection] =
    useState<BeautyAppliedSelection | null>(null)
  const [imageSource, setImageSource] = useState('')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<MakeupVtoTaskStatus>('idle')
  const { validationState, validationError, validateAndSetImage, resetValidation } = useFaceValidation()

  const patternPickerCategory = patternPickerSelection
    ? makeupCatalog.find((item) => item.productId === patternPickerSelection.productId)?.apiCategoryKey ?? null
    : null
  const patternCatalogQuery = usePatternCatalog(
    patternPickerCategory,
    Boolean(patternPickerSelection),
  )

  useEffect(() => {
    if (!activeTab && categories.length > 0) {
      setActiveTab(categories[0].id)
    }
  }, [activeTab, categories])

  const visibleProducts = useMemo(() => {
    if (!activeTab) return products
    return products.filter((product) => product.category_id === activeTab)
  }, [activeTab, products])

  const toggleProduct = (productId: string, variantId: string) => {
    const selectedProduct = products.find((product) => product.id === productId)

    setAppliedProducts((current) =>
      current.some((item) => item.variantId === variantId)
        ? current.filter((item) => item.variantId !== variantId)
        : [
            ...current.filter((item) => {
              const currentProduct = products.find((product) => product.id === item.productId)
              return currentProduct?.category_id !== selectedProduct?.category_id
            }),
            { productId, variantId, colorVariantIds: [variantId] },
          ],
    )
    setHiddenAppliedProducts((current) => current.filter((id) => id !== variantId))
  }

  const clearAppliedProducts = () => {
    setAppliedProducts([])
    setHiddenAppliedProducts([])
  }

  const toggleAppliedProductVisibility = (id: string) => {
    setHiddenAppliedProducts((current) =>
      current.includes(id)
        ? current.filter((productId) => productId !== id)
        : [...current, id],
    )
  }

  const addProductToCart = (id: string) => {
    const selection = appliedProducts.find((item) => item.variantId === id)
    const product = products.find((item) => item.id === selection?.productId)
    const variant = variants.find((item) => item.id === id)
    toast.success(
      `${product?.name ?? 'Product'}${variant?.name ? ` - ${variant.name}` : ''} added to cart`,
    )
  }

  const getDefaultColorVariantIds = (
    productId: string,
    preferredVariantIds: string[],
    colorCount: number,
  ) => {
    const productVariants = variants.filter(
      (variant) => variant.product_id === productId && variant.is_active && variant.color_hex?.trim(),
    )
    const orderedIds = [
      ...preferredVariantIds,
      ...productVariants.map((variant) => variant.id),
    ].filter((variantId, index, ids) => ids.indexOf(variantId) === index)

    return orderedIds.slice(0, colorCount)
  }

  const preserveColorVariantSlots = (
    productId: string,
    currentVariantIds: string[],
    colorCount: number,
  ) => {
    const productVariants = variants.filter(
      (variant) => variant.product_id === productId && variant.is_active && variant.color_hex?.trim(),
    )
    const next = currentVariantIds.slice(0, colorCount)

    while (next.length < colorCount) {
      const fallback = productVariants.find((variant) => !next.includes(variant.id)) ?? productVariants[0]
      if (!fallback) break
      next.push(fallback.id)
    }

    return next
  }

  const updateAppliedProductPattern = (patternName: string, colorCount: number) => {
    if (!patternPickerSelection) return

    setAppliedProducts((current) =>
      current.map((selection) =>
        selection.productId === patternPickerSelection.productId
          ? {
              ...selection,
              patternName,
              colorVariantIds: getDefaultColorVariantIds(
                selection.productId,
                selection.colorVariantIds ?? [selection.variantId],
                colorCount,
              ),
            }
          : selection,
      ),
    )
    setPatternPickerSelection(null)
  }

  const updateAppliedProductColor = (
    selection: BeautyAppliedSelection,
    colorIndex: number,
    variantId: string,
  ) => {
    setAppliedProducts((current) =>
      current.map((item) => {
        if (item.productId !== selection.productId) return item
        const colorCount = item.patternName ? getPatternColorCount(item.patternName) : 1
        const nextColorVariantIds = preserveColorVariantSlots(
          item.productId,
          item.colorVariantIds ?? [item.variantId],
          colorCount,
        )
        nextColorVariantIds[colorIndex] = variantId
        return {
          ...item,
          colorVariantIds: nextColorVariantIds,
        }
      }),
    )
  }

  const handleSelectModel = (imageUrl: string) => {
    if (imageSource.startsWith('blob:')) {
      URL.revokeObjectURL(imageSource)
    }
    resetValidation()
    setImageSource(imageUrl)
    setResultUrl(null)
    setTaskStatus('idle')
  }

  const handleUploadPhoto = async (file: File) => {
    if (imageSource.startsWith('blob:')) {
      URL.revokeObjectURL(imageSource)
    }

    const objectUrl = URL.createObjectURL(file)
    resetValidation()
    setResultUrl(null)
    setTaskStatus('idle')

    const isValid = await validateAndSetImage(objectUrl)
    if (isValid) {
      setImageSource(objectUrl)
    } else {
      URL.revokeObjectURL(objectUrl)
      setImageSource('')
    }
  }

  const handleClearPhoto = () => {
    if (imageSource.startsWith('blob:')) {
      URL.revokeObjectURL(imageSource)
    }
    resetValidation()
    setImageSource('')
    setResultUrl(null)
    setTaskStatus('idle')
  }

  const processMutation = useMutation({
    mutationFn: async () => {
      const visibleAppliedProducts = appliedProducts.filter(
        (selection) => !hiddenAppliedProducts.includes(selection.variantId),
      )
      const effects = buildBeautyMakeupEffects(visibleAppliedProducts, makeupCatalog, variants)

      if (!imageSource) {
        throw new Error('Please upload a photo or select a model first.')
      }

      if (imageSource.startsWith('blob:') && !user?.id) {
        throw new Error('Please sign in before processing an uploaded photo.')
      }

      if (visibleAppliedProducts.length === 0) {
        throw new Error('Please show at least one applied product first.')
      }

      const missingPattern = visibleAppliedProducts.find((selection) => {
        const category = makeupCatalog.find((item) => item.productId === selection.productId)?.apiCategoryKey
        return Boolean(category && hasPatternCatalog(category) && !selection.patternName)
      })
      if (missingPattern) {
        const product = products.find((item) => item.id === missingPattern.productId)
        throw new Error(`Please choose a pattern for ${product?.name ?? 'the selected product'} first.`)
      }

      const missingColors = visibleAppliedProducts.find((selection) => {
        const category = makeupCatalog.find((item) => item.productId === selection.productId)?.apiCategoryKey
        const requiredColorCount =
          category && selection.patternName && category !== 'lip_color'
            ? getPatternColorCount(selection.patternName)
            : 1
        const selectedColorCount = (selection.colorVariantIds ?? [selection.variantId]).filter((variantId) => {
          const variant = variants.find((item) => item.id === variantId)
          return Boolean(variant?.color_hex?.trim())
        }).length
        return selectedColorCount < requiredColorCount
      })
      if (missingColors) {
        const product = products.find((item) => item.id === missingColors.productId)
        const requiredColorCount = getPatternColorCount(missingColors.patternName)
        throw new Error(
          `${product?.name ?? 'The selected product'} needs ${requiredColorCount} selected colors for this pattern.`,
        )
      }

      if (!hasBeautyMakeupPayload(effects)) {
        throw new Error('Selected products need a color value before they can be applied.')
      }

      setTaskStatus('running')
      return runMakeupVirtualTryOn({
        imageSource,
        effects,
        userId: user?.id,
        allowColorOnly: true,
      })
    },
    onSuccess: (result) => {
      setResultUrl(result.resultUrl)
      setTaskStatus('success')
      toast.success(result.mode === 'demo' ? 'Demo preview ready' : 'Makeup applied successfully')
    },
    onError: (error: Error) => {
      setTaskStatus('error')
      toast.error(error.message)
    },
  })

  const canApply =
    Boolean(imageSource) &&
    appliedProducts.some((selection) => !hiddenAppliedProducts.includes(selection.variantId)) &&
    validationState !== 'checking' &&
    !processMutation.isPending

  if (categoriesQuery.isLoading || productsQuery.isLoading || makeupCatalogQuery.isLoading || variantsQuery.isLoading) {
    return <Loader fullScreen label="Loading beauty catalog" />
  }

  if (categoriesQuery.error || productsQuery.error || makeupCatalogQuery.error || variantsQuery.error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <div>
          <h1 className="text-xl font-bold">Unable to load beauty catalog</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Please check the database connection and try again.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-neutral-950 lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
        <section className="flex min-h-0 flex-1 flex-col lg:flex-[4]">
          <BeautyVirtualMirror
            expanded={expanded}
            imageSource={imageSource}
            resultUrl={resultUrl}
            status={taskStatus}
            validationState={validationState}
            validationError={validationError}
            appliedCount={appliedProducts.length}
            canApply={canApply}
            onSelectModel={handleSelectModel}
            onUploadPhoto={handleUploadPhoto}
            onClearPhoto={handleClearPhoto}
            onApply={() => processMutation.mutate()}
          />

          <div
            className={`hidden min-h-0 lg:flex lg:flex-col ${
              expanded
                ? 'lg:flex-[3]'
                : 'lg:h-[72px] lg:shrink-0'
            }`}
          >
            <BeautyAppliedProducts
              expanded={expanded}
              setExpanded={setExpanded}
              appliedProducts={appliedProducts}
              hiddenProducts={hiddenAppliedProducts}
              products={products}
              variants={variants}
              makeupCatalog={makeupCatalog}
              onToggleVisibility={toggleAppliedProductVisibility}
              onOpenPatternPicker={setPatternPickerSelection}
              onChangeColor={updateAppliedProductColor}
              onAddToCart={addProductToCart}
              onClear={clearAppliedProducts}
            />
          </div>
        </section>

        <aside className="flex min-h-0 flex-col border-l bg-white lg:h-full lg:flex-[8] lg:overflow-hidden">
          <div className="shrink-0 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="mt-1 text-xl font-bold">
                  Beauty Studio
                </h1>
              </div>

              <button
                type="button"
                onClick={() => setMobileAppliedOpen(true)}
                className="relative rounded-full border p-3 lg:hidden"
                aria-label="Open applied products"
              >
                <ShoppingBag size={18} />
                {appliedProducts.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs font-semibold text-white">
                    {appliedProducts.length}
                  </span>
                )}
              </button>
            </div>

            <div className="mt-5">
              <BeautyProductTabs
                active={activeTab}
                categories={categories}
                onChange={setActiveTab}
              />
            </div>
          </div>

          <div className="min-h-[520px] flex-1 px-5 pb-6 lg:min-h-0 lg:overflow-hidden">
            <BeautyProductGrid
              mobile={false}
              products={visibleProducts}
              variants={variants}
              appliedProducts={appliedProducts}
              onToggle={toggleProduct}
            />
          </div>
        </aside>
      </div>

      {mobileAppliedOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close applied products"
            onClick={() => setMobileAppliedOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 h-[80vh] overflow-hidden rounded-t-2xl bg-white shadow-2xl">
            

            <BeautyAppliedProducts
              mobile
              expanded={expanded}
              setExpanded={setExpanded}
              appliedProducts={appliedProducts}
              hiddenProducts={hiddenAppliedProducts}
              products={products}
              variants={variants}
              makeupCatalog={makeupCatalog}
              onToggleVisibility={toggleAppliedProductVisibility}
              onOpenPatternPicker={setPatternPickerSelection}
              onChangeColor={updateAppliedProductColor}
              onAddToCart={addProductToCart}
              onClear={clearAppliedProducts}
              onClose={() => setMobileAppliedOpen(false)}
            />
          </div>
        </div>
      )}

      <PatternPickerModal
        open={Boolean(patternPickerSelection)}
        title="Choose product pattern"
        effectCategory={patternPickerCategory ?? undefined}
        catalog={patternCatalogQuery.data ?? []}
        isLoading={patternCatalogQuery.isLoading}
        selectedLabel={patternPickerSelection?.patternName}
        onClose={() => setPatternPickerSelection(null)}
        onChoose={(pattern) => updateAppliedProductPattern(pattern.label, getPatternColorCount(pattern.label, pattern))}
      />
    </main>
  )
}
