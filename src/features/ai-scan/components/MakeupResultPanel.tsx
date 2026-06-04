import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { MakeupVtoTaskStatus } from '@/features/ai-scan/types/makeup-vto'

type MakeupResultPanelProps = {
  imageSource: string
  resultUrl: string | null
  downloadUrl: string | null
  status: MakeupVtoTaskStatus
  isDemo: boolean
  errorMessage: string | null
}

export function MakeupResultPanel({
  resultUrl,
  downloadUrl,
  status,
  errorMessage,
}: MakeupResultPanelProps) {
  const isProcessing = status === 'running' || status === 'queued' || status === 'processing'

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-app-border bg-app-surface shadow-sm">
      <div className="shrink-0 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <label className="flex flex-col gap-1 text-xl font-semibold text-app-ink">
            <span className="inline-flex items-center gap-1">Result</span>
            <span className="text-xs font-normal text-app-muted">Preview the processed makeup result on the selected image.</span>
          </label>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        {downloadUrl && status === 'success' ? (
          <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-app-accent/20 bg-app-accent/5 px-3 py-2">
            <p className="truncate font-mono text-[10px] text-app-accent">{downloadUrl.split('/').pop()}</p>
            <a href={downloadUrl} target="_blank" rel="noreferrer" download>
              <Button size="sm" variant="ghost" className="gap-1">
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </a>
          </div>
        ) : null}

        <div className="flex min-h-[280px] items-center justify-center">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3 text-sm text-app-muted">
              <Loader2 className="h-8 w-8 animate-spin text-app-accent" />
              <p>Analyzing face and applying makeup...</p>
            </div>
          ) : errorMessage ? (
            <div className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
          ) : resultUrl ? (
            <img src={resultUrl} alt="Processed makeup result" className="w-full rounded-lg object-contain" />
          ) : (
            <p className="text-sm text-app-muted">Select an image and start processing.</p>
          )}
        </div>
      </div>
    </div>
  )
}
