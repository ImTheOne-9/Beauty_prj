import type { MakeupEffect, MakeupVtoPayload, FaceDetectionResult } from '@/core/entities';

/**
 * Service interface for Makeup Virtual Try-On.
 */
export interface IMakeupVtoService {
  isConfigured(): boolean;
  runVirtualTryOn(input: {
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
  }>;
}

/**
 * Service interface for Face Detection.
 */
export interface IFaceDetector {
  detectFaces(imageSource: string): Promise<FaceDetectionResult>;
  validateImage(imageSource: string): Promise<{ isValid: boolean; message?: string }>;
}

/**
 * Service interface for Storage operations (file upload, public URL).
 */
export interface IStorageService {
  uploadScanImage(file: File, fileName: string): Promise<unknown>;
  getPublicImageUrl(path: string): string;
  uploadAvatar(userId: string, file: File): Promise<string>;
  uploadMakeupResult(userId: string, resultUrl: string, scanId: string): Promise<string>;
}
