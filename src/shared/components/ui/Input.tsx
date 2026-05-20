import { type InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-2xl border border-rose-200/80 bg-white/80 px-4 py-3 text-sm text-pearl placeholder:text-mist/70 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/25',
        className,
      )}
      {...props}
    />
  )
}
