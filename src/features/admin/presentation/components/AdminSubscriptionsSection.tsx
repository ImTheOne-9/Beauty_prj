import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { cn } from '@/shared/lib/cn'
import { useAdminPagination } from '../hooks/useAdminPagination'
import { AdminPagination } from './AdminPagination'
import { AdminSectionTitle } from './AdminSectionTitle'

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = {
  id: string
  name: string
  price: number | string
  billing_interval: string
}

type User = {
  id: string
  email: string
}

type Subscription = {
  id: string
  user_id: string | null
  plan_id: string
  plan?: Plan
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  started_at: string
  expires_at: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── SubForm ──────────────────────────────────────────────────────────────────

type SubFormValues = {
  user_id: string
  plan_id: string
  status: string
  started_at: string
  expires_at: string
}

function SubForm({
  initial,
  plans,
  users,
  onSubmit,
  isPending,
}: {
  initial: Subscription | null
  plans: Plan[]
  users: User[]
  onSubmit: (values: any) => Promise<void>
  isPending: boolean
}) {
  const [form, setForm] = useState<SubFormValues>({
    user_id: initial?.user_id ?? '',
    plan_id: initial?.plan_id ?? '',
    status: initial?.status ?? 'active',
    started_at: initial?.started_at
      ? initial.started_at.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    expires_at: initial?.expires_at ? initial.expires_at.slice(0, 10) : '',
  })

  const inputCls = 'admin-input'

  return (
    <div className="space-y-3">
      {/* User — chỉ hiện khi tạo mới */}
      {!initial && (
        <div>
          <label className="admin-label">User</label>
          <select
            className={inputCls}
            value={form.user_id}
            onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
          >
            <option value="">Select user...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Plan */}
      <div>
        <label className="admin-label">Plan</label>
        <select
          className={inputCls}
          value={form.plan_id}
          onChange={(e) => setForm((f) => ({ ...f, plan_id: e.target.value }))}
        >
          <option value="">Select plan...</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — ${Number(p.price).toFixed(2)}/{p.billing_interval}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="admin-label">Status</label>
        <select
          className={inputCls}
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Started At */}
      <div>
        <label className="admin-label">Started At</label>
        <input
          type="date"
          className={inputCls}
          value={form.started_at}
          onChange={(e) => setForm((f) => ({ ...f, started_at: e.target.value }))}
        />
      </div>

      {/* Expires At */}
      <div>
        <label className="admin-label">
          Expires At{' '}
          <span className="text-admin-muted font-normal normal-case">
            (để trống = không hết hạn)
          </span>
        </label>
        <input
          type="date"
          className={inputCls}
          value={form.expires_at}
          onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          disabled={isPending || !form.user_id || !form.plan_id}
          onClick={() =>
            onSubmit({
              ...form,
              started_at: new Date(form.started_at).toISOString(),
              expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
            })
          }
        >
          {isPending ? 'Saving...' : initial ? 'Save Changes' : 'Create'}
        </Button>
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

type AdminSubscriptionsSectionProps = {
  adminUseCases: {
    getSubscriptions: () => Promise<Subscription[]>
    createSubscription: (input: any) => Promise<any>
    updateSubscription: (id: string, patch: any) => Promise<any>
    cancelSubscription: (id: string) => Promise<any>
    getPlans: () => Promise<Plan[]>
    getProfilesWithPlans: () => Promise<User[]>
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-admin-subtle text-admin-accent border-admin-border',
  expired:   'bg-gray-50 text-gray-500 border-gray-200',
  pending:   'bg-amber-50 text-amber-700 border-amber-100',
}

export function AdminSubscriptionsSection({ adminUseCases }: AdminSubscriptionsSectionProps) {
  const queryClient = useQueryClient()

  // ── State ──────────────────────────────────────────────────────────────────
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen]       = useState(false)
  const [selectedSub, setSelectedSub]   = useState<Subscription | null>(null)

  // ── Queries ────────────────────────────────────────────────────────────────
  const subscriptionsQuery = useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: () => adminUseCases.getSubscriptions(),
  })

  const plansQuery = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => adminUseCases.getPlans(),
  })

  const usersQuery = useQuery({
    queryKey: ['admin', 'profiles'],
    queryFn: () => adminUseCases.getProfilesWithPlans(),
  })

  // ── Lookup ─────────────────────────────────────────────────────────────────
  const userLookup = useMemo(() => {
    const map = new Map<string, { email: string }>()
    for (const u of usersQuery.data ?? []) map.set(u.id, u)
    return map
  }, [usersQuery.data])

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })

  const createSubMutation = useMutation({
    mutationFn: (input: any) => adminUseCases.createSubscription(input),
    onSuccess: invalidate,
  })

  const updateSubMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) =>
      adminUseCases.updateSubscription(id, patch),
    onSuccess: invalidate,
  })

  const cancelSubMutation = useMutation({
    mutationFn: (id: string) => adminUseCases.cancelSubscription(id),
    onSuccess: invalidate,
  })

  // ── Filtered / Paginated data ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    return (subscriptionsQuery.data ?? []).filter((s) => {
      const email = s.user_id ? (userLookup.get(s.user_id)?.email ?? '') : ''
      const matchSearch =
        search === '' ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        (s.user_id ?? '').toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [subscriptionsQuery.data, search, statusFilter, userLookup])

  const { page, totalPages, paginatedItems, setPage } = useAdminPagination(filtered, 10)

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openModal = (sub: Subscription | null = null) => {
    setSelectedSub(sub)
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const handleSubmit = async (values: any) => {
    if (selectedSub) {
      await updateSubMutation.mutateAsync({ id: selectedSub.id, patch: values })
    } else {
      await createSubMutation.mutateAsync(values)
    }
    closeModal()
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white border border-admin-border rounded-3xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-admin-muted" />
          <input
            type="text"
            className="w-full rounded-full border border-admin-border pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent/20"
            placeholder="Search by email, UUID or subscription ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="rounded-full border border-admin-border px-3 py-2 text-sm focus:outline-none"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
          <option value="pending">Pending</option>
        </select>
        <Button onClick={() => openModal()}>+ Add Subscription</Button>
      </div>

      {/* Table */}
      <Card className="border border-admin-border p-6 bg-white shadow-sm">
        <AdminSectionTitle
          eyebrow="Subscriptions"
          title="User Subscriptions"
          description={`${filtered.length} subscription(s) found.`}
        />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-admin-border text-admin-ink font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Plan</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 whitespace-nowrap">Started</th>
                <th className="pb-3 px-3 whitespace-nowrap">Expires</th>
                <th className="pb-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {paginatedItems.map((sub) => {
                const email = sub.user_id
                  ? (userLookup.get(sub.user_id)?.email ?? sub.user_id.slice(0, 8) + '...')
                  : 'Guest'
                return (
                  <tr key={sub.id} className="hover:bg-admin-subtle text-admin-ink align-middle">
                    <td className="py-3 px-3 max-w-[180px] truncate" title={email}>
                      {email}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium">{sub.plan?.name ?? '—'}</p>
                      <p className="text-[10px] text-admin-muted font-mono">
                        ${Number(sub.plan?.price ?? 0).toFixed(2)}/{sub.plan?.billing_interval}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={cn(
                          'rounded-lg px-2 py-0.5 text-[10px] font-bold border',
                          STATUS_COLORS[sub.status] ?? '',
                        )}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-admin-muted whitespace-nowrap">
                      {formatDate(sub.started_at)}
                    </td>
                    <td className="py-3 px-3 text-admin-muted whitespace-nowrap">
                      {sub.expires_at ? formatDate(sub.expires_at) : '—'}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openModal(sub)}>
                          Edit
                        </Button>
                        {sub.status === 'active' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={cancelSubMutation.isPending}
                            onClick={() => {
                              if (confirm('Cancel this subscription?')) cancelSubMutation.mutate(sub.id)
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {paginatedItems.length === 0 && (
            <div className="text-center py-12 text-admin-muted text-sm">
              No subscriptions found.
            </div>
          )}
        </div>

        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="relative w-full max-w-md rounded-[2rem] border border-admin-border bg-white p-6 shadow-xl space-y-4">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full p-1.5 text-admin-muted hover:bg-admin-subtle transition"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="font-admin text-xl text-admin-ink">
              {selectedSub ? 'Edit Subscription' : 'New Subscription'}
            </h2>
            <SubForm
              initial={selectedSub}
              plans={plansQuery.data ?? []}
              users={usersQuery.data ?? []}
              onSubmit={handleSubmit}
              isPending={createSubMutation.isPending || updateSubMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  )
}
