import { useState } from 'react'
import { Search, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { cn } from '@/shared/lib/cn'
import { AdminPagination } from './AdminPagination'
import { AdminSectionTitle } from './AdminSectionTitle'

type ScanEffect = {
  category: string
  enabled: boolean
  palettes?: Array<{
    color: string
    texture?: string
    colorIntensity?: number
    glowIntensity?: number
    shimmerIntensity?: number
  }>
  pattern?: { name: string }
  shape?: { name: string }
  style?: { type: string }
  skinSmoothStrength?: number
}

export type AdminScanRecord = {
  id: string
  user_id: string | null
  mode: 'api' | 'demo'
  original_image: string | null
  image_url: string | null
  effects: ScanEffect[]
  created_at: string
}

type AdminScansSectionProps = {
  scans: AdminScanRecord[]
  filteredCount: number
  search: string
  modeFilter: 'all' | 'api' | 'demo'
  page: number
  totalPages: number
  isDeleting: boolean
  userLookup: Map<string, { email: string; role: string }>
  onSearchChange: (value: string) => void
  onModeFilterChange: (value: 'all' | 'api' | 'demo') => void
  onPageChange: (page: number) => void
  onDelete: (id: string) => void
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function renderEffectDetails(effect: ScanEffect) {
  const details: { label: string; value: React.ReactNode }[] = []

  if (effect.palettes && effect.palettes.length > 0) {
    effect.palettes.forEach((p, i) => {
      const suffix = effect.palettes!.length > 1 ? ` #${i + 1}` : ''
      details.push({
        label: `Color${suffix}`,
        value: (
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-full border border-admin-border/20 shadow-sm"
              style={{ backgroundColor: p.color }}
            />
            <span className="font-mono text-[11px] uppercase text-admin-ink font-semibold">{p.color}</span>
          </div>
        ),
      })
      if (p.texture)          details.push({ label: `Texture${suffix}`,           value: <span className="capitalize">{p.texture}</span> })
      if (p.colorIntensity   != null) details.push({ label: `Color Intensity${suffix}`,   value: `${p.colorIntensity}%` })
      if (p.glowIntensity    != null) details.push({ label: `Glow Intensity${suffix}`,    value: `${p.glowIntensity}%` })
      if (p.shimmerIntensity != null) details.push({ label: `Shimmer Intensity${suffix}`, value: `${p.shimmerIntensity}%` })
    })
  }

  if (effect.pattern?.name)         details.push({ label: 'Pattern', value: <span className="capitalize">{effect.pattern.name}</span> })
  if (effect.shape?.name)           details.push({ label: 'Shape',   value: <span className="capitalize">{effect.shape.name}</span> })
  if (effect.style?.type)           details.push({ label: 'Style',   value: <span className="capitalize">{effect.style.type}</span> })
  if (effect.skinSmoothStrength != null) details.push({ label: 'Smoothness Strength', value: `${effect.skinSmoothStrength}%` })

  if (details.length === 0) return null

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 text-xs border-t border-admin-border pt-2">
      {details.map((d, index) => (
        <div key={index} className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase font-bold text-admin-muted tracking-wider">{d.label}</span>
          <span className="text-admin-ink font-semibold">{d.value}</span>
        </div>
      ))}
    </div>
  )
}

export function AdminScansSection({
  scans,
  filteredCount,
  search,
  modeFilter,
  page,
  totalPages,
  isDeleting,
  userLookup,
  onSearchChange,
  onModeFilterChange,
  onPageChange,
  onDelete,
}: AdminScansSectionProps) {
  const [selectedScan, setSelectedScan] = useState<AdminScanRecord | null>(null)

  return (
    <div className="space-y-4">
      {/* Search & filter */}
      <div className="bg-white border border-admin-border rounded-3xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-admin-muted" />
          <input
            type="text"
            className="w-full rounded-full border border-admin-border pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent/20"
            placeholder="Search by Scan ID, User UUID or Email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          className="rounded-full border border-admin-border px-3 py-2 text-sm text-admin-ink focus:outline-none"
          value={modeFilter}
          onChange={(e) => onModeFilterChange(e.target.value as 'all' | 'api' | 'demo')}
        >
          <option value="all">All Modes</option>
          <option value="api">API Mode</option>
          <option value="demo">Demo Mode</option>
        </select>
      </div>

      {/* Table */}
      <Card className="border border-admin-border p-6 bg-white shadow-sm">
        <AdminSectionTitle
          eyebrow="Scan History"
          title="All Users Scans"
          description={`${filteredCount} scan record(s) — image preview, user email, applied effects.`}
        />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-admin-border text-admin-ink font-bold uppercase tracking-wider">
                <th className="pb-3 pr-3 w-[100px]">Images</th>
                <th className="pb-3 px-3">Scan ID</th>
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Mode</th>
                <th className="pb-3 px-3 min-w-[200px]">Effects</th>
                <th className="pb-3 px-3 whitespace-nowrap">Created</th>
                <th className="pb-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {scans.map((scan) => {
                const email = scan.user_id
                  ? (userLookup.get(scan.user_id)?.email ?? scan.user_id.slice(0, 8) + '...')
                  : 'Guest'
                return (
                  <tr key={scan.id} className="hover:bg-admin-subtle text-admin-ink align-middle">
                    <td className="py-3 pr-3">
                      <div className="flex gap-1">
                        {[scan.original_image, scan.image_url].map((url, i) => (
                          <img
                            key={i}
                            src={url || 'https://placehold.co/40x40/fce7f3/9f1239?text=?'}
                            alt={i === 0 ? 'Before' : 'After'}
                            className="h-10 w-10 rounded-lg border border-admin-border object-cover bg-admin-subtle"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold" title={scan.id}>
                      {scan.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-3 text-admin-muted max-w-[180px] truncate" title={email}>
                      {email}
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn(
                        'text-[10px] font-bold rounded-lg px-2 py-0.5 border',
                        scan.mode === 'api'
                          ? 'text-emerald-700 bg-emerald-50/50 border-emerald-100'
                          : 'text-admin-accent bg-admin-subtle border-admin-border',
                      )}>
                        {scan.mode === 'api' ? 'API' : 'Demo'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(scan.effects ?? []).map((e) => (
                          <span
                            key={e.category}
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-[11px] capitalize',
                              e.enabled
                                ? 'bg-admin-subtle border border-admin-border text-admin-accent'
                                : 'bg-admin-subtle border border-admin-border text-admin-muted',
                            )}
                          >
                            {e.category.replace(/_/g, ' ')}
                            {e.enabled ? ' (Active)' : ' (Disabled)'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-admin-muted whitespace-nowrap">
                      {formatDate(scan.created_at)}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedScan(scan)}>
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { if (confirm('Delete this scan?')) onDelete(scan.id) }}
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

          {scans.length === 0 && (
            <div className="text-center py-12 text-admin-muted text-sm">No scan records found.</div>
          )}
        </div>

        <AdminPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </Card>

      {/* Detail modal */}
      {selectedScan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedScan(null) }}
        >
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-admin-border bg-white shadow-2xl flex flex-col max-h-[90vh]">
            <button
              onClick={() => setSelectedScan(null)}
              className="absolute right-5 top-5 z-10 rounded-full p-2 text-admin-muted bg-white/90 hover:bg-admin-subtle hover:text-admin-accent transition shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-rose-100 overflow-y-auto flex-1">
              {/* Left: Images */}
              <div className="lg:col-span-5 p-6 md:p-8 space-y-4">
                <h3 className="font-admin text-lg font-bold text-admin-ink">Visual Comparison</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(['original_image', 'image_url'] as const).map((key, i) => (
                    <div key={key} className="relative rounded-2xl overflow-hidden bg-admin-subtle border border-admin-border aspect-[3/4]">
                      {selectedScan[key] ? (
                        <img src={selectedScan[key]!} className="h-full w-full object-cover" alt={i === 0 ? 'Before' : 'After'} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-admin-muted">
                          {i === 0 ? 'Before' : 'After'}
                        </div>
                      )}
                      <span className={cn(
                        'absolute bottom-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white',
                        i === 0 ? 'bg-black/55' : 'bg-admin-accent',
                      )}>
                        {i === 0 ? 'Before' : 'After'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Details */}
              <div className="lg:col-span-7 p-6 md:p-8 space-y-6 overflow-y-auto">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-admin-accent">Scan Details</p>
                  <h2 className="mt-1 font-admin text-2xl text-admin-ink font-extrabold">Metadata & Effects</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-2xl bg-admin-subtle border border-admin-border p-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-admin-muted block">Scan ID</span>
                    <span className="font-mono text-xs text-admin-ink font-semibold break-all">{selectedScan.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-admin-muted block">Email</span>
                    <span className="text-xs text-admin-ink font-semibold break-all">
                      {selectedScan.user_id ? (userLookup.get(selectedScan.user_id)?.email ?? 'Unknown') : 'Guest'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-admin-muted block">Mode</span>
                    <span className={cn(
                      'inline-block rounded-full px-2 py-0.5 text-[10px] font-bold border mt-0.5 uppercase',
                      selectedScan.mode === 'api'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-admin-subtle text-admin-accent border-admin-border',
                    )}>
                      {selectedScan.mode === 'api' ? 'API' : 'Demo'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-admin-muted block">Created</span>
                    <p className="text-xs text-admin-ink font-medium mt-0.5">{formatDate(selectedScan.created_at)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase font-bold tracking-widest text-admin-muted mb-3">All Makeup Effects</h3>
                  {(selectedScan.effects ?? []).length === 0 ? (
                    <p className="text-xs text-admin-muted">No makeup effects recorded for this scan.</p>
                  ) : (
                    <div className="space-y-4">
                      {(selectedScan.effects ?? []).map((e) => (
                        <div key={e.category} className="rounded-2xl border border-admin-border bg-admin-subtle p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold capitalize text-admin-ink">
                              {e.category.replace(/_/g, ' ')}
                            </span>
                            <span className={cn(
                              'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border',
                              e.enabled
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                : 'bg-gray-50 border-gray-200 text-gray-400',
                            )}>
                              {e.enabled ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                          {renderEffectDetails(e)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
