import { PencilLine, Search, Trash2, UserCheck, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { cn } from '@/shared/lib/cn'
import type { AdminRole } from '@/core/entities'
import { useAdminPagination } from '../hooks/useAdminPagination'
import { AdminPagination } from './AdminPagination'
import { AdminSectionTitle } from './AdminSectionTitle'

type Plan = {
  id: string
  name: string
  slug: string
  price: number | string
  billing_interval: string
}

type UserRecord = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  role?: string
  avatar_url?: string | null
  plan?: Plan | null
  plan_id?: string | null
  updated_at: string
}

type AdminAccessSectionProps = {
  users: UserRecord[]
  filteredCount: number
  plans: Plan[]
  currentUserEmail?: string

  // filters
  search: string
  roleFilter: string
  planFilter: string
  onSearchChange: (value: string) => void
  onRoleFilterChange: (value: string) => void
  onPlanFilterChange: (value: string) => void

  // actions
  onCreateUser: (payload: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: AdminRole | 'user'
    planId: string
  }) => Promise<void>
  isCreating: boolean
  onUpdateUser: (payload: {
    userId: string
    firstName: string
    lastName: string
    role: string
    planId: string
  }) => Promise<void>
  isUpdating: boolean
  isDeleting: boolean                        // ← add this
  onDelete: (user: UserRecord) => void  
}

