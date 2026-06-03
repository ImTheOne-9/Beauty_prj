import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Images,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { SAMPLE_SELFIES } from '@/features/ai-scan/lib/makeup-defaults'
import type { MakeupVtoTaskStatus } from '@/features/ai-scan/types/makeup-vto'

interface Props {
  expanded: boolean
  imageSource: string
  resultUrl: string | null
  status: MakeupVtoTaskStatus
  validationState: 'idle' | 'checking' | 'valid' | 'invalid'
  validationError: string | null
  appliedCount: number
  canApply: boolean
  onSelectModel: (imageUrl: string) => void
  onUploadPhoto: (file: File) => void
  onClearPhoto: () => void
  onApply: () => void
}

export default function BeautyVirtualMirror({
  expanded,
  imageSource,
  resultUrl,
  status,
  validationState,
  validationError,
  appliedCount,
  canApply,
  onSelectModel,
  onUploadPhoto,
  onClearPhoto,
  onApply,
}: Props) {
  const [modelsOpen, setModelsOpen] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const previewUrl =
    showOriginal && imageSource
      ? imageSource
      : resultUrl || imageSource || '/images/model.png'
  const isProcessing = status === 'running' || status === 'processing' || status === 'queued'

  useEffect(() => {
    setShowOriginal(false)
  }, [resultUrl])

  return (
    <div
      className={`
        relative flex min-h-0 flex-col overflow-hidden bg-neutral-100
        h-[55vh]
        lg:h-auto
        transition-all duration-300
        ${
          expanded
            ? 'lg:flex-[6]'
            : 'lg:flex-[12]'
        }
      `}
    >
      <div className="absolute left-4 top-4 z-10 flex gap-2">
        <label
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-white"
          aria-label="Upload photo"
          title="Upload photo"
        >
          <Upload size={16} />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onUploadPhoto(file)
              event.target.value = ''
            }}
          />
        </label>

        <button
          type="button"
          onClick={() => setModelsOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-white"
          aria-label="Choose model"
          aria-expanded={modelsOpen}
          title="Choose model"
        >
          <Images size={16} />
        </button>

        {imageSource && (
          <button
            type="button"
            onClick={onClearPhoto}
            className="rounded-full bg-white p-3 shadow-sm"
            aria-label="Clear photo"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="absolute right-4 top-4 z-10 flex gap-2">
        {resultUrl && imageSource && (
          <button
            type="button"
            onClick={() => setShowOriginal((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-white"
            aria-label={showOriginal ? 'Show try-on result' : 'Show original photo'}
            title={showOriginal ? 'Show try-on result' : 'Show original photo'}
          >
            {showOriginal ? (
              <Eye size={18} />
            ) : (
              <EyeOff size={18} />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onApply}
          disabled={!canApply || isProcessing}
          className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera size={18} />
          )}
          {isProcessing ? 'Applying' : `Apply ${appliedCount}`}
        </button>
      </div>

      {modelsOpen && (
        <div className="absolute left-4 top-20 z-20 w-[min(320px,calc(100%-2rem))] rounded-xl border bg-white/95 p-3 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-neutral-500">
                Choose model
              </p>
              <p className="truncate text-sm text-neutral-700">
                Select a sample model.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModelsOpen(false)}
              className="rounded-full p-1 hover:bg-neutral-100"
              aria-label="Close model picker"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {SAMPLE_SELFIES.map((sample) => {
              const selected = imageSource === sample.fullUrl
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    onSelectModel(sample.fullUrl)
                    setModelsOpen(false)
                  }}
                  className={`overflow-hidden rounded-lg border bg-white p-0.5 ${
                    selected ? 'border-black ring-2 ring-black' : 'border-neutral-200'
                  }`}
                >
                  <img
                    src={sample.thumbUrl}
                    alt={`Model ${sample.id}`}
                    className="aspect-[3/4] w-full object-cover"
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {(validationState === 'checking' || validationState === 'valid' || validationError) && (
        <div className="absolute inset-x-4 bottom-4 z-10 rounded-xl border bg-white/95 p-3 shadow-sm backdrop-blur">
          {validationState === 'checking' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Checking face
            </span>
          )}

          {validationState === 'valid' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Face OK
            </span>
          )}

          {validationError && (
            <div className="flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{validationError}</span>
          </div>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <img
          src={previewUrl}
          alt="Virtual try-on preview"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  )
}
