import { useEffect, useMemo, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'

import BeautyAppliedProducts from '@/features/beauty-try-on/components/BeautyAppliedProducts'
import BeautyProductGrid from '@/features/beauty-try-on/components/BeautyProductGrid'
import BeautyProductTabs from '@/features/beauty-try-on/components/BeautyProductTabs'
import BeautyVirtualMirror from '@/features/beauty-try-on/components/BeautyVirtualMirror'
import { buildApiEffects, DEFAULT_MAKEUP_EFFECTS } from '@/features/ai-scan/lib/makeup-defaults'
import { categoryNeedsPatternFirst } from '@/features/ai-scan/lib/makeup-patterns'
import { runMakeupVirtualTryOn } from '@/features/ai-scan/services/makeup-vto-service'
import { useFaceValidation } from '@/features/ai-scan/hooks/useFaceValidation'
import type { MakeupEffect, MakeupTexture, MakeupVtoTaskStatus } from '@/features/ai-scan/types/makeup-vto'
import { Loader } from '@/shared/components/ui/Loader'
import { databaseService, type MakeupCatalogRow } from '@/services/supabase/database-service'
import { useToast } from '@/shared/hooks/useToast'

const MAKEUP_TEXTURES = new Set<MakeupTexture>([
  'matte',
  'satin',
  'shimmer',
  'gloss',
  'metallic',
])

function isMakeupTexture(value: string | null): value is MakeupTexture {
  return Boolean(value && MAKEUP_TEXTURES.has(value as MakeupTexture))
}

function cloneDefaultEffect(category: string) {
  const template = DEFAULT_MAKEUP_EFFECTS.find((effect) => effect.category === category)
  if (!template) return { category }

  return {
    ...template,
    palettes: template.palettes?.map((palette) => ({ ...palette })),
    pattern: template.pattern ? { ...template.pattern } : undefined,
    shape: template.shape ? { ...template.shape } : undefined,
    style: template.style ? { ...template.style } : undefined,
    morphology: template.morphology ? { ...template.morphology } : undefined,
  }
}

function buildEffectsFromProducts(productIds: string[], catalog: MakeupCatalogRow[]): MakeupEffect[] {
  return productIds
    .map((productId) => catalog.find((item) => item.productId === productId))
    .filter((item): item is MakeupCatalogRow => Boolean(item))
    .map((item) => {
      const category = item.apiCategoryKey
      const effect: MakeupEffect = {
        ...cloneDefaultEffect(category),
        category,
        enabled: true,
      }

      const color = item.primaryColor?.trim()
      if (color) {
        effect.palettes = [
          {
            ...(effect.palettes?.[0] ?? {}),
            color,
            colorIntensity: item.colorIntensity ?? effect.palettes?.[0]?.colorIntensity ?? 50,
            ...(isMakeupTexture(item.texture) ? { texture: item.texture } : {}),
          },
        ]
      }

      if (item.patternName?.trim()) {
        if (category === 'lip_color') {
          effect.shape = { name: item.patternName }
        } else {
          effect.pattern = { ...effect.pattern, name: item.patternName }
        }
      }

      if (categoryNeedsPatternFirst(category) && !item.patternName?.trim()) {
        effect.palettes = undefined
      }

      return effect
    })
}

export default function BeautyTryOnPage() {
  const toast = useToast()
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

  const categories = categoriesQuery.data ?? []
  const products = productsQuery.data ?? []
  const makeupCatalog = makeupCatalogQuery.data ?? []

  const [activeTab, setActiveTab] = useState('')
  const [expanded, setExpanded] = useState(true)
  const [mobileAppliedOpen, setMobileAppliedOpen] = useState(false)
  const [appliedProducts, setAppliedProducts] = useState<string[]>([])
  const [imageSource, setImageSource] = useState('')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<MakeupVtoTaskStatus>('idle')
  const { validationState, validationError, validateAndSetImage, resetValidation } = useFaceValidation()

  useEffect(() => {
    if (!activeTab && categories.length > 0) {
      setActiveTab(categories[0].id)
    }
  }, [activeTab, categories])

  const visibleProducts = useMemo(() => {
    if (!activeTab) return products
    return products.filter((product) => product.category_id === activeTab)
  }, [activeTab, products])

  const toggleProduct = (id: string) => {
    setAppliedProducts((current) =>
      current.includes(id)
        ? current.filter((productId) => productId !== id)
        : [...current, id],
    )
  }

  const clearAppliedProducts = () => {
    setAppliedProducts([])
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
      const effects = buildEffectsFromProducts(appliedProducts, makeupCatalog)
      const apiEffects = buildApiEffects(effects)

      if (!imageSource) {
        throw new Error('Please upload a photo or select a model first.')
      }

      if (appliedProducts.length === 0) {
        throw new Error('Please apply at least one product first.')
      }

      if (apiEffects.length === 0) {
        throw new Error('Selected products need makeup config in Admin, including color and pattern when required.')
      }

      setTaskStatus('running')
      return runMakeupVirtualTryOn({
        imageSource,
        effects,
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
    appliedProducts.length > 0 &&
    validationState !== 'checking' &&
    !processMutation.isPending

  if (categoriesQuery.isLoading || productsQuery.isLoading || makeupCatalogQuery.isLoading) {
    return <Loader fullScreen label="Loading beauty catalog" />
  }

  if (categoriesQuery.error || productsQuery.error || makeupCatalogQuery.error) {
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
              products={products}
              onToggle={toggleProduct}
              onClear={clearAppliedProducts}
            />
          </div>
        </section>

        <aside className="flex min-h-0 flex-col border-l bg-white lg:h-full lg:flex-[8] lg:overflow-hidden">
          <div className="shrink-0 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-neutral-500">
                  Virtual try on
                </p>
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
              products={products}
              onToggle={toggleProduct}
              onClear={clearAppliedProducts}
              onClose={() => setMobileAppliedOpen(false)}
            />
          </div>
        </div>
      )}
    </main>
  )
}
