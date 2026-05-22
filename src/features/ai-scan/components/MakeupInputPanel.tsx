import { useState, type ChangeEvent } from 'react'
import { ChevronRight, ExternalLink, Upload } from 'lucide-react'
import { CategoryEffectEditor } from '@/features/ai-scan/components/CategoryEffectEditor'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import {
  PlaygroundCheckbox,
  PlaygroundFieldLabel,
  PlaygroundSection,
  PlaygroundTabs,
} from '@/features/ai-scan/components/playground-ui'
import type { MakeupEffect } from '@/features/ai-scan/types/makeup-vto'
import {
  DEFAULT_MAKEUP_EFFECTS,
  MAKEUP_CATEGORY_META,
  SAMPLE_SELFIES,
} from '@/features/ai-scan/lib/makeup-defaults'
import { cn } from '@/shared/lib/cn'

type InputMode = 'url' | 'upload' | 'sample'

type MakeupInputPanelProps = {
  imageSource: string
  effects: MakeupEffect[]
  isProcessing: boolean
  apiConfigured: boolean
  onImageChange: (value: string) => void
  onEffectsChange: (effects: MakeupEffect[]) => void
  onProcess: () => void
}

function cloneDefaults() {
  return DEFAULT_MAKEUP_EFFECTS.map((effect) => ({
    ...effect,
    palettes: effect.palettes?.map((palette) => ({ ...palette })),
    pattern: effect.pattern ? { ...effect.pattern } : undefined,
    shape: effect.shape ? { ...effect.shape } : undefined,
    style: effect.style ? { ...effect.style } : undefined,
    morphology: effect.morphology ? { ...effect.morphology } : undefined,
  }))
}

function isSampleSelected(imageSource: string, fullUrl: string) {
  return imageSource === fullUrl
}

