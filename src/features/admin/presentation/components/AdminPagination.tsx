import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'

type AdminPaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function AdminPagination({ page, totalPages, onPageChange }: AdminPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-center gap-4 border-t border-admin-border pt-4">
      <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
        <ChevronLeft className="mr-1 h-4 w-4" /> Prev
      </Button>
      <span className="text-xs font-semibold text-admin-ink">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="ghost"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      >
        Next <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  )
}
