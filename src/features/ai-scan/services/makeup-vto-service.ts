import type { MakeupEffect, MakeupVtoPayload } from '@/features/ai-scan/types/makeup-vto'
import { dependencies } from '@/app/providers/DependencyProvider'

export function isMakeupApiConfigured() {
  return dependencies.makeupVtoService.isConfigured()
}

export async function runMakeupVirtualTryOn(input: {
  imageSource: string
  effects: MakeupEffect[]
  userId?: string
  allowColorOnly?: boolean
}) {
  return dependencies.makeupVtoService.runVirtualTryOn(input as any) as Promise<{
    mode: 'api' | 'demo'
    taskId?: string
    resultUrl: string
    downloadUrl: string
    originalPublicUrl: string
    payload: MakeupVtoPayload
  }>
}
