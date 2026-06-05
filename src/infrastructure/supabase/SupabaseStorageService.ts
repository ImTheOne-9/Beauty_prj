import type { IStorageService } from '@/core/interfaces';
import { supabase } from '@/infrastructure/supabase/client';

const SCAN_BUCKET = 'scan-images';
const AVATAR_BUCKET = 'avatars';
const MAKEUP_SCAN_BUCKET = 'makeup_scans';

function toStorageError(
  error: { message?: string; statusCode?: string },
  fallback: string,
  bucket: string,
  sqlFile: string,
) {
  const message = error.message ?? fallback;
  if (message.includes('Bucket not found') || error.statusCode === '404') {
    throw new Error(
      `Bucket "${bucket}" does not exist on Supabase. Please go to Supabase → SQL Editor and run the ${sqlFile} script.`,
    );
  }
  if (message.includes('row-level security') || error.statusCode === '403') {
    throw new Error(
      `Unauthorized to upload to "${bucket}". Please ensure you are logged in and have executed ${sqlFile} in the Supabase SQL Editor.`,
    );
  }
  throw new Error(message);
}

/**
 * Supabase implementation of IStorageService.
 */
export class SupabaseStorageService implements IStorageService {
  async uploadScanImage(file: File, fileName: string): Promise<unknown> {
    const { data, error } = await supabase.storage
      .from(SCAN_BUCKET)
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      toStorageError(
        error,
        'Could not upload scan image',
        SCAN_BUCKET,
        'supabase/sql/005_scan_images_storage.sql',
      );
    }
    return data;
  }

  getPublicImageUrl(path: string): string {
    return supabase.storage.from(SCAN_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(extension)
      ? extension
      : 'jpg';
    const path = `${userId}/avatar.${safeExtension === 'jpeg' ? 'jpg' : safeExtension}`;

    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      toStorageError(
        error,
        'Could not upload avatar',
        AVATAR_BUCKET,
        'supabase/sql/004_avatars_storage.sql',
      );
    }
    return supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async uploadMakeupResult(
    userId: string,
    resultUrl: string,
    scanId: string,
  ): Promise<string> {
    const response = await fetch(resultUrl);
    const rawBlob = await response.blob();

    const urlPath = new URL(resultUrl).pathname;
    const extension = urlPath.endsWith('.png') ? 'png' : 'jpg';
    const contentType = extension === 'png' ? 'image/png' : 'image/jpeg';
    const path = `${userId}/${scanId}_result.${extension}`;

    const blob = new Blob([rawBlob], { type: contentType });

    const { error } = await supabase.storage
      .from(MAKEUP_SCAN_BUCKET)
      .upload(path, blob, {
        upsert: true,
        contentType,
      });

    if (error) {
      toStorageError(
        error,
        'Could not upload makeup result',
        MAKEUP_SCAN_BUCKET,
        'supabase/sql/006_makeup_scans_storage.sql',
      );
    }

    return supabase.storage.from(MAKEUP_SCAN_BUCKET).getPublicUrl(path).data.publicUrl;
  }
}
