import { type ScanResult } from '@/core/entities'

export const mockScanResult: ScanResult = {
  originalImage: '',
  appliedEffects: [],
  resultImageUrl: '',
  createdAt: new Date().toISOString(),
  mode: 'demo',
}