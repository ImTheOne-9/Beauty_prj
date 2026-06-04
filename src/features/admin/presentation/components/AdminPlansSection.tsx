// AdminPlansSection.tsx
import { useState } from 'react'
import { PencilLine, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { cn } from '@/shared/lib/cn'
import { AdminSectionTitle } from './AdminSectionTitle'

// SAU — dùng type annotation thay vì as const trên toàn object
type PlanForm = {
  name: string
  slug: string
  price: number
  billing_interval: 'month' | 'year'
  scan_limit: number
  history_days: number
  description: string
  features: string[]
  badge: string | null
  is_active: boolean
}

const EMPTY_PLAN: PlanForm = {
  name: '',
  slug: '',
  price: 0,
  billing_interval: 'month',
  scan_limit: 10,
  history_days: 30,
  description: '',
  features: [],
  badge: null,
  is_active: true,
}

type Plan = {
  id: string
  name: string
  slug: string
  price: number
  billing_interval: string
  scan_limit: number
  history_days: number
  description?: string | null
  features: string[]
  badge?: string | null
  is_active: boolean
}

type AdminPlansSectionProps = {
  plans: Plan[]
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  onCreatePlan: (plan: typeof EMPTY_PLAN) => Promise<unknown>
  onUpdatePlan: (id: string, patch: Partial<Plan>) => Promise<unknown>
  onDeletePlan: (id: string) => Promise<unknown>
}


export function AdminPlansSection({
  plans,
  isCreating,
  isUpdating,
  isDeleting,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
}: AdminPlansSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [form, setForm] = useState(EMPTY_PLAN)

  const openCreate = () => {
    setSelectedPlan(null)
    setForm(EMPTY_PLAN)
    setModalOpen(true)
  }

  const openEdit = (plan: Plan) => {
    setSelectedPlan(plan)
    setForm({
        name: plan.name,
        slug: plan.slug,
        price: plan.price,
        billing_interval: plan.billing_interval as 'month' | 'year',
        scan_limit: plan.scan_limit,
        history_days: plan.history_days,
        description: plan.description ?? '',
        features: plan.features ?? [],
        badge: plan.badge ?? null,
        is_active: plan.is_active,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (selectedPlan) {
      await onUpdatePlan(selectedPlan.id, form)
    } else {
      await onCreatePlan(form)
    }
    setModalOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <AdminSectionTitle
          eyebrow="Subscription Plans"
          title="Manage Plans"
          description={`${plans.length} plan(s) configured.`}
        />
        <Button onClick={openCreate}>+ Add Plan</Button>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-admin-border bg-white/80 p-12 text-center text-sm text-admin-muted">
          No plans yet. Click "Add Plan" to create one.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className={cn(
              'rounded-2xl border bg-white p-5 space-y-3 transition',
              plan.is_active ? 'border-admin-border' : 'border-admin-border opacity-60',
            )}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-admin-ink">{plan.name}</p>
                  <p className="text-[11px] text-admin-muted font-mono mt-0.5">slug: {plan.slug}</p>
                </div>
                {plan.badge && (
                  <span className="rounded-full bg-admin-accent/10 px-2 py-0.5 text-[10px] font-bold text-admin-accent shrink-0">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-admin-ink">${Number(plan.price).toFixed(2)}</span>
                <span className="text-xs text-admin-muted">/ {plan.billing_interval}</span>
              </div>

              {plan.description && (
                <p className="text-xs text-admin-muted leading-relaxed">{plan.description}</p>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-admin-subtle px-3 py-2">
                  <p className="text-admin-muted">Scans</p>
                  <p className="font-semibold text-admin-ink">{plan.scan_limit}</p>
                </div>
                <div className="rounded-xl bg-admin-subtle px-3 py-2">
                  <p className="text-admin-muted">History</p>
                  <p className="font-semibold text-admin-ink">{plan.history_days} days</p>
                </div>
              </div>

              {plan.features.length > 0 && (
                <ul className="space-y-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-admin-muted">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-admin-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-admin-border">
                <button
                  onClick={() => onUpdatePlan(plan.id, { is_active: !plan.is_active })}
                  disabled={isUpdating}
                  className={cn(
                    'rounded-full px-3 py-1 text-[10px] font-bold border transition',
                    plan.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                      : 'bg-admin-subtle text-admin-accent border-admin-border hover:bg-admin-subtle',
                  )}
                >
                  {plan.is_active ? 'Active' : 'Inactive'}
                </button>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(plan)}>
                    <PencilLine className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    disabled={isDeleting}
                    onClick={() => {
                      if (confirm(`Delete plan "${plan.name}"?`)) onDeletePlan(plan.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-[2rem] border border-admin-border bg-white p-6 shadow-xl space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-admin-muted hover:bg-admin-subtle transition"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="font-admin text-xl text-admin-ink">
              {selectedPlan ? 'Edit Plan' : 'New Plan'}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-admin-muted mb-1 block">Name</label>
                <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-admin-muted mb-1 block">Slug</label>
                <Input placeholder="free / pro / premium" value={form.slug}
                  onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-admin-muted mb-1 block">Badge</label>
                <Input placeholder="MOST POPULAR" value={form.badge ?? ''}
                  onChange={(e) => setForm(f => ({ ...f, badge: e.target.value || null }))} />
              </div>
              <div>
                <label className="text-xs text-admin-muted mb-1 block">Price ($)</label>
                <Input type="number" min={0} step={0.01} value={form.price}
                  onChange={(e) => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="text-xs text-admin-muted mb-1 block">Billing</label>
                <select
                  className="w-full rounded-2xl border border-admin-border bg-white/85 px-4 py-3 text-sm text-admin-ink focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/25"
                  value={form.billing_interval}
                  onChange={(e) => setForm(f => ({ ...f, billing_interval: e.target.value as 'month' | 'year' }))}
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-admin-muted mb-1 block">Scan Limit</label>
                <Input type="number" min={0} value={form.scan_limit}
                  onChange={(e) => setForm(f => ({ ...f, scan_limit: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="text-xs text-admin-muted mb-1 block">History Days</label>
                <Input type="number" min={0} value={form.history_days}
                  onChange={(e) => setForm(f => ({ ...f, history_days: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-admin-muted mb-1 block">Description</label>
                <textarea rows={2}
                  className="w-full rounded-2xl border border-admin-border bg-white/80 px-4 py-3 text-sm text-admin-ink placeholder:text-admin-muted focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/25 resize-none"
                  value={form.description ?? ''}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-admin-muted mb-1 block">Features</label>
                <textarea
                  rows={5}
                  className="w-full rounded-2xl border border-admin-border bg-white/80 px-4 py-3 text-sm font-mono text-admin-ink placeholder:text-admin-muted focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/25 resize-none"
                  placeholder={"Unlimited scans\nPriority support\nAdvanced analytics"}
                  value={form.features.join('\n')}
                  onChange={(e) => setForm(f => ({ ...f, features: e.target.value.split('\n') }))}
                  onBlur={(e) => setForm(f => ({ ...f, features: e.target.value.split('\n').filter(Boolean) }))}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="plan_is_active" checked={form.is_active}
                  onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <label htmlFor="plan_is_active" className="text-sm text-admin-ink">
                  Active (hiển thị cho người dùng)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button disabled={isCreating || isUpdating} onClick={handleSave}>
                {isCreating || isUpdating ? 'Saving...' : selectedPlan ? 'Save Changes' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}