import {
  buildApiEffects,
  DEFAULT_MAKEUP_EFFECTS,
} from '@/features/ai-scan/lib/makeup-defaults'
import type {
  MakeupEffect,
  MakeupPalette,
  MakeupTexture,
} from '@/features/ai-scan/types/makeup-vto'
import type {
  AdminProductVariantRecord,
  MakeupCatalogRow,
} from '@/services/supabase/database-service'

export type BeautyAppliedSelection = {
  productId: string
  variantId: string
}

const MAKEUP_TEXTURES = new Set<MakeupTexture>([
  'matte',
  'satin',
  'shimmer',
  'gloss',
  'metallic',
])

const DEFAULT_PATTERN_BY_CATEGORY: Record<string, string> = {
  lip_liner: 'Large&Full1',
}

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
): MakeupEffect | null {
  const color = variant.color_hex?.trim()

  if (!color) {
    return null
  }

  const category = item.apiCategoryKey
  const base = cloneDefaultEffect(category)
  const existingPalette: Partial<MakeupPalette> = base.palettes?.[0] ?? {}
  const patternName = DEFAULT_PATTERN_BY_CATEGORY[category]

  return {
    ...base,
    category,
    enabled: true,
    pattern: patternName
      ? {
          ...base.pattern,
          name: patternName,
        }
      : base.pattern,
    palettes: [
      {
        ...existingPalette,
        color,
        colorIntensity: item.colorIntensity ?? existingPalette.colorIntensity ?? 50,
        ...(isMakeupTexture(variant.texture) ? { texture: variant.texture } : {}),
      },
    ],
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
      return item && variant ? buildColorTextureEffect(item, variant) : null
    })
    .filter((effect): effect is MakeupEffect => Boolean(effect))
}

export function hasBeautyMakeupPayload(effects: MakeupEffect[]) {
  return buildApiEffects(effects, { allowColorOnly: true }).length > 0
}
