import * as faceapi from 'face-api.js';
import type { IFaceDetector } from '@/core/interfaces/IServices';
import type { FaceDetectionResult } from '@/core/entities';

let modelsLoaded = false;

async function loadModels(): Promise<void> {
  if (modelsLoaded) return;

  const modelUrls = [
    'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/',
    'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/',
  ];

  let lastError: Error | null = null;

  for (const modelUrl of modelUrls) {
    try {
      console.log(`[FaceDetection] Attempting to load models from: ${modelUrl}`);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Load timeout for ${modelUrl}`)), 20000),
      );

      await Promise.race([
        Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl)]),
        timeoutPromise,
      ]);

      modelsLoaded = true;
      console.log('[FaceDetection] Models loaded successfully from:', modelUrl);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[FaceDetection] Failed to load from ${modelUrl}:`, lastError.message);
    }
  }

  const message = `Unable to load face detection models from any source. ${lastError?.message || 'Network error'} Please check your internet connection and try again.`;
  console.error('[FaceDetection]', message);
  throw new Error('Unable to load face detection models. Please refresh and try again.');
}

export class FaceApiDetector implements IFaceDetector {
  async detectFaces(imageSource: string): Promise<FaceDetectionResult> {
    try {
      await loadModels();

      const img = new Image();
      img.crossOrigin = 'anonymous';

      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            const detections = await faceapi.detectAllFaces(
              img,
              new faceapi.TinyFaceDetectorOptions(),
            );

            resolve({
              hasFace: detections.length > 0,
              detections: detections.length,
            });
          } catch (error) {
            console.error('Face detection error:', error);
            reject(new Error('Failed to analyze image. Please try a different image.'));
          }
        };

        img.onerror = () => {
          reject(new Error('Failed to load image. Please check the image URL or try uploading again.'));
        };

        img.src = imageSource;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error during face detection';
      return {
        hasFace: false,
        detections: 0,
        error: message,
      };
    }
  }

  async validateImage(imageSource: string): Promise<{ isValid: boolean; message?: string }> {
    const result = await this.detectFaces(imageSource);

    if (result.error) {
      return {
        isValid: false,
        message: result.error,
      };
    }

    if (!result.hasFace) {
      return {
        isValid: false,
        message: 'No face detected, please retake the photo more clearly',
      };
    }

    return {
      isValid: true,
    };
  }
}
