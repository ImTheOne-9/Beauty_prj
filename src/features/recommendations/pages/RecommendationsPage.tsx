import { Card } from '@/shared/components/ui/Card'
import { Loader } from '@/shared/components/ui/Loader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useScanHistory } from '@/features/recommendations/hooks/useScanHistory'
import { useState, useEffect } from 'react'
import { cn } from '@/shared/lib/cn'
import { X, Clock, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { databaseService } from '@/services/supabase/database-service'
import { supabase } from '@/services/supabase/client'

function useScanRecommendations(scan: any) {
  const { data: catalogProducts } = useQuery({
    queryKey: ['catalog', 'products'],
    queryFn: async () => databaseService.getProducts(),
  })

  return useQuery({
    queryKey: ['scan-recommendations', scan?.id],
    enabled: !!scan,
    queryFn: async () => {
      if (!scan) return []

      // If it's a guest scan, get products from local storage/catalog
      if (!scan.user_id) {
        const recList = scan.recommendations ?? []
        const catalog = catalogProducts ?? []
        return recList.map((r: any) => {
          const product = catalog.find((p) => p.id === r.productId)
          return {
            id: r.id,
            reason: r.reason ?? 'Recommended product based on your try-on.',
            product: product ? {
              id: product.id,
              name: product.name,
              description: product.description,
              image_url: product.image_url,
              external_url: product.external_url,
              brand: product.brand,
            } : null,
          }
        }).filter((r: any) => r.product !== null)
      }

      // If logged in, fetch from Supabase
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          id,
          reason,
          product:products (
            id,
            name,
            description,
            image_url,
            external_url,
            brand
          )
        `)
        .eq('scan_id', scan.id)

      if (error) throw error
      return data ?? []
    },
  })
}

function renderEffectDetails(effect: any) {
  const details: { label: string; value: React.ReactNode }[] = []

  if (effect.palettes && effect.palettes.length > 0) {
    effect.palettes.forEach((p: any, i: number) => {
      const labelSuffix = effect.palettes.length > 1 ? ` #${i + 1}` : ''
      details.push({
        label: `Color${labelSuffix}`,
        value: (
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 rounded-full border border-[var(--ui-border)] shadow-sm"
              style={{ backgroundColor: p.color }}
            />
            <span className="font-mono text-[11px] font-semibold uppercase text-[var(--ui-ink)]">{p.color}</span>
          </div>
        ),
      })
      if (p.texture) {
        details.push({
          label: `Texture${labelSuffix}`,
          value: <span className="capitalize">{p.texture}</span>,
        })
      }
      if (p.colorIntensity != null) {
        details.push({
          label: `Color Intensity${labelSuffix}`,
          value: `${p.colorIntensity}%`,
        })
      }
      if (p.glowIntensity != null) {
        details.push({
          label: `Glow Intensity${labelSuffix}`,
          value: `${p.glowIntensity}%`,
        })
      }
      if (p.shimmerIntensity != null) {
        details.push({
          label: `Shimmer Intensity${labelSuffix}`,
          value: `${p.shimmerIntensity}%`,
        })
      }
    })
  }

  if (effect.pattern?.name) {
    details.push({
      label: 'Pattern',
      value: <span className="capitalize">{effect.pattern.name}</span>,
    })
  }
  if (effect.shape?.name) {
    details.push({
      label: 'Shape',
      value: <span className="capitalize">{effect.shape.name}</span>,
    })
  }
  if (effect.style?.type) {
    details.push({
      label: 'Style',
      value: <span className="capitalize">{effect.style.type}</span>,
    })
  }
  if (effect.skinSmoothStrength != null) {
    details.push({
      label: 'Smoothness Strength',
      value: `${effect.skinSmoothStrength}%`,
    })
  }

  if (details.length === 0) return null

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--ui-border)] pt-2 text-xs">
      {details.map((d, index) => (
        <div key={index} className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--ui-muted)]">{d.label}</span>
          <span className="font-semibold text-[var(--ui-ink)]">{d.value}</span>
        </div>
      ))}
    </div>
  )
}

