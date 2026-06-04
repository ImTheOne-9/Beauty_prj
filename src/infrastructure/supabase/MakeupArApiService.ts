import type { IMakeupVtoService } from '@/core/interfaces/IServices';
import type { MakeupEffect, MakeupVtoPayload } from '@/core/entities';
import { buildApiEffects } from '@/features/ai-scan/lib/makeup-defaults';
import { supabase } from '@/infrastructure/supabase/client';
import { SupabaseStorageService } from '@/infrastructure/supabase/SupabaseStorageService';

type TaskResponse = {
  status?: number;
  data?: {
    task_id?: string;
    task_status?: string;
    results?: { url?: string; download_url?: string } | Array<{ download_url?: string }>;
    failure_reason?: string;
    error?: string;
    error_message?: string;
  };
  error?: string;
  error_code?: string;
};

export class MakeupArApiService implements IMakeupVtoService {
  private readonly storageService = new SupabaseStorageService();

  isConfigured(): boolean {
    return true;
  }

  async runVirtualTryOn(input: {
    imageSource: string;
    effects: MakeupEffect[];
    userId?: string;
    allowColorOnly?: boolean;
  }): Promise<{
    mode: 'api' | 'demo';
    taskId?: string;
    resultUrl: string;
    downloadUrl: string;
    originalPublicUrl: string;
    payload: MakeupVtoPayload;
  }> {
    const originalPublicUrl = await this.ensurePublicImageUrl(
      input.imageSource,
      input.userId ?? 'guest',
    );

    const payload: MakeupVtoPayload = {
      src_file_url: originalPublicUrl,
      effects: buildApiEffects(input.effects as any, {
        allowColorOnly: input.allowColorOnly,
      }) as MakeupEffect[],
      version: '1.0',
    };

    let startResponse: TaskResponse;
    try {
      startResponse = await this.callProxy({ action: 'start', payload });
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      return {
        mode: 'demo',
        resultUrl: originalPublicUrl,
        downloadUrl: originalPublicUrl,
        originalPublicUrl,
        payload,
      };
    }

    const taskId = startResponse.data?.task_id;
    if (!taskId) throw new Error('Makeup API did not return a task id.');

    for (let attempt = 0; attempt < 40; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const statusResponse = await this.callProxy({ action: 'status', taskId });
      const status = statusResponse.data?.task_status;

      if (status === 'success') {
        const resultUrl = extractResultUrl(statusResponse.data);
        if (!resultUrl) throw new Error('Task succeeded but no result image URL was returned.');
        return {
          mode: 'api',
          taskId,
          resultUrl,
          downloadUrl: resultUrl,
          originalPublicUrl,
          payload,
        };
      }

      if (status === 'error') {
        throw new Error(
          statusResponse.data?.failure_reason ??
          statusResponse.data?.error_message ??
          statusResponse.data?.error ??
          'Makeup processing failed.',
        );
      }
    }

    throw new Error('Makeup task timed out. Please try again.');
  }

  private async ensurePublicImageUrl(imageSource: string, userId: string) {
    if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
      return imageSource;
    }
    if (!imageSource.startsWith('data:') && !imageSource.startsWith('blob:')) {
      throw new Error('Unsupported image source. Upload a file or use a public URL.');
    }
    const response = await fetch(imageSource);
    const blob = await response.blob();
    const extension = blob.type.includes('png') ? 'png' : 'jpg';
    const file = new File([blob], `makeup-selfie.${extension}`, { type: blob.type || 'image/jpeg' });
    const fileName = `${userId || 'guest'}/makeup-${Date.now()}.${extension}`;
    await this.storageService.uploadScanImage(file, fileName);
    return this.storageService.getPublicImageUrl(fileName);
  }

  private async callProxy(body: object) {
    const { data, error } = await supabase.functions.invoke('makeup-proxy', { body });
    if (error) throw new Error(error.message);
    return data as TaskResponse;
  }
}

function extractResultUrl(data: TaskResponse['data']) {
  if (!data?.results) return null;
  if (Array.isArray(data.results)) return data.results[0]?.download_url ?? null;
  return data.results.url ?? data.results.download_url ?? null;
}
