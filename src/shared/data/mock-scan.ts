import { type ScanResult } from '@/shared/lib/types'

export const mockScanResult: ScanResult = {
  originalImage: '',
  appliedEffects: [],
  resultImageUrl: '',
  createdAt: new Date().toISOString(),
  mode: 'demo',
}