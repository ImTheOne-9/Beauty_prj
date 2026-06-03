import {
  buildApiEffects,
  DEFAULT_MAKEUP_EFFECTS,
} from '@/features/ai-scan/lib/makeup-defaults'
import {
  applyPaletteTextureDefaults,
  ensurePaletteCount,
} from '@/features/ai-scan/lib/makeup-patterns'
import type {
  MakeupEffect,
  MakeupTexture,
} from '@/features/ai-scan/types/makeup-vto'
import type {
  AdminProductVariantRecord,
  MakeupCatalogRow,
} from '@/services/supabase/database-service'
import {
  type BeautyAppliedSelection,
  getBeautySelectionColorCount,
} from '@/features/beauty-try-on/lib/beauty-selection'

const MAKEUP_TEXTURES = new Set<MakeupTexture>([
  'matte',
  'satin',
  'shimmer',
  'gloss',
  'metallic',
  'sheer',
  'holographic',
])

const TEXTURE_CATEGORIES = new Set([
  'blush',
  'eye_liner',
  'eye_shadow',
  'eyebrows',
  'lip_color',
  'lip_liner',
])

function isMakeupTexture(value: string | null): value is MakeupTexture {
  return Boolean(value && MAKEUP_TEXTURES.has(value as MakeupTexture))
}

function supportsTexture(category: string) {
  return TEXTURE_CATEGORIES.has(category)
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
  if (category === 'skin_smooth') {
    return {
      ...base,
      category,
      enabled: true,
      skinSmoothStrength: base.skinSmoothStrength ?? 50,
      skinSmoothColorIntensity: base.skinSmoothColorIntensity ?? 50,
    }
  }

  const patternName = selection.patternName?.trim()
  const colorCount = getBeautySelectionColorCount(category, patternName)
  const paletteTemplates = ensurePaletteCount(base.palettes, colorCount, category)

  return {
    ...base,
    category,
    enabled: true,
    pattern:
      patternName && category === 'eyebrows'
        ? {
            type: 'shape',
            name: patternName,
            curvature: base.pattern?.curvature ?? 50,
            thickness: base.pattern?.thickness ?? 50,
            definition: base.pattern?.definition ?? 50,
          }
        : patternName && category !== 'lip_color'
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
    style:
      category === 'lip_color'
        ? { type: 'full' }
        : base.style,
    palettes: paletteTemplates.map((template, index) => {
      const selectedVariant = selectedVariants[index] ?? variant
      const color = selectedVariant.color_hex.trim()
      const palette = {
        ...template,
        color,
        colorIntensity: item.colorIntensity ?? template.colorIntensity ?? 50,
        ...(selectedVariant.shimmer_color?.trim()
          ? { shimmerColor: selectedVariant.shimmer_color.trim() }
          : {}),
        ...(supportsTexture(category) && isMakeupTexture(selectedVariant.texture)
          ? { texture: selectedVariant.texture }
          : {}),
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
