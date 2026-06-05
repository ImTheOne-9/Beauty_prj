import { Activity, Database, PencilLine, Wifi, type LucideIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import type { AdminSection } from '@/core/entities'

type OverviewCard = {
  label: string
  value: string | number
  hint: string
  icon: LucideIcon
}

type ActivityLog = {
  id: string
  user: string
  event: string
  time: string
  type: 'success' | 'info' | 'warning'
}

type Props = {
  cards: OverviewCard[]
  activityLog: ActivityLog[]
  rowCount: number
  pingTime: number | null
  pingStatus: 'idle' | 'pinging' | 'success' | 'failed'
  onPing: () => void
  onNavigate: (section: AdminSection) => void
}

export function AdminOverviewSection({
  cards,
  activityLog,
  rowCount,
  pingTime,
  pingStatus,
  onPing,
  onNavigate,
}: Props) {
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-admin-border bg-white p-0">
        <div className="relative z-10 grid gap-6 p-6 lg:grid-cols-[1.35fr_0.9fr] lg:p-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-admin-border bg-admin-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-admin-accent">
              <Database className="h-4 w-4" />
              Supabase Platform Connection
            </div>
            <div className="space-y-3">
              <h2 className="font-admin text-3xl font-semibold text-admin-ink md:text-4xl">
                Operate the entire beauty platform from one place
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-admin-muted md:text-base">
                Real-time Supabase connection is active. Changes to categories, scans, and roles will sync immediately and reflect on the application.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="admin-primary" onClick={() => onNavigate('products')}>
                Manage Products
                <PencilLine className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="admin-secondary" onClick={() => onNavigate('scans')}>
                Scans & Simulation
              </Button>
              <Button variant="ghost" className="admin-secondary" onClick={() => onNavigate('access')}>
                Edit User Roles
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.label} className="rounded-lg border border-admin-border bg-admin-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-admin-muted">{card.label}</p>
                      <p className="mt-2 font-admin text-3xl font-semibold text-admin-ink">{card.value}</p>
                      <p className="mt-1 text-xs text-admin-muted">{card.hint}</p>
                    </div>
                    <div className="rounded-md border border-admin-border bg-white p-3 text-admin-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col justify-between border border-admin-border bg-white p-5">
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-admin-accent">
              <span>Supabase Connection</span>
              <Wifi className="h-4 w-4 animate-pulse text-emerald-500" />
            </div>
            <h3 className="mt-3 font-admin text-2xl text-admin-ink">Online</h3>
            <p className="mt-1 text-xs leading-relaxed text-admin-muted">API is active and accepting CRUD operations.</p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-admin-border pt-3 text-xs">
            <span className="text-admin-muted">DB Latency:</span>
            <span className="font-semibold text-emerald-600">
              {pingStatus === 'pinging' ? '...' : pingTime && pingTime > 0 ? `${pingTime}ms` : 'Ping Failed'}
            </span>
          </div>
        </Card>

        <Card className="border border-admin-border bg-white p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-admin-accent">DB Queries</p>
          <h3 className="mt-3 font-admin text-2xl text-admin-ink">{rowCount} rows</h3>
          <p className="mt-2 text-xs text-admin-muted">Products, recommendations, and records.</p>
          <div className="mt-3 border-t border-admin-border pt-3 text-right">
            <button
              onClick={onPing}
              disabled={pingStatus === 'pinging'}
              className="ml-auto flex items-center justify-end gap-1 text-xs text-admin-accent hover:underline"
            >
              <Activity className="h-3 w-3" />
              {pingStatus === 'pinging' ? 'Checking...' : 'Check Connection'}
            </button>
          </div>
        </Card>

        <Card className="border border-admin-border bg-white p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-admin-accent">CPU Simulation</p>
          <h3 className="mt-3 font-admin text-2xl text-admin-ink">14% - 24%</h3>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-admin-subtle">
            <div className="h-full w-[18%] rounded-full bg-admin-accent" />
          </div>
          <p className="mt-2 text-[10px] text-admin-muted">Average server usage</p>
        </Card>

        <Card className="border border-admin-border bg-white p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-admin-accent">Memory Load</p>
          <h3 className="mt-3 font-admin text-2xl text-admin-ink">512 MB</h3>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-admin-subtle">
            <div className="h-full w-[50%] rounded-full bg-teal-400" />
          </div>
          <p className="mt-2 text-[10px] text-admin-muted">Used 512MB out of 1024MB allocated</p>
        </Card>
      </div>

      <Card className="space-y-4 border border-admin-border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-admin text-xl text-admin-ink">System Activity</h3>
            <p className="text-xs text-admin-muted">Live notifications and activity logs.</p>
          </div>
          <span className="rounded-full bg-admin-subtle px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-admin-accent">Logs</span>
        </div>
        <div className="max-h-60 divide-y divide-rose-50 overflow-y-auto pr-1">
          {activityLog.map((log) => (
            <div key={log.id} className="flex items-start justify-between gap-3 py-3 text-xs">
              <div className="flex gap-2">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${log.type === 'success' ? 'bg-emerald-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-admin-subtle0'}`} />
                <div>
                  <p className="font-semibold text-admin-ink">{log.user}</p>
                  <p className="text-admin-muted">{log.event}</p>
                </div>
              </div>
              <span className="whitespace-nowrap text-admin-muted">{log.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
