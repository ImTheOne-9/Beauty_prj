import { Card } from '@/shared/components/ui/Card'
import { cn } from '@/shared/lib/cn'

type AIResultCardProps = {
  metric: string
  score: number
  status: 'great' | 'moderate' | 'attention'
  insight: string
}

const statusColorMap = {
  great: 'text-rose-600',
  moderate: 'text-amber',
  attention: 'text-rose-500',
}

export function AIResultCard({ metric, score, status, insight }: AIResultCardProps) {
  return (
    <Card className="space-y-4 border border-rose-100/50 bg-[linear-gradient(180deg,rgba(255,250,250,0.95),rgba(255,245,246,0.86))] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-mist">{metric}</p>
        <span
          className={cn(
            'rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]',
            status === 'great' && 'border-rose-100 bg-rose-50 text-rose-600',
            status === 'moderate' && 'border-amber-100 bg-amber-50 text-amber-500',
            status === 'attention' && 'border-rose-100 bg-rose-50 text-rose-500',
          )}
        >
          {status}
        </span>
      </div>

      <div className="space-y-2">
        <p className={cn('font-display text-3xl font-semibold leading-none', statusColorMap[status])}>{score}</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-rose-50/80">
          <div
            className={cn(
              'h-full rounded-full',
              status === 'great' && 'bg-gradient-to-r from-rose-400 to-rose-600',
              status === 'moderate' && 'bg-gradient-to-r from-amber-300 to-amber-500',
              status === 'attention' && 'bg-gradient-to-r from-rose-400 to-fuchsia-500',
            )}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
      </div>

      <p className="text-sm leading-relaxed text-mist">{insight}</p>
    </Card>
  )
}
