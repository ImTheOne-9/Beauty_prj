import type { ReactNode } from 'react'
import { Card } from '@/shared/components/ui/Card'

type AdminTableCardProps = {
  children: ReactNode
  className?: string
}

export function AdminTableCard({ children, className = '' }: AdminTableCardProps) {
  return (
    <Card className={`border border-admin-border bg-white p-6 shadow-sm ${className}`}>
      {children}
    </Card>
  )
}
