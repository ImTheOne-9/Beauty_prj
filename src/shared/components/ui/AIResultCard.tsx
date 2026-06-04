import { Card } from '@/shared/components/ui/Card'
import { cn } from '@/shared/lib/cn'

type AIResultCardProps = {
  metric: string
  score: number
  status: 'great' | 'moderate' | 'attention'
  insight: string
}

const statusColorMap = {
  great: 'text-[var(--ui-accent)]',
  moderate: 'text-amber',
  attention: 'text-[var(--ui-accent-hover)]',
}

export function AIResultCard({ metric, score, status, insight }: AIResultCardProps) {
  return (
    <Card className="space-y-4 border border-[var(--ui-border)] bg-[var(--ui-surface)] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--ui-muted)]">{metric}</p>
        <span
          className={cn(
            'rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]',
            status === 'great' && 'border-[var(--ui-border)] bg-[var(--ui-accent)]/10 text-[var(--ui-accent)]',
            status === 'moderate' && 'border-amber-100 bg-amber-50 text-amber-500',
            status === 'attention' && 'border-[var(--ui-border)] bg-[var(--ui-accent)]/10 text-[var(--ui-accent-hover)]',
          )}
        >
          {status}
        </span>
      </div>

      <div className="space-y-2">
        <p className={cn('font-ui text-3xl font-semibold leading-none', statusColorMap[status])}>{score}</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--ui-subtle)]">
          <div
            className={cn(
              'h-full rounded-full',
              status === 'great' && 'bg-[var(--ui-accent)]',
              status === 'moderate' && 'bg-gradient-to-r from-amber-300 to-amber-500',
              status === 'attention' && 'bg-[var(--ui-accent-hover)]',
            )}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
      </div>

      <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{insight}</p>
    </Card>
  )
}
