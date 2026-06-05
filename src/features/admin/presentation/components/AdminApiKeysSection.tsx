import { useState } from 'react'
import { PencilLine, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { cn } from '@/shared/lib/cn'
import { useAdminPagination } from '../hooks/useAdminPagination'
import { AdminPagination } from './AdminPagination'
import { AdminSectionTitle } from './AdminSectionTitle'

type ApiKey = {
  id: string
  name: string | null
  key_value?: string | null
  provider: string | null
  is_active: boolean
  created_at: string
}

type AdminApiKeysSectionProps = {
  keys: ApiKey[]
  isToggling: boolean
  isDeleting: boolean
  onSave: (form: { id: string; name: string; key_value: string; provider: string; is_active: boolean }) => Promise<void>
  onToggleActive: (id: string, is_active: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const EMPTY_FORM = { id: '', name: '', key_value: '', provider: 'virtual_makeup_ai', is_active: true }

function formatDate(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminApiKeysSection({
  keys,
  isToggling,
  isDeleting,
  onSave,
  onToggleActive,
  onDelete,
}: AdminApiKeysSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const { page, totalPages, paginatedItems, setPage } = useAdminPagination(keys, 10)

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }
  const [isSavingLocal, setIsSavingLocal] = useState(false)
  const openEdit = (key: ApiKey) => {
    setForm({
      id: key.id,
      name: key.name ?? '',
      key_value: key.key_value ?? '',
      provider: key.provider ?? '',
      is_active: key.is_active,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setIsSavingLocal(true)
    try {
        await onSave(form)
        setForm(EMPTY_FORM)
        setModalOpen(false)
    } finally {
        setIsSavingLocal(false)
    }
    }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-admin-border rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-admin-ink">
          {keys.length} key(s) configured
        </p>
        <Button onClick={openCreate}>+ Add Key</Button>
      </div>

      {/* Table */}
      <Card className="border border-admin-border p-6 bg-white shadow-sm">
        <AdminSectionTitle
          eyebrow="API Keys"
          title="Virtual Makeup AI Keys"
          description="Manage, rotate and enable/disable API keys used by the makeup engine."
        />
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-admin-border text-admin-ink font-bold uppercase tracking-wider">
                <th className="pb-3 pr-3">Name</th>
                <th className="pb-3 px-3">Provider</th>
                <th className="pb-3 px-3">Key Value</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 whitespace-nowrap">Created</th>
                <th className="pb-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {paginatedItems.map((key) => (
                <tr key={key.id} className="hover:bg-admin-subtle text-admin-ink align-middle">
                  <td className="py-3 pr-3 font-semibold">{key.name ?? 'Untitled key'}</td>
                  <td className="py-3 px-3 text-admin-muted">{key.provider ?? '-'}</td>
                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-admin-muted font-mono tracking-widest">••••••••••••••••</span>
                      <span className="text-[10px] text-admin-muted italic">hidden for security</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => onToggleActive(key.id, !key.is_active)}
                      disabled={isToggling}
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition',
                        key.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                          : 'bg-admin-subtle text-admin-accent border-admin-border hover:bg-admin-subtle',
                      )}
                    >
                      {isToggling ? '...' : key.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-admin-muted whitespace-nowrap">
                    {formatDate(key.created_at)}
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(key)}>
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        disabled={isDeleting}
                        onClick={() => {
                          if (confirm(`Delete key "${key.name ?? 'Untitled key'}"?`)) onDelete(key.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {keys.length === 0 && (
            <div className="text-center py-12 text-admin-muted text-sm">
              No API keys yet. Click "+ Add Key" to add one.
            </div>
          )}
        </div>
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="relative w-full max-w-md rounded-[2rem] border border-admin-border bg-white p-6 shadow-xl space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-admin-muted hover:bg-admin-subtle transition"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="font-admin text-xl text-admin-ink">
              {form.id ? 'Edit API Key' : 'Add API Key'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">Name</label>
                <Input placeholder="e.g. Production Key" value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">Provider</label>
                <Input placeholder="e.g. virtual_makeup_ai" value={form.provider}
                  onChange={(e) => setForm(f => ({ ...f, provider: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">Key Value</label>
                <Input type="password" placeholder="Paste your API key here" value={form.key_value}
                  onChange={(e) => setForm(f => ({ ...f, key_value: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="key_active" checked={form.is_active}
                  onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <label htmlFor="key_active" className="text-sm text-admin-ink">Active</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSavingLocal}>
                  {isSavingLocal ? 'Saving...' : 'Save Key'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
