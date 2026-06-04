import { CheckCircle2, Clock3, Database, ListChecks, Megaphone, Rocket } from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'

const settings = [
  {
    title: 'Platform Status',
    detail: 'Supabase-powered catalog, scan logs, and admin permissions are live.',
    icon: CheckCircle2,
  },
  {
    title: 'Evaluation Engine',
    detail: 'Configure scan scores, modify tags, and customize match reason descriptions.',
    icon: ListChecks,
  },
  {
    title: 'Permission Admin',
    detail: 'Limit access by job function through detailed simulated roles for developers.',
    icon: Clock3,
  },
  {
    title: 'Simulation Tools',
    detail: 'Generate artificial scan results to verify product catalog and recommendation loops.',
    icon: Megaphone,
  },
  {
    title: 'Data Sync',
    detail: 'Actual client pages fetch items from the database instead of simulated files.',
    icon: Database,
  },
  {
    title: 'Reload Cycle',
    detail: 'Click reload or clear cache to revalidate queries after updating.',
    icon: Rocket,
  },
]

export function AdminSettingsSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {settings.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.title} className="flex items-start justify-between gap-3 border border-admin-border bg-white p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-admin-accent">{item.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-admin-muted">{item.detail}</p>
            </div>
            <div className="shrink-0 rounded-2xl bg-admin-subtle p-2.5 text-admin-accent">
              <Icon className="h-5 w-5" />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
