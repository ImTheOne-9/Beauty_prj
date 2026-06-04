import type { IRecommendationRepository } from '@/core/interfaces';
import type { Recommendation, SaveRecommendationInput, ScanProductRecommendation } from '@/core/entities';
import { supabase } from '@/infrastructure/supabase/client';

/**
 * Supabase implementation of IRecommendationRepository.
 */
export class SupabaseRecommendationRepository implements IRecommendationRepository {
  async save(scanId: string, items: SaveRecommendationInput[]): Promise<void> {
    if (items.length === 0) return;
    const { error } = await supabase.from('recommendations' as any).insert(
      items.map((item) => ({
        scan_id: scanId,
        product_id: item.productId,
        reason: item.reason ?? '',
      })) as any,
    );
    if (error) throw error;
  }

  async getAll(): Promise<Recommendation[]> {
    const { data, error } = await supabase
      .from('recommendations' as any)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data as any[]) ?? []).map((row) => ({
      id: row.id,
      scanId: row.scan_id,
      productId: row.product_id,
      reason: row.reason,
      createdAt: row.created_at,
    }));
  }

  async getByScanIdWithProduct(scanId: string): Promise<ScanProductRecommendation[]> {
    const { data, error } = await (supabase as any)
      .from('recommendations')
      .select(`
        id,
        reason,
        product:products (
          id,
          name,
          description,
          image_url,
          external_url,
          brand
        )
      `)
      .eq('scan_id', scanId);
    if (error) throw error;
    return ((data as any[]) ?? []).map((row) => ({
      id: row.id,
      reason: row.reason,
      product: row.product ?? null,
    }));
  }
}
