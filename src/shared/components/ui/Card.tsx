import { type HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
