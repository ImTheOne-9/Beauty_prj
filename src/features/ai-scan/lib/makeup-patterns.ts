import type { MakeupEffect, MakeupPalette } from '@/features/ai-scan/types/makeup-vto'

export type PatternCatalogItem = {
  category: string
  label: string
  thumbnail: string
  colorNum?: number
}

function readCategory(raw: Record<string, unknown>): string {
  const value = raw.category
  return typeof value === 'string' ? value.trim() : ''
}

function normalizePatternItem(raw: Record<string, unknown>): PatternCatalogItem {
  const label = String(raw.label ?? raw.name ?? '')
  const colorNumRaw = raw.colorNum ?? raw.color_num
  const parsed =
    typeof colorNumRaw === 'number'
      ? colorNumRaw
      : typeof colorNumRaw === 'string'
        ? Number(colorNumRaw)
        : undefined

  return {
    category: readCategory(raw),
    label,
    thumbnail: String(raw.thumbnail ?? raw.thumb ?? ''),
    colorNum: Number.isFinite(parsed) && parsed! > 0 ? parsed : inferColorCountFromLabel(label),
  }
}

export function isColorPatternCategory(category?: string) {
  return Boolean(category && COLOR_PATTERN_CATEGORIES.has(category))
}

/** e.g. "2colors1" → 2, "3colors2" → 3, "1color2" → 1 */
export function inferColorCountFromLabel(label?: string): number {
  if (!label) return 1
  const colorsMatch = label.match(/(\d+)\s*colors?/i)
  if (colorsMatch) return clampColorCount(Number(colorsMatch[1]))
  const colorMatch = label.match(/^(\d+)color/i)
  if (colorMatch) return clampColorCount(Number(colorMatch[1]))
  return 1
}

function clampColorCount(value: number) {
  return Math.min(5, Math.max(1, value))
}

export function getPatternColorCount(label?: string, item?: PatternCatalogItem): number {
  if (item?.colorNum && item.colorNum > 0) return clampColorCount(item.colorNum)
  return inferColorCountFromLabel(label)
}

const CATALOG_URLS: Record<string, string> = {
  blush: 'https://plugins-media.makeupar.com/wcm-saas/patterns/blush.json',
  bronzer: 'https://plugins-media.makeupar.com/wcm-saas/patterns/bronzer.json',
  contour: 'https://plugins-media.makeupar.com/wcm-saas/patterns/contour.json',
  eye_liner: 'https://plugins-media.makeupar.com/wcm-saas/patterns/eyeliner.json',
  eye_shadow: 'https://plugins-media.makeupar.com/wcm-saas/patterns/eyeshadow.json',
  eyebrows: 'https://plugins-media.makeupar.com/wcm-saas/patterns/eyebrows.json',
  eyelashes: 'https://plugins-media.makeupar.com/wcm-saas/patterns/eyelashes.json',
  highlighter: 'https://plugins-media.makeupar.com/wcm-saas/patterns/highlighter.json',
  lip_liner: 'https://plugins-media.makeupar.com/wcm-saas/patterns/lipliner.json',
  lip_color: 'https://plugins-media.makeupar.com/wcm-saas/shapes/lipshape.json',
}

export const CATALOG_CACHE_VERSION = 3
const catalogCache = new Map<string, { version: number; data: PatternCatalogItem[] }>()

export const COLOR_PATTERN_CATEGORIES = new Set([
  'blush',
  'eye_shadow',
  'eye_liner',
])

const COLOR_TAB_ORDER = ['1 color', '2 colors', '3 colors', '4 colors', '5 colors'] as const

const COLOR_TAB_BY_NUM: Record<number, string> = {
  1: '1 color',
  2: '2 colors',
  3: '3 colors',
  4: '4 colors',
  5: '5 colors',
}

export function hasPatternCatalog(category: string) {
  return Boolean(CATALOG_URLS[category])
}