export function AdminAccessSection({
  users,
  filteredCount,
  plans,
  currentUserEmail,
  search,
  roleFilter,
  planFilter,
  onSearchChange,
  onRoleFilterChange,
  onPlanFilterChange,
  isDeleting,
  onDelete,
  onCreateUser,
  isCreating,
  onUpdateUser,
  isUpdating,
}: AdminAccessSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const { page, totalPages, paginatedItems, setPage } = useAdminPagination(users, 10)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<AdminRole | 'user'>('user')
  const [planId, setPlanId] = useState('')

  const openModal = (user?: UserRecord) => {
    if (user) {
      setSelectedUser(user)
      setEmail(user.email)
      setFirstName(user.first_name ?? '')
      setLastName(user.last_name ?? '')
      setRole((user.role as AdminRole | 'user') ?? 'user')
      setPlanId(user.plan_id ?? '')
      setPassword('')
    } else {
      setSelectedUser(null)
      setEmail('')
      setPassword('')
      setFirstName('')
      setLastName('')
      setRole('user')
      setPlanId('')
    }
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  // AFTER
  const handleSave = async () => {
    if (selectedUser) {
      await onUpdateUser({ userId: selectedUser.id, firstName, lastName, role, planId })
    } else {
      await onCreateUser({ email, password, firstName, lastName, role, planId })
    }
    closeModal()
  }

  return (
    <div className="space-y-4">
      {/* Search + Filters + Add */}
      <div className="bg-white border border-admin-border rounded-3xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-admin-muted" />
          <input
            type="text"
            className="w-full rounded-full border border-admin-border pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent/20"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <select
          className="rounded-full border border-admin-border px-3 py-2 text-sm text-admin-ink focus:outline-none"
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <select
          className="rounded-full border border-admin-border px-3 py-2 text-sm text-admin-ink focus:outline-none"
          value={planFilter}
          onChange={(e) => onPlanFilterChange(e.target.value)}
        >
          <option value="all">All Plans</option>
          <option value="">No Plan</option>
          {plans.map((p) => (
            <option key={p.id} value={p.slug}>{p.name}</option>
          ))}
        </select>

        <Button onClick={() => openModal()}>+ Add User</Button>
      </div>

      {/* Users table */}
      <Card className="border border-admin-border p-6 bg-white shadow-sm">
        <AdminSectionTitle
          eyebrow="User Access Control"
          title="Manage Users"
          description={`${filteredCount} user(s) — role, plan, and profile details.`}
        />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-admin-border text-admin-ink font-bold uppercase tracking-wider">
                <th className="pb-3 pr-3">User</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Plan</th>
                <th className="pb-3 px-3">Updated At</th>
                <th className="pb-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {paginatedItems.map((item) => {
                const fullName = [item.first_name, item.last_name].filter(Boolean).join(' ')
                return (
                  <tr key={item.id} className="hover:bg-admin-subtle text-admin-ink align-middle">
                    {/* Avatar + name + email */}
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        {item.avatar_url ? (
                          <img
                            src={item.avatar_url}
                            alt={fullName || item.email}
                            className="h-9 w-9 rounded-full border border-admin-border object-cover shrink-0"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-admin-subtle flex items-center justify-center shrink-0 text-admin-accent font-bold text-sm">
                            {(item.email?.[0] ?? '?').toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-admin-ink truncate max-w-[180px]">
                            {fullName || <span className="text-admin-muted italic font-normal">No name</span>}
                            {item.email?.toLowerCase() === currentUserEmail?.toLowerCase() && (
                              <span className="ml-1 text-[9px] bg-admin-accent/10 text-admin-accent px-1.5 py-0.5 rounded font-extrabold">You</span>
                            )}
                          </p>
                          <p className="text-admin-muted truncate max-w-[180px]" title={item.email}>{item.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="py-3 px-3">
                      <span className={cn(
                        'rounded-lg px-2.5 py-1 text-[10px] font-bold border uppercase tracking-wide',
                        item.role === 'admin'
                          ? 'bg-admin-subtle text-admin-accent border-admin-border'
                          : 'bg-gray-50 text-gray-500 border-gray-200',
                      )}>
                        {item.role ?? 'user'}
                      </span>
                    </td>

                    {/* Plan badge */}
                    <td className="py-3 px-3">
                      {item.plan ? (
                        <div>
                          <span className={cn(
                            'rounded-lg px-2.5 py-1 text-[10px] font-bold border uppercase tracking-wide',
                            item.plan.slug === 'pro'
                              ? 'bg-admin-accent/10 text-admin-accent border-admin-accent/20'
                              : item.plan.slug === 'premium'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-gray-50 text-gray-500 border-gray-200',
                          )}>
                            {item.plan.name}
                          </span>
                          <p className="mt-1 text-[10px] text-admin-muted">
                            ${Number(item.plan.price).toFixed(2)}/{item.plan.billing_interval}
                          </p>
                        </div>
                      ) : (
                        <span className="rounded-lg px-2.5 py-1 text-[10px] font-bold border uppercase bg-gray-50 text-gray-400 border-gray-200">
                          No Plan
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-admin-muted whitespace-nowrap">
                      {new Date(item.updated_at).toLocaleDateString('vi-VN')}
                    </td>

                    <td className="py-3 pl-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openModal(item)}>
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(item)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12 text-admin-muted text-sm">No users found.</div>
          )}
        </div>
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* Role Matrix */}
      <Card className="border border-admin-border p-6 bg-white shadow-sm">
        <AdminSectionTitle
          eyebrow="Access Matrix"
          title="Role Module Scopes"
          description="List of visible modules based on role mapping rules."
        />
        <div className="mt-5 space-y-3 text-xs text-admin-ink">
          {[
            { role: 'Admin', scope: 'Full access to manage users, catalog, scans, recommendations and settings.' },
            { role: 'User',  scope: 'Standard access without admin panels. Can run scans and use subscription benefits.' },
          ].map((item) => (
            <div key={item.role} className="rounded-2xl border border-admin-border bg-admin-subtle px-3 py-2.5">
              <p className="font-semibold flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-admin-accent" />
                {item.role}
              </p>
              <p className="mt-1 text-[11px] text-admin-muted">{item.scope}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* User Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="relative w-full max-w-md overflow-y-auto max-h-[90vh] rounded-[2rem] border border-admin-border bg-white p-6 shadow-xl space-y-4">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full p-1.5 text-admin-muted hover:bg-admin-subtle transition"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="font-admin text-xl text-admin-ink">
              {selectedUser ? 'Edit User' : 'Create New User'}
            </h2>

            <div className="space-y-4">
              {/* Edit mode: avatar preview + name fields */}
              {selectedUser && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-admin-subtle border border-admin-border px-4 py-3">
                    {selectedUser.avatar_url ? (
                      <img
                        src={selectedUser.avatar_url}
                        alt=""
                        className="h-10 w-10 rounded-full border border-admin-border object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-admin-subtle flex items-center justify-center shrink-0 text-admin-accent font-bold">
                        {(selectedUser.email?.[0] ?? '?').toUpperCase()}
                      </div>
                    )}
                    <p className="text-xs text-admin-muted truncate">{selectedUser.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="admin-label">First Name</label>
                      <Input placeholder="e.g. Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div>
                      <label className="admin-label">Last Name</label>
                      <Input placeholder="e.g. Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Create mode: name + email + password */}
              {!selectedUser && (
                <>
                  <div>
                    <label className="admin-label">First Name</label>
                    <Input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">Last Name</label>
                    <Input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">Email</label>
                    <Input placeholder="e.g. client@lumina.ai" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">Password</label>
                    <Input type="password" placeholder="Minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </>
              )}

              {/* Role */}
              <div>
                <label className="admin-label">Access Level</label>
                <select
                  className="w-full rounded-2xl border border-admin-border bg-white/85 px-4 py-3 text-sm text-admin-ink focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/25"
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole | 'user')}
                >
                  <option value="admin">Admin</option>
                  <option value="user">Standard User</option>
                </select>
              </div>

              {/* Plan */}
              <div>
                <label className="admin-label">Subscription Plan</label>
                <select
                  className="w-full rounded-2xl border border-admin-border bg-white/85 px-4 py-3 text-sm text-admin-ink focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/25"
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                >
                  <option value="">No Plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${Number(p.price).toFixed(2)}/{p.billing_interval}
                    </option>
                  ))}
                </select>
              </div>


              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                <Button onClick={handleSave} disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Saving...' : selectedUser ? 'Save Changes' : 'Create User'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