function ScanCard({ scan, onClick }: { scan: any; onClick: () => void }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden border border-[var(--ui-border)] p-0 transition-all duration-300 hover:border-[var(--ui-accent)]/35 hover:shadow-md">
      {/* Before / After Images */}
      <div className="relative grid h-52 grid-cols-2 divide-x divide-[var(--ui-border)] overflow-hidden">
        <div className="relative h-full w-full overflow-hidden bg-[var(--ui-subtle)]">
          {scan.original_image ? (
            <img
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              src={scan.original_image}
              alt="Before"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[var(--ui-muted)]">Before</div>
          )}
          <span className="absolute bottom-2 left-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white">
            Before
          </span>
        </div>
        <div className="relative h-full w-full overflow-hidden bg-[var(--ui-subtle)]">
          {scan.image_url ? (
            <img
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              src={scan.image_url}
              alt="After"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[var(--ui-muted)]">After</div>
          )}
          <span className="absolute bottom-2 left-2 rounded-full bg-[var(--ui-accent)]/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            After
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col gap-3 p-5 text-[var(--ui-ink)]">
        <div className="flex justify-between items-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--ui-accent)]">
            Scan #{scan.id.slice(0, 8)}
          </p>
          <span className={cn(
            'text-[10px] font-bold rounded-lg px-2 py-0.5 border',
            scan.mode === 'api' 
              ? 'text-emerald-700 bg-emerald-50/50 border-emerald-100' 
              : 'border-[var(--ui-border)] bg-[var(--ui-subtle)] text-[var(--ui-accent)]',
          )}>
            {scan.mode === 'api' ? 'API' : 'Demo'}
          </span>
        </div>

        <h3 className="text-xs font-semibold text-[var(--ui-muted)]">
          {new Date(scan.created_at).toLocaleString('en-US')}
        </h3>

        <div className="pt-3 mt-auto">
          <button
            onClick={onClick}
            className="w-full rounded-xl bg-[var(--ui-accent)] py-3 text-center text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[var(--ui-accent-hover)] active:scale-[0.98]"
          >
            View Details
          </button>
        </div>
      </div>
    </Card>
  )
}

