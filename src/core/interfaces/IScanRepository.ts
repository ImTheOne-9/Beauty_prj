import type { Scan, ScanProductRecommendation, ScanResult, Recommendation, SaveRecommendationInput, MakeupCatalogItem } from '@/core/entities';

/**
 * Repository interface for Scan operations.
 */
export interface IScanRepository {
  getScanHistory(userId: string): Promise<Scan[]>;
  getScanCountThisMonth(userId: string): Promise<number>;
  getAdminScans(): Promise<Scan[]>;
  saveScan(userId: string, scanResult: ScanResult): Promise<string>;
  deleteScan(id: string): Promise<void>;
}

/**
 * Repository interface for Recommendation operations.
 */
export interface IRecommendationRepository {
  save(scanId: string, items: SaveRecommendationInput[]): Promise<void>;
  getAll(): Promise<Recommendation[]>;
  getByScanIdWithProduct(scanId: string): Promise<ScanProductRecommendation[]>;
}

/**
 * Repository interface for Makeup Catalog (read-only composite view).
 */
export interface IMakeupCatalogRepository {
  getMakeupCatalog(): Promise<MakeupCatalogItem[]>;
}
