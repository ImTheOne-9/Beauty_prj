import type { IMakeupCatalogRepository, IProductRepository, IRecommendationRepository, IScanRepository } from '@/core/interfaces';
import type { ScanResult } from '@/shared/lib/types';
import { env } from '@/config/env';
import { matchProductsToEffects } from '@/features/ai-scan/lib/makeup-product-matcher';
import { getLocalStorageItem, setLocalStorageItem } from '@/shared/lib/storage';

const SCAN_USAGE_STORAGE_KEY = 'ai_scan_usage_history';
const GUEST_SCAN_KEY = 'guest';

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function getMonthPrefix(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function getUserKey(userId?: string) {
  return userId?.trim() ? userId : GUEST_SCAN_KEY;
}

function getScanUsageHistory() {
  return getLocalStorageItem<Record<string, string[]>>(SCAN_USAGE_STORAGE_KEY, {});
}

export function createScanUseCases(
  scanRepo: IScanRepository,
  recommendationRepo: IRecommendationRepository,
  makeupCatalogRepo: IMakeupCatalogRepository,
  productRepo: IProductRepository,
) {
  return {
    async getScanHistory(userId?: string) {
      if (userId) {
        const scans = await scanRepo.getScanHistory(userId);
        return scans.map((scan) => ({
          id: scan.id,
          created_at: scan.createdAt,
          user_id: scan.userId,
          original_image: scan.originalImage,
          image_url: scan.imageUrl,
          effects: scan.effects,
          mode: scan.mode,
        }));
      }

      if (env.allowGuestScans) {
        const raw = localStorage.getItem('guest_scans') || '[]';
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      }

      return [];
    },

    async getRecommendationsForScan(scan: any) {
      if (!scan) return [];

      if (!scan.user_id && !scan.userId) {
        const recList = scan.recommendations ?? [];
        const catalog = await productRepo.getAll();
        return recList
          .map((recommendation: any) => {
            const product = catalog.find((entry) => entry.id === recommendation.productId);
            return {
              id: recommendation.id,
              reason: recommendation.reason ?? 'Recommended product based on your try-on.',
              product: product
                ? {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    image_url: product.imageUrl,
                    external_url: product.externalUrl,
                    brand: product.brand,
                  }
                : null,
            };
          })
          .filter((recommendation: any) => recommendation.product !== null);
      }

      return recommendationRepo.getByScanIdWithProduct(scan.id);
    },

    getScanQuotaForRole(role: string) {
      switch (role) {
        case 'admin':
          return null;
        case 'premium':
          return 500;
        case 'pro':
          return 25;
        case 'free':
          return 2;
        case 'guest':
        default:
          return 0;
      }
    },

    async getScanUsesThisMonth(userId?: string) {
      if (userId) {
        return scanRepo.getScanCountThisMonth(userId);
      }

      const prefix = getMonthPrefix();
      const records = getScanUsageHistory();
      return (records[getUserKey(userId)] ?? []).filter((timestamp) => timestamp.startsWith(prefix)).length;
    },

    registerScanUsage(userId?: string) {
      if (userId) return;

      const key = getUserKey(userId);
      const history = getScanUsageHistory();
      const entry = new Date().toISOString();
      history[key] = [entry, ...(history[key] ?? [])].slice(0, 500);
      setLocalStorageItem(SCAN_USAGE_STORAGE_KEY, history);
    },

    async persistScan(userId: string, result: ScanResult) {
      const catalog = await makeupCatalogRepo.getMakeupCatalog().catch(() => []);
      const matched = matchProductsToEffects(result.appliedEffects, catalog);

      if ((!userId || userId === '') && env.allowGuestScans) {
        const id = makeId();
        const now = new Date().toISOString();
        const recommendations = matched.map((product) => ({
          id: makeId(),
          productId: product.productId,
          reason: product.matchReason,
        }));
        const scan = { id, userId: null, result, created_at: now, recommendations };
        const existing = JSON.parse(localStorage.getItem('guest_scans') || '[]');
        existing.unshift(scan);
        localStorage.setItem('guest_scans', JSON.stringify(existing));
        return id;
      }

      const scanId = await scanRepo.saveScan(userId, result);
      if (matched.length > 0) {
        await recommendationRepo.save(
          scanId,
          matched.map((product) => ({
            productId: product.productId,
            reason: product.matchReason,
          })),
        );
      }

      return scanId;
    },
  };
}
