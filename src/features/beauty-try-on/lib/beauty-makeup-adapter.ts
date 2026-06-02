import {
  buildApiEffects,
  DEFAULT_MAKEUP_EFFECTS,
} from '@/features/ai-scan/lib/makeup-defaults'
import type {
  MakeupEffect,
  MakeupPalette,
  MakeupTexture,
} from '@/features/ai-scan/types/makeup-vto'
import type { MakeupCatalogRow } from '@/services/supabase/database-service'

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

function buildColorTextureEffect(item: MakeupCatalogRow): MakeupEffect | null {
  const color = item.primaryColor?.trim()

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
        colorIntensity:
          item.colorIntensity ?? existingPalette.colorIntensity ?? 50,
        ...(isMakeupTexture(item.texture) ? { texture: item.texture } : {}),
      },
    ],
  }
}

export function buildBeautyMakeupEffects(
  productIds: string[],
  catalog: MakeupCatalogRow[],
) {
  return productIds
    .map((productId) => catalog.find((item) => item.productId === productId))
    .filter((item): item is MakeupCatalogRow => Boolean(item))
    .map(buildColorTextureEffect)
    .filter((effect): effect is MakeupEffect => Boolean(effect))
}

export function hasBeautyMakeupPayload(effects: MakeupEffect[]) {
  return buildApiEffects(effects, { allowColorOnly: true }).length > 0
}
