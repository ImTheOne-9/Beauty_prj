import type { IScanRepository, IStorageService } from '@/core/interfaces';
import type { Scan, ScanResult } from '@/core/entities';
import { supabase, type Json } from '@/infrastructure/supabase/client';

export class SupabaseScanRepository implements IScanRepository {
  constructor(_storageService?: IStorageService) {}

  async getScanHistory(userId: string): Promise<Scan[]> {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRowToScan);
  }

  async getScanCountThisMonth(userId: string): Promise<number> {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const { count, error } = await supabase
      .from('scans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', start.toISOString());
    if (error) throw error;
    return count ?? 0;
  }

  async getAdminScans(): Promise<Scan[]> {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRowToScan);
  }

  async saveScan(userId: string, scanResult: ScanResult): Promise<string> {
    const { data, error } = await supabase
      .from('scans')
      .insert({
        user_id: userId,
        image_url: scanResult.resultImageUrl,
        effects: scanResult.appliedEffects as unknown as Json,
      })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  async deleteScan(id: string): Promise<void> {
    const { error } = await supabase.from('scans').delete().eq('id', id);
    if (error) throw error;
  }
}

function mapRowToScan(row: Record<string, unknown>): Scan {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    userId: row.user_id as string,
    originalImage: (row.original_image as string | null) ?? null,
    imageUrl: (row.image_url as string | null) ?? null,
    effects: Array.isArray(row.effects) ? row.effects : [],
    mode: row.mode === 'demo' ? 'demo' : 'api',
  };
}
