import { useCallback, useState } from 'react'
import { useDependencies } from '@/app/providers/DependencyProvider'

export type ImageValidationState = 'idle' | 'checking' | 'valid' | 'invalid'

type UseFaceValidationReturn = {
  validationState: ImageValidationState
  validationError: string | null
  validateAndSetImage: (imageSource: string) => Promise<boolean>
  resetValidation: () => void
}

/**
 * Hook to validate images for face presence
 * Manages the validation state and error messages
 */
export function useFaceValidation(): UseFaceValidationReturn {
  const { useCases } = useDependencies()
  const [validationState, setValidationState] = useState<ImageValidationState>('idle')
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateAndSetImage = useCallback(async (imageSource: string): Promise<boolean> => {
    setValidationState('checking')
    setValidationError(null)

    try {
      const result = await useCases.scans.validateFaceImage(imageSource)

      if (result.isValid) {
        setValidationState('valid')
        return true
      } else {
        setValidationState('invalid')
        setValidationError(result.message || 'Image validation failed')
        return false
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown validation error'
      setValidationState('invalid')
      setValidationError(message)
      return false
    }
  }, [useCases.scans])

  const resetValidation = useCallback(() => {
    setValidationState('idle')
    setValidationError(null)
  }, [])

  return {
    validationState,
    validationError,
    validateAndSetImage,
    resetValidation,
  }
}
