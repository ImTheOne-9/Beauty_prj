import type { IFaceDetector } from '@/core/interfaces/IServices';
import type { FaceDetectionResult } from '@/core/entities';
import { detectFaces, validateImage } from '@/features/ai-scan/services/face-detection-service';

/**
 * Face detector implementation wrapping face-detection-service.
 */
export class FaceApiDetector implements IFaceDetector {
  async detectFaces(imageSource: string): Promise<FaceDetectionResult> {
    return detectFaces(imageSource);
  }

  async validateImage(imageSource: string): Promise<{ isValid: boolean; message?: string }> {
    return validateImage(imageSource);
  }
}
