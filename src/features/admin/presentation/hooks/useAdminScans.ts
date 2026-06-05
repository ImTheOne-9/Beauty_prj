import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AdminScanRecord } from '@/application/dtos/admin'
import type { AdminUseCases } from '@/application/use-cases/admin-use-cases'

export function useAdminScans(
  adminUseCases: AdminUseCases,
  userLookup: Map<string, { email: string; role: string }>,
) {
  const queryClient = useQueryClient()
  const [adminScanSearch, setAdminScanSearch] = useState('')
  const [adminScanModeFilter, setAdminScanModeFilter] = useState<'all' | 'api' | 'demo'>('all')
  const [adminScanPage, setAdminScanPage] = useState(1)
  const adminScanPageSize = 10

  const scansQuery = useQuery({
    queryKey: ['admin', 'scans'],
    queryFn: () => adminUseCases.getAdminScans(),
  })

  const filteredAdminScans = useMemo(() => {
    const normalizedSearch = adminScanSearch.toLowerCase()

    return (scansQuery.data ?? []).filter((scan: AdminScanRecord) => {
      const userEmail = scan.user_id ? (userLookup.get(scan.user_id)?.email ?? '') : 'Guest'
      const matchSearch =
        scan.id.toLowerCase().includes(normalizedSearch) ||
        (scan.user_id ?? '').toLowerCase().includes(normalizedSearch) ||
        userEmail.toLowerCase().includes(normalizedSearch)
      const matchMode = adminScanModeFilter === 'all' || scan.mode === adminScanModeFilter
      return matchSearch && matchMode
    })
  }, [scansQuery.data, adminScanSearch, adminScanModeFilter, userLookup])

  const totalAdminScanPages = Math.max(1, Math.ceil(filteredAdminScans.length / adminScanPageSize))
  const paginatedAdminScans = filteredAdminScans.slice(
    (adminScanPage - 1) * adminScanPageSize,
    adminScanPage * adminScanPageSize,
  )

  const deleteScanMutation = useMutation({
    mutationFn: async (id: string) => adminUseCases.deleteScan(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'scans'] })
      await queryClient.invalidateQueries({ queryKey: ['scan-history'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'recommendations'] })
    },
  })

  const updateScanSearch = (value: string) => {
    setAdminScanSearch(value)
    setAdminScanPage(1)
  }

  const updateScanModeFilter = (value: 'all' | 'api' | 'demo') => {
    setAdminScanModeFilter(value)
    setAdminScanPage(1)
  }

  const updateScanPage = (page: number) => {
    setAdminScanPage(page)
  }

  const deleteScan = (id: string) => {
    deleteScanMutation.mutate(id)
  }

  return {
    scansQuery,
    adminScanSearch,
    adminScanModeFilter,
    adminScanPage,
    paginatedAdminScans,
    filteredAdminScans,
    totalAdminScanPages,
    deleteScanMutation,
    updateScanSearch,
    updateScanModeFilter,
    updateScanPage,
    deleteScan,
  }
}
