import type { ReactNode } from 'react'

type AdminToolbarProps = {
  children: ReactNode
}

export function AdminToolbar({ children }: AdminToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-admin-border bg-white p-4">
      {children}
    </div>
  )
}
