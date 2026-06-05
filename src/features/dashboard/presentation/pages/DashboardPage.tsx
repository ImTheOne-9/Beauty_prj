import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { useAuth } from '@/features/auth/presentation/hooks/useAuth'
import { getAdminRoleLabel } from '@/core/entities'

export default function DashboardPage() {
  const { isAdmin, adminRole } = useAuth()

  return (
    <section className="app-shell section-shell min-h-screen space-y-6 bg-app-subtle pb-12 pt-4">
      <Card className="border-app-border bg-white p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-app-accent">Dashboard</p>
            <h1 className="font-ui text-3xl font-semibold text-app-ink md:text-4xl">Your beauty control hub</h1>
            <p className="text-sm leading-7 text-app-muted md:text-base">
              Track scan activity, routine performance, and admin access from one place.
            </p>
          </div>

          <div className="rounded-lg border border-app-border bg-app-subtle px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-app-muted">Admin status</p>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-app-ink">
              <ShieldCheck className="h-4 w-4 text-app-accent" />
              {isAdmin ? getAdminRoleLabel(adminRole) : 'Standard user'}
            </div>
            <p className="mt-1 text-xs text-app-muted">
              {isAdmin
                ? 'You can open the full admin console now.'
                : 'Admin console is hidden until Supabase role or admin email is set.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="app-primary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                >
                  Open admin console
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : null}
              <Link
                to="/auth"
                className="app-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
              >
                Check access
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-app-muted">Recent Scans</p>
          <h2 className="mt-3 font-ui text-3xl font-semibold text-app-ink">12</h2>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-app-muted">Avg Skin Score</p>
          <h2 className="mt-3 font-ui text-3xl font-semibold text-app-ink">84</h2>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-app-muted">Saved Routines</p>
          <h2 className="mt-3 font-ui text-3xl font-semibold text-app-ink">5</h2>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {[
          {
            title: 'Admin-ready modules',
            detail: 'Products, scans, recommendations, access, and settings now live in the admin console.',
            icon: Sparkles,
          },
          {
            title: 'Role-based visibility',
            detail: 'Only permitted roles can see admin tabs and edit live Supabase data.',
            icon: ShieldCheck,
          },
          {
            title: 'Team workflow',
            detail: 'Use the dashboard for fast checks, then jump into admin when your role allows it.',
            icon: Users,
          },
        ].map((item) => {
          const Icon = item.icon

          return (
            <Card key={item.title} className="border border-app-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-ink">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-app-muted">{item.detail}</p>
                </div>
                <div className="rounded-md bg-app-accent-soft p-3 text-app-accent">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {!isAdmin ? (
        <Card className="border border-dashed border-app-border bg-app-surface p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-app-accent">Why admin is hidden</p>
          <p className="mt-2 text-sm leading-7 text-app-ink">
            Your current Supabase session is not recognized as an admin. Set your profile role to <span className="font-semibold">admin</span> in Supabase, or add your email to <span className="font-semibold">VITE_ADMIN_EMAILS</span>, then log in again.
          </p>
        </Card>
      ) : null}
    </section>
  )
}