export async function fetchPatternCatalog(category: string): Promise<PatternCatalogItem[]> {
  const cached = catalogCache.get(category)
  if (cached?.version === CATALOG_CACHE_VERSION) {
    return cached.data
  }

  const url = CATALOG_URLS[category]
  if (!url) return []

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Could not load patterns for ${category}`)
  const json = (await response.json()) as unknown
  const raw = Array.isArray(json)
    ? json
    : ((json as { data?: unknown[] }).data ?? (json as { patterns?: unknown[] }).patterns ?? [])
  const data = (raw as Record<string, unknown>[]).map(normalizePatternItem)
  catalogCache.set(category, { version: CATALOG_CACHE_VERSION, data })
  return data
}

export function findPatternItem(catalog: PatternCatalogItem[], label?: string) {
  if (!label) return undefined
  return catalog.find((item) => item.label === label)
}

function resolveColorTabName(item: PatternCatalogItem): (typeof COLOR_TAB_ORDER)[number] {
  const fromApi = item.category?.trim()
  if (fromApi && (COLOR_TAB_ORDER as readonly string[]).includes(fromApi)) {
    return fromApi as (typeof COLOR_TAB_ORDER)[number]
  }
  return (COLOR_TAB_BY_NUM[getPatternColorCount(item.label, item)] ?? '1 color') as (typeof COLOR_TAB_ORDER)[number]
}

function getColorPatternTabGroups(catalog: PatternCatalogItem[]) {
  const buckets: Record<(typeof COLOR_TAB_ORDER)[number], PatternCatalogItem[]> = {
    '1 color': [],
    '2 colors': [],
    '3 colors': [],
    '4 colors': [],
    '5 colors': [],
  }

  for (const item of catalog) {
    buckets[resolveColorTabName(item)].push(item)
  }

  return COLOR_TAB_ORDER.map((name) => ({ name, items: buckets[name] })).filter((tab) => tab.items.length > 0)
}

export function getPatternTabGroups(catalog: PatternCatalogItem[], effectCategory?: string) {
  if (!catalog.length) return []

  if (isColorPatternCategory(effectCategory)) {
    return getColorPatternTabGroups(catalog)
  }

  const groups = new Map<string, PatternCatalogItem[]>()
  for (const item of catalog) {
    const key = item.category?.trim() || 'All'
    const list = groups.get(key) ?? []
    list.push(item)
    groups.set(key, list)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, items]) => ({ name, items }))
}

const DEFAULT_PALETTE: MakeupPalette = {
  color: '#FF0000',
  colorIntensity: 50,
}

const DEFAULT_SHIMMER_COLOR = '#FFFFFF'
const TEXTURE_CATEGORIES = new Set([
  'blush',
  'eye_liner',
  'eye_shadow',
  'eyebrows',
  'lip_color',
  'lip_liner',
])

export function applyPaletteTextureDefaults(
  category: string,
  palette: MakeupPalette,
): MakeupPalette {
  const {
    shimmerColor: _shimmerColor,
    shimmerIntensity: _shimmerIntensity,
    shimmerDensity: _shimmerDensity,
    shimmerSize: _shimmerSize,
    metallicIntensity: _metallicIntensity,
    glowStrength: _glowStrength,
    gloss: _gloss,
    transparencyIntensity: _transparencyIntensity,
    ...base
  } = palette

  if (category === 'lip_color' && palette.texture === 'gloss') {
    return {
      ...base,
      gloss: palette.gloss ?? 50,
      transparencyIntensity: palette.transparencyIntensity ?? 0,
    }
  }

  if (category === 'lip_color' && palette.texture === 'sheer') {
    return {
      ...base,
      gloss: palette.gloss ?? 50,
      transparencyIntensity: palette.transparencyIntensity ?? 0,
    }
  }

  if (category === 'lip_color' && palette.texture === 'shimmer') {
    return {
      ...base,
      gloss: palette.gloss ?? 50,
      shimmerColor: palette.shimmerColor ?? DEFAULT_SHIMMER_COLOR,
      shimmerIntensity: palette.shimmerIntensity ?? 50,
      shimmerDensity: palette.shimmerDensity ?? 50,
      shimmerSize: palette.shimmerSize ?? 50,
      transparencyIntensity: palette.transparencyIntensity ?? 0,
    }
  }

  if (category === 'lip_color' && ['holographic', 'metallic'].includes(palette.texture ?? '')) {
    return {
      ...base,
      gloss: palette.gloss ?? 50,
      shimmerColor: palette.shimmerColor ?? DEFAULT_SHIMMER_COLOR,
      shimmerIntensity: palette.shimmerIntensity ?? 50,
      shimmerDensity: palette.shimmerDensity ?? 50,
      shimmerSize: palette.shimmerSize ?? 50,
    }
  }

  if (category === 'blush' && palette.texture === 'satin') {
    return {
      ...base,
      glowStrength: palette.glowStrength ?? 50,
    }
  }

  if (
    ['blush', 'eye_liner', 'eye_shadow'].includes(category) &&
    ['shimmer', 'holographic'].includes(palette.texture ?? '')
  ) {
    return {
      ...base,
      shimmerColor: palette.shimmerColor ?? DEFAULT_SHIMMER_COLOR,
      shimmerIntensity: palette.shimmerIntensity ?? 50,
      ...(category === 'blush'
        ? {
            shimmerDensity: palette.shimmerDensity ?? 50,
            glowStrength: palette.glowStrength ?? 50,
          }
        : {}),
    }
  }

  if (['eye_liner', 'eye_shadow'].includes(category) && palette.texture === 'metallic') {
    return {
      ...base,
      shimmerColor: palette.shimmerColor ?? DEFAULT_SHIMMER_COLOR,
      shimmerIntensity: palette.shimmerIntensity ?? 50,
      metallicIntensity: palette.metallicIntensity ?? 50,
    }
  }

  return base
}

export function ensurePaletteCount(
  palettes: MakeupPalette[] | undefined,
  count: number,
  category?: string,
): MakeupPalette[] {
  const next = [...(palettes ?? [])]
  const defaultColors = ['#FF0000', '#F2A53E', '#AB7EF7', '#E75957', '#D9F5F9']
  while (next.length < count) {
    const extra: Partial<MakeupPalette> = {}
    if (category && TEXTURE_CATEGORIES.has(category)) {
      extra.texture = 'matte'
    }

    if (category === 'highlighter') {
      extra.glowIntensity = 50
      extra.shimmerDensity = 50
      extra.shimmerIntensity = 50
      extra.shimmerSize = 50
    } else if (category === 'lip_liner') {
      extra.smoothness = 50
      extra.thickness = 50
    } else if (category === 'foundation') {
      extra.coverageIntensity = 50
      extra.glowIntensity = 0
    } else if (category === 'concealer') {
      extra.colorUnderEyeIntensity = 50
      extra.coverageLevel = 50
    } else if (category === 'eyebrows') {
      extra.texture = 'matte'
    }

    next.push({
      ...DEFAULT_PALETTE,
      ...extra,
      color: defaultColors[next.length] ?? DEFAULT_PALETTE.color,
    })
  }
  return next.slice(0, count).map((palette) => applyPaletteTextureDefaults(category ?? '', palette))
}

export function applyPatternSelection(effect: MakeupEffect, pattern: PatternCatalogItem): MakeupEffect {
  const colorNum = getPatternColorCount(pattern.label, pattern)
  const isLipShape = effect.category === 'lip_color'

  if (isLipShape) {
    return {
      ...effect,
      shape: { name: pattern.label },
      palettes: ensurePaletteCount(effect.palettes, 1, effect.category),
    }
  }

  return {
    ...effect,
    pattern: { ...effect.pattern, name: pattern.label },
    palettes: ensurePaletteCount(effect.palettes, colorNum, effect.category),
  }
}

export function getActivePatternLabel(effect: MakeupEffect) {
  if (effect.category === 'lip_color') return effect.shape?.name
  return effect.pattern?.name
}

export function categoryNeedsPatternFirst(category: string) {
  return hasPatternCatalog(category)
}

export function isPatternChosen(effect: MakeupEffect) {
  return Boolean(getActivePatternLabel(effect)?.trim())
}

/** Reset pattern/palettes when user enables a category — colors appear only after picking a pattern. */
export function prepareEffectForEnable(effect: MakeupEffect): MakeupEffect {
  if (!categoryNeedsPatternFirst(effect.category)) {
    return { ...effect, enabled: true }
  }
  if (effect.category === 'lip_color') {
    return {
      ...effect,
      enabled: true,
      shape: undefined,
      palettes: undefined,
    }
  }
  if (effect.category === 'eyebrows') {
    return {
      ...effect,
      enabled: true,
      pattern: { type: 'shape' },
      palettes: undefined,
    }
  }
  return {
    ...effect,
    enabled: true,
    pattern: undefined,
    palettes: undefined,
  }
}

export function syncEffectPaletteCount(
  effect: MakeupEffect,
  catalog: PatternCatalogItem[],
): MakeupEffect {
  const label = getActivePatternLabel(effect)
  if (!label || !hasPatternCatalog(effect.category)) return effect
  const item = findPatternItem(catalog, label)
  const count = getPatternColorCount(label, item)
  const current = effect.palettes?.length ?? 0
  if (current === count) return effect
  return { ...effect, palettes: ensurePaletteCount(effect.palettes, count, effect.category) }
}
