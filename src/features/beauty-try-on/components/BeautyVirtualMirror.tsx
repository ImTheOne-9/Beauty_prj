import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  Upload,
  X,
} from 'lucide-react'

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
  const previewUrl = resultUrl || imageSource || '/images/model.png'
  const isProcessing = status === 'running' || status === 'processing' || status === 'queued'

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
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold shadow-sm">
          <Upload size={16} />
          Upload
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

      <div className="absolute right-4 top-4 z-10">
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

      <div className="absolute inset-x-4 bottom-4 z-10 rounded-xl border bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-neutral-500">
              Choose model
            </p>
            <p className="truncate text-sm text-neutral-700">
              Upload a photo or select a sample model.
            </p>
          </div>

          {validationState === 'checking' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Checking
            </span>
          )}

          {validationState === 'valid' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Face OK
            </span>
          )}
        </div>

        {validationError && (
          <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="mt-3 grid grid-cols-6 gap-2">
          {SAMPLE_SELFIES.map((sample) => {
            const selected = imageSource === sample.fullUrl
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectModel(sample.fullUrl)}
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

      <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-40 pt-20">
        <img
          src={previewUrl}
          alt="Virtual try-on preview"
          className="max-h-full w-auto max-w-full object-contain"
        />
      </div>
    </div>
  )
}
