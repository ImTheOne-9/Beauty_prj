import { useEffect, useMemo, useState } from 'react'

export function useAdminPagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages))
  }, [totalPages])

  const paginatedItems = useMemo(() => {
    return items.slice((page - 1) * pageSize, page * pageSize)
  }, [items, page, pageSize])

  return {
    page,
    pageSize,
    totalPages,
    paginatedItems,
    setPage,
  }
}
