import { getLocalStorageItem } from '@/shared/lib/storage'
import type { SubscriptionTier } from '@/shared/types/auth'
import { dependencies } from '@/app/providers/DependencyProvider'

const SCAN_USAGE_STORAGE_KEY = 'ai_scan_usage_history'
const GUEST_SCAN_KEY = 'guest'

function getMonthPrefix(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function getUserKey(userId?: string) {
  return userId?.trim() ? userId : GUEST_SCAN_KEY
}

export function getScanQuotaForRole(role: SubscriptionTier | string) {
  return dependencies.useCases.scans.getScanQuotaForRole(role)
}

export function getScanUsageHistory() {
  return getLocalStorageItem<Record<string, string[]>>(SCAN_USAGE_STORAGE_KEY, {})
}

export function getScanUsageForUser(userId?: string) {
  const records = getScanUsageHistory()
  return records[getUserKey(userId)] ?? []
}

export async function getScanUsesThisMonth(userId?: string) {
  if (userId) {
    return dependencies.useCases.scans.getScanUsesThisMonth(userId)
  }

  const prefix = getMonthPrefix()
  return getScanUsageForUser(userId).filter((timestamp) => timestamp.startsWith(prefix)).length
}

export function registerScanUsage(userId?: string) {
  dependencies.useCases.scans.registerScanUsage(userId)
}