export function MakeupInputPanel({
  imageSource,
  effects,
  isProcessing,
  apiConfigured,
  onImageChange,
  onEffectsChange,
  onProcess,
}: MakeupInputPanelProps) {
  const [mode, setMode] = useState<InputMode>('sample')
  const [urlInput, setUrlInput] = useState('')
  const [showAllSamples, setShowAllSamples] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const visibleSamples = showAllSamples ? SAMPLE_SELFIES : SAMPLE_SELFIES.slice(0, 6)

  const updateEffect = (category: string, patch: Partial<MakeupEffect>) => {
    onEffectsChange(
      effects.map((effect) => (effect.category === category ? { ...effect, ...patch } : effect)),
    )
  }

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    onImageChange(URL.createObjectURL(file))
    setMode('upload')
  }

  const toggleCategory = (category: string) => {
    const effect = effects.find((item) => item.category === category)
    const nextEnabled = !(effect?.enabled !== false)
    updateEffect(category, { enabled: nextEnabled })
    if (nextEnabled) {
      setExpanded((state) => ({ ...state, [category]: true }))
    }
  }

  return (
    <div className="playground-panel flex h-full min-h-0 flex-col overflow-hidden rounded-[1rem] border border-rose-100 bg-white shadow-sm">
      <div className="playground-panel-inner min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        <form className="flex flex-col gap-6" onSubmit={(event) => event.preventDefault()}>
          {/* Authorization */}
          <PlaygroundSection title="Authorization">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-1 text-sm font-semibold text-rose-950">
                  API Key
                  <span className="text-[10px] font-normal text-mist">(from .env)</span>
                </label>
                <a
                  href="https://yce.makeupar.com/api-console/en/api-keys/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-700 underline"
                >
                  Get API Key
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="flex h-9 w-full items-center justify-between rounded-sm border border-rose-200 bg-white px-3 text-sm shadow-sm">
                <span className="truncate text-rose-950">
                  {apiConfigured ? 'VITE_MAKEUP_API_KEY configured' : 'Demo mode — no API key'}
                </span>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                    apiConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
                  )}
                >
                  {apiConfigured ? 'Active' : 'Demo'}
                </span>
              </div>
            </div>
          </PlaygroundSection>

          {/* User Photo */}
          <PlaygroundSection>
            <PlaygroundFieldLabel
              large
              label="User Photo"
              hint="JPEG, ≤10 MB, long side ≤4096 px"
              action={
                <a
                  href="https://docs.perfectcorp.com/reference/makeup_vto/section/overview/file-specs-and-errors"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-6 items-center gap-1 text-sm font-semibold text-cyan-700 underline"
                >
                  More details
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              }
            />

            <PlaygroundTabs tabs={['url', 'upload', 'sample']} value={mode} onChange={setMode} />

            {mode === 'url' ? (
              <div className="space-y-2">
                <Input
                  placeholder="https://example.com/selfie.jpg"
                  value={urlInput}
                  onChange={(event) => setUrlInput(event.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={() => urlInput.trim() && onImageChange(urlInput.trim())}
                >
                  Apply URL
                </Button>
              </div>
            ) : null}

            {mode === 'upload' ? (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-rose-200 bg-rose-50/50 px-4 py-10 text-sm text-mist transition hover:border-cyan/40 hover:bg-rose-50">
                <Upload className="h-5 w-5 text-rose-500" />
                Drop or click to upload
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
              </label>
            ) : null}

            {mode === 'sample' ? (
              <div className="w-full p-1">
                <div className="grid grid-cols-3 gap-3 xl:grid-cols-3">
                  {visibleSamples.map((sample) => {
                    const selected = isSampleSelected(imageSource, sample.fullUrl)
                    return (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => onImageChange(sample.fullUrl)}
                        className={cn(
                          'relative overflow-hidden rounded-lg bg-white p-0.5 transition-all',
                          selected ? 'ring-[3px] ring-cyan-500' : 'hover:ring-2 hover:ring-cyan/30',
                        )}
                      >
                        <div className="aspect-[3/4] overflow-hidden rounded-lg">
                          <img src={sample.thumbUrl} alt={`Sample ${sample.id}`} className="h-full w-full object-cover" />
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAllSamples((value) => !value)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-cyan-700 underline"
                  >
                    {showAllSamples ? 'Show less' : 'See all'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}

            {imageSource && mode !== 'sample' ? (
              <div className="overflow-hidden rounded-lg border border-rose-100">
                <img src={imageSource} alt="Selected" className="aspect-[3/4] w-full object-cover" />
              </div>
            ) : null}
          </PlaygroundSection>

          {/* Parameter */}
          <PlaygroundSection
            title="Parameter"
            description="Note: If you select other categories without Skin, default skin-smooth values will still be applied for the best AR result."
          >
            <div className="grid gap-2">
              <label className="mb-1 block text-sm font-semibold text-rose-950">Category</label>
              <div className="grid grid-cols-2 gap-3">
                {effects.map((effect) => {
                  const meta = MAKEUP_CATEGORY_META[effect.category]
                  const isOn = effect.enabled !== false
                  return (
                    <PlaygroundCheckbox
                      key={effect.category}
                      checked={isOn}
                      label={meta?.label ?? effect.category}
                      onChange={() => toggleCategory(effect.category)}
                    />
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              {effects
                .filter((effect) => effect.enabled !== false)
                .map((effect) => (
                  <CategoryEffectEditor
                    key={effect.category}
                    effect={effect}
                    isOpen={expanded[effect.category] ?? true}
                    onToggle={() =>
                      setExpanded((state) => ({
                        ...state,
                        [effect.category]: !(state[effect.category] ?? true),
                      }))
                    }
                    onChange={(next) =>
                      onEffectsChange(
                        effects.map((item) => (item.category === effect.category ? next : item)),
                      )
                    }
                  />
                ))}
            </div>
          </PlaygroundSection>
        </form>
      </div>

      <div className="shrink-0 border-t border-rose-100 bg-white p-4">
        <Button type="button" className="w-full" onClick={onProcess} disabled={!imageSource || isProcessing}>
          {isProcessing ? 'Processing...' : 'Start Processing'}
        </Button>
        <p className="mt-2 text-center text-[10px] text-mist">1 free trial(s) left — configure API for production</p>
        <button
          type="button"
          className="mt-1 w-full text-center text-xs text-cyan-700 underline"
          onClick={() => onEffectsChange(cloneDefaults())}
        >
          Reset parameters to default
        </button>
      </div>
    </div>
  )
}
