import type { MakeupEffect, MakeupPalette } from '@/features/ai-scan/types/makeup-vto'

export type PatternCatalogItem = {
  category: string
  label: string
  thumbnail: string
  colorNum?: number
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

const catalogCache = new Map<string, PatternCatalogItem[]>()

export function hasPatternCatalog(category: string) {
  return Boolean(CATALOG_URLS[category])
}

export async function fetchPatternCatalog(category: string): Promise<PatternCatalogItem[]> {
  if (catalogCache.has(category)) {
    return catalogCache.get(category)!
  }

  const url = CATALOG_URLS[category]
  if (!url) return []

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Could not load patterns for ${category}`)
  const data = (await response.json()) as PatternCatalogItem[]
  catalogCache.set(category, data)
  return data
}

export function findPatternItem(catalog: PatternCatalogItem[], label?: string) {
  if (!label) return undefined
  return catalog.find((item) => item.label === label)
}

export function getPatternTabGroups(catalog: PatternCatalogItem[]) {
  const groups = new Map<string, PatternCatalogItem[]>()
  for (const item of catalog) {
    const key = item.category || 'All'
    const list = groups.get(key) ?? []
    list.push(item)
    groups.set(key, list)
  }
  return [...groups.entries()].map(([name, items]) => ({ name, items }))
}

const DEFAULT_PALETTE: MakeupPalette = {
  color: '#FF0000',
  texture: 'matte',
  colorIntensity: 50,
}

export function ensurePaletteCount(palettes: MakeupPalette[] | undefined, count: number): MakeupPalette[] {
  const next = [...(palettes ?? [])]
  while (next.length < count) {
    next.push({
      ...DEFAULT_PALETTE,
      color: count > 1 && next.length === 1 ? '#F2A53E' : DEFAULT_PALETTE.color,
    })
  }
  return next.slice(0, count)
}

export function applyPatternSelection(effect: MakeupEffect, pattern: PatternCatalogItem): MakeupEffect {
  const colorNum = Math.max(1, pattern.colorNum ?? 1)
  const isLipShape = effect.category === 'lip_color'

  if (isLipShape) {
    return {
      ...effect,
      shape: { name: pattern.label },
      palettes: ensurePaletteCount(effect.palettes, 1),
    }
  }

  return {
    ...effect,
    pattern: { ...effect.pattern, name: pattern.label },
    palettes: ensurePaletteCount(effect.palettes, colorNum),
  }
}

export function getActivePatternLabel(effect: MakeupEffect) {
  if (effect.category === 'lip_color') return effect.shape?.name
  return effect.pattern?.name
}
