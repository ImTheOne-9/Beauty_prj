import {
  buildApiEffects,
  DEFAULT_MAKEUP_EFFECTS,
} from '@/features/ai-scan/lib/makeup-defaults'
import {
  applyPaletteTextureDefaults,
  ensurePaletteCount,
  getPatternColorCount,
} from '@/features/ai-scan/lib/makeup-patterns'
import type {
  MakeupEffect,
  MakeupTexture,
} from '@/features/ai-scan/types/makeup-vto'
import type {
  AdminProductVariantRecord,
  MakeupCatalogRow,
} from '@/services/supabase/database-service'

export type BeautyAppliedSelection = {
  productId: string
  variantId: string
  colorVariantIds?: string[]
  patternName?: string
}

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

function cloneDefaultEffect(category: string): MakeupEffect {
  const template = DEFAULT_MAKEUP_EFFECTS.find(
    (effect) => effect.category === category,
  )

  if (!template) {
    return { category }
  }

  return {
    ...template,
    palettes: template.palettes?.map((palette) => ({ ...palette })),
    pattern: template.pattern ? { ...template.pattern } : undefined,
    shape: template.shape ? { ...template.shape } : undefined,
    style: template.style ? { ...template.style } : undefined,
    morphology: template.morphology ? { ...template.morphology } : undefined,
  }
}

function buildColorTextureEffect(
  item: MakeupCatalogRow,
  variant: AdminProductVariantRecord,
  variants: AdminProductVariantRecord[],
  selection: BeautyAppliedSelection,
): MakeupEffect | null {
  const selectedVariantIds = selection.colorVariantIds?.length
    ? selection.colorVariantIds
    : [selection.variantId]
  const selectedVariants = selectedVariantIds
    .map((variantId) => variants.find((entry) => entry.id === variantId))
    .filter((entry): entry is AdminProductVariantRecord => Boolean(entry?.color_hex?.trim()))

  if (selectedVariants.length === 0) {
    return null
  }

  const category = item.apiCategoryKey
  const base = cloneDefaultEffect(category)
  const patternName = selection.patternName?.trim()
  const colorCount = patternName && category !== 'lip_color'
    ? getPatternColorCount(patternName)
    : 1
  const paletteTemplates = ensurePaletteCount(base.palettes, colorCount, category)

  return {
    ...base,
    category,
    enabled: true,
    pattern:
      patternName && category !== 'lip_color'
        ? {
            ...base.pattern,
            name: patternName,
          }
        : base.pattern,
    shape:
      patternName && category === 'lip_color'
        ? {
            ...base.shape,
            name: patternName,
          }
        : base.shape,
    palettes: paletteTemplates.map((template, index) => {
      const selectedVariant = selectedVariants[index] ?? variant
      const color = selectedVariant.color_hex.trim()
      const palette = {
        ...template,
        color,
        colorIntensity: item.colorIntensity ?? template.colorIntensity ?? 50,
        ...(isMakeupTexture(selectedVariant.texture) ? { texture: selectedVariant.texture } : {}),
      }
      return applyPaletteTextureDefaults(category, palette)
    }),
  }
}

export function buildBeautyMakeupEffects(
  selections: BeautyAppliedSelection[],
  catalog: MakeupCatalogRow[],
  variants: AdminProductVariantRecord[],
) {
  return selections
    .map((selection) => {
      const item = catalog.find((catalogItem) => catalogItem.productId === selection.productId)
      const variant = variants.find((entry) => entry.id === selection.variantId)
      return item && variant ? buildColorTextureEffect(item, variant, variants, selection) : null
    })
    .filter((effect): effect is MakeupEffect => Boolean(effect))
}

export function hasBeautyMakeupPayload(effects: MakeupEffect[]) {
  return buildApiEffects(effects, { allowColorOnly: true }).length > 0
}
