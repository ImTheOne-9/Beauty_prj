import { RefreshCw, ShieldCheck } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { getAdminRoleLabel, type AdminRole, type AdminSection } from '@/core/entities'
import type { AdminNavigationSection } from '../config/admin-navigation'

type Props = {
  adminRole: AdminRole | null
  activeSection: AdminSection
  sections: AdminNavigationSection[]
  onSectionChange: (section: AdminSection) => void
  onRefresh: () => void
  onSignOut: () => void
}

export function AdminSidebar({
  adminRole,
  activeSection,
  sections,
  onSectionChange,
  onRefresh,
  onSignOut,
}: Props) {
  return (
    <aside className="admin-panel sticky top-[calc(var(--app-header-height)+1rem)] h-fit p-3">
      <div className="rounded-lg border border-admin-border bg-admin-surface p-4">
        <div className="inline-flex items-center gap-2 rounded-md border border-admin-border bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-admin-accent">
          <ShieldCheck className="h-4 w-4" />
          {getAdminRoleLabel(adminRole)}
        </div>
        <h1 className="mt-3 font-admin text-2xl font-semibold text-admin-ink">Dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-admin-muted">
          Manage product data, skin scan history, and user access roles in real-time.
        </p>
      </div>

      <nav className="mt-4 space-y-2">
        {sections.map((section) => {
          const Icon = section.icon
          const active = activeSection === section.id

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                active
                  ? 'border-admin-border bg-slate-100 text-admin-ink'
                  : 'border-transparent bg-white text-admin-muted hover:border-admin-border hover:bg-admin-surface hover:text-admin-ink'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-md p-2 ${active ? 'bg-white text-admin-ink shadow-sm' : 'bg-admin-surface text-admin-muted'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">{section.label}</p>
                  <p className="mt-0.5 text-xs leading-5 text-admin-muted">{section.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="mt-4 space-y-2">
        <Button className="admin-primary w-full justify-center" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
        <Button variant="ghost" className="admin-secondary w-full justify-center" onClick={onSignOut}>
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