function RecommendedProductsList({ scan }: { scan: any }) {
  const { data: recs, isLoading } = useScanRecommendations(scan)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <Loader label="Loading recommendations..." />
      </div>
    )
  }

  if (!recs || recs.length === 0) {
    return (
      <p className="py-4 text-xs text-[var(--ui-muted)]">No product recommendations found for this scan.</p>
    )
  }

  return (
    <div className="space-y-4">
      {recs.map((rec: any) => {
        const prod = rec.product
        if (!prod) return null
        return (
          <div key={rec.id} className="group relative flex gap-3 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3.5 shadow-sm transition-all duration-300 hover:border-[var(--ui-accent)]/35">
            {prod.image_url && (
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-subtle)]">
                <img src={prod.image_url} className="h-full w-full object-cover" alt={prod.name} />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <span className="mb-0.5 block text-[9px] font-extrabold uppercase tracking-wider text-[var(--ui-accent)]">
                  {prod.brand || 'Skincare'}
                </span>
                <h4 className="truncate text-xs font-bold leading-tight text-[var(--ui-ink)]">
                  {prod.name}
                </h4>
                <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-[var(--ui-muted)]">
                  {prod.description}
                </p>
              </div>

              {prod.external_url && (
                <div className="mt-2.5 flex items-center justify-between border-t border-[var(--ui-border)] pt-2">
                  <a
                    href={prod.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--ui-accent)] transition hover:text-[var(--ui-accent-hover)]"
                  >
                    Buy now
                  </a>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ScanDetailModal({ scan, onClose }: { scan: any; onClose: () => void }) {
  const enabledEffects = (scan.effects ?? []).filter((e: any) => e.enabled)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, lightboxImage])

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-2xl">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-10 rounded-full bg-[var(--ui-surface)]/90 p-2 text-[var(--ui-muted)] shadow-sm transition hover:bg-[var(--ui-subtle)] hover:text-[var(--ui-accent)]"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid flex-1 grid-cols-1 divide-y divide-[var(--ui-border)] overflow-y-auto lg:grid-cols-12 lg:divide-x lg:divide-y-0">
            {/* Left Side: Images (Wider Span) */}
            <div className="space-y-4 p-6 md:p-8 lg:col-span-5">
              <h3 className="text-lg font-bold text-[var(--ui-ink)]">Visual Comparison</h3>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className="relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-subtle)] transition hover:brightness-95"
                  onClick={() => scan.original_image && setLightboxImage(scan.original_image)}
                >
                  {scan.original_image ? (
                    <img src={scan.original_image} className="h-full w-full object-cover" alt="Before" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--ui-muted)]">Before</div>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-0.5 text-xs font-semibold text-white">Before</span>
                </div>
                <div 
                  className="relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-subtle)] transition hover:brightness-95"
                  onClick={() => scan.image_url && setLightboxImage(scan.image_url)}
                >
                  {scan.image_url ? (
                    <img src={scan.image_url} className="h-full w-full object-cover" alt="After" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--ui-muted)]">After</div>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full bg-[var(--ui-accent)] px-2.5 py-0.5 text-xs font-semibold text-white">After</span>
                </div>
              </div>
              {scan.image_url && (
                <a
                  href={scan.image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-subtle)] py-3 text-sm font-medium text-[var(--ui-accent)] no-underline shadow-sm transition hover:bg-[var(--ui-accent)]/10"
                >
                  <Download className="h-4 w-4" />
                  Download Result Image
                </a>
              )}
            </div>

            {/* Middle Side: Details & Effects */}
            <div className="space-y-6 overflow-y-auto p-6 md:p-8 lg:col-span-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ui-accent)]">Scan Details</p>
                <h2 className="mt-1 text-2xl font-extrabold text-[var(--ui-ink)]">Metadata & Effects</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-subtle)] p-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-[var(--ui-muted)]">Scan ID</span>
                  <span className="break-all font-mono text-xs font-semibold text-[var(--ui-ink)]">{scan.id}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-[var(--ui-muted)]">Mode</span>
                  <span className={cn(
                    'mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase',
                    scan.mode === 'api' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-accent)]',
                  )}>
                    {scan.mode === 'api' ? 'API' : 'Demo'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold uppercase text-[var(--ui-muted)]">Captured Date</span>
                  <div className="mt-0.5 flex items-center gap-2 text-xs font-medium text-[var(--ui-ink)]">
                    <Clock className="h-3.5 w-3.5 text-[var(--ui-muted)]" />
                    {new Date(scan.created_at).toLocaleString('en-US')}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--ui-muted)]">Applied Makeup Effects</h3>
                {enabledEffects.length === 0 ? (
                  <p className="text-xs text-[var(--ui-muted)]">No makeup effects were active for this scan.</p>
                ) : (
                  <div className="space-y-4">
                    {enabledEffects.map((e: any) => (
                      <div key={e.category} className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold capitalize text-[var(--ui-ink)]">
                            {e.category.replace('_', ' ')}
                          </span>
                          <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                            Active
                          </span>
                        </div>
                        {renderEffectDetails(e)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Recommendations */}
            <div className="space-y-6 overflow-y-auto p-6 md:p-8 lg:col-span-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ui-accent)]">AI Curated</p>
                <h3 className="mt-1 text-xl font-extrabold text-[var(--ui-ink)]">Recommendations</h3>
              </div>
              <RecommendedProductsList scan={scan} />
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for full screen viewing */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute right-6 top-6 z-[110] rounded-full p-2 text-white bg-white/10 hover:bg-white/20 transition"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightboxImage}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-fade-in"
            alt="Enlarged view"
          />
        </div>
      )}
    </>
  )
}

export default function RecommendationsPage() {
  const { user } = useAuth()
  const historyQuery = useScanHistory(user?.id)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [selectedScan, setSelectedScan] = useState<any>(null)
  const [page, setPage] = useState(1)
  const itemsPerPage = 9

  const scans = historyQuery.data ?? []
  
  const sorted = [...scans].sort((a: any, b: any) => {
    const timeA = new Date(a.created_at).getTime()
    const timeB = new Date(b.created_at).getTime()
    return sortBy === 'newest' ? timeB - timeA : timeA - timeB
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage))
  const paginated = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  useEffect(() => {
    setPage(1)
  }, [sortBy])

  if (historyQuery.isLoading) {
    return <Loader fullScreen label="Loading scan history" />
  }

  return (
    <section className="section-shell space-y-6 pb-12">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-app-accent">Scan History</p>
        <h1 className="mt-3 font-ui text-4xl text-app-ink">Makeup Try-On History</h1>
        <p className="mt-2 text-sm text-app-muted">Review your previous makeup try-on scans.</p>
      </div>

      {/* Sorting bar */}
      <div className="flex items-center justify-between border-b border-app-border pb-4">
        <span className="text-xs text-app-muted">{scans.length} scans found</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-app-muted">Sort by:</span>
          {(['newest', 'oldest'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-xs font-semibold transition capitalize',
                sortBy === s
                  ? 'border-app-accent/40 bg-app-accent/10 text-app-accent'
                  : 'border-app-border bg-app-surface text-app-muted hover:bg-app-subtle',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of scans */}
      {sorted.length === 0 ? (
        <div className="rounded-[2rem] border border-app-border bg-app-surface p-12 text-center text-sm text-app-muted">
          No scans yet. Try on makeup to save your history.
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map((scan: any, index: number) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: (index % itemsPerPage) * 0.06, duration: 0.4 }}
              >
                <ScanCard scan={scan} onClick={() => setSelectedScan(scan)} />
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="text-sm font-semibold text-app-ink">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {selectedScan && (
        <ScanDetailModal scan={selectedScan} onClose={() => setSelectedScan(null)} />
      )}
    </section>
  )
}
