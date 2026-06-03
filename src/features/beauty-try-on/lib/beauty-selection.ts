import { getPatternColorCount } from '@/features/ai-scan/lib/makeup-patterns'

export type BeautyAppliedSelection = {
  productId: string
  variantId: string
  colorVariantIds?: string[]
  patternName?: string
}

export function getBeautySelectionColorCount(
  category?: string | null,
  patternName?: string,
) {
  if (category === 'lip_color') return 1
  if (category && patternName && category !== 'lip_color') {
    return getPatternColorCount(patternName)
  }
  return 1
}
