import type { PropsWithChildren, ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type PlaygroundSectionProps = PropsWithChildren<{
  title?: string
  description?: string
  className?: string
}>

export function PlaygroundSection({ title, description, className, children }: PlaygroundSectionProps) {
  return (
    <section className={cn('flex w-full flex-col gap-4', className)}>
      {title ? (
        <header className="space-y-1 text-rose-950">
          <h4 className="text-sm font-semibold">{title}</h4>
          {description ? <p className="text-xs text-mist">{description}</p> : null}
        </header>
      ) : null}
      <div className="flex w-full flex-col gap-4">{children}</div>
    </section>
  )
}

type PlaygroundFieldLabelProps = {
  label: string
  hint?: string
  action?: ReactNode
  large?: boolean
}

export function PlaygroundFieldLabel({ label, hint, action, large }: PlaygroundFieldLabelProps) {
  return (
    <div className="flex items-start justify-between gap-2">
      <label className={cn('flex flex-col gap-1 text-rose-950', large ? 'text-xl font-semibold' : 'text-sm font-semibold')}>
        <span className="inline-flex items-center gap-1">
          {label}
          <HelpCircle className="h-3.5 w-3.5 text-mist" aria-hidden />
        </span>
        {hint ? <span className="text-xs font-normal text-mist">{hint}</span> : null}
      </label>
      {action}
    </div>
  )
}

type PlaygroundTabsProps<T extends string> = {
  tabs: T[]
  value: T
  onChange: (value: T) => void
}

export function PlaygroundTabs<T extends string>({ tabs, value, onChange }: PlaygroundTabsProps<T>) {
  return (
    <div className="relative mb-3 flex min-w-full border-b-4 border-rose-100" role="tablist">
      {tabs.map((tab) => {
        const active = value === tab
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            className={cn(
              'relative cursor-pointer px-4 py-2 text-sm font-semibold capitalize transition-colors',
              active ? 'text-cyan-700' : 'text-rose-900 hover:bg-rose-50/80 hover:text-cyan-600',
            )}
          >
            {tab}
            <span
              className={cn(
                'absolute bottom-[-4px] left-0 h-1 w-full origin-center bg-cyan-600 transition-transform',
                active ? 'scale-x-100' : 'scale-x-0',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export function PlaygroundCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded border shadow-sm transition',
          checked ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-rose-200 bg-white',
        )}
      >
        {checked ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : null}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span className="text-sm text-rose-950">{label}</span>
    </label>
  )
}
