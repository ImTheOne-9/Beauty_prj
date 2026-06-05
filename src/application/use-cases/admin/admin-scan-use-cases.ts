import type { AdminUseCaseDependencies } from './admin-dependencies';
import { mapAdminRecommendation, mapAdminScan } from '@/application/mappers/admin-mappers';
import type { AdminRecommendationInput } from '@/application/dtos/admin';
import type { ScanResult } from '@/core/entities';

export function createAdminScanUseCases(deps: AdminUseCaseDependencies) {
  return {
    async getScanHistory(userId: string) {
      const scans = await deps.scanRepo.getScanHistory(userId);
      return scans.map(mapAdminScan);
    },
    getScanCountThisMonth: (userId: string) => deps.scanRepo.getScanCountThisMonth(userId),
    async getAdminScans() {
      const scans = await deps.scanRepo.getAdminScans();
      return scans.map(mapAdminScan);
    },
    deleteScan: (id: string) => deps.scanRepo.deleteScan(id),
    saveScan: (userId: string, scanResult: ScanResult) => deps.scanRepo.saveScan(userId, scanResult),
    async saveRecommendations(scanId: string, items: AdminRecommendationInput[]) {
      await deps.recommendationRepo.save(
        scanId,
        items.map((item) => ({
          productId: item.productId,
          reason: item.reason,
        })),
      );
    },
    async getAdminRecommendations() {
      const recommendations = await deps.recommendationRepo.getAll();
      return recommendations.map(mapAdminRecommendation);
    },
  };
}
