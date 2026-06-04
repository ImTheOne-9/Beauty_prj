import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react'
import { type ProductRecommendation } from '@/shared/lib/types'

const PAGE_SIZE = 6

type ScanProductGridProps = {
  products: ProductRecommendation[]
  pageSize?: number
}

function getPartnerName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    if (hostname.includes('sephora')) return 'Sephora'
    if (hostname.includes('ulta')) return 'Ulta'
    if (hostname.includes('dermstore')) return 'Dermstore'
    if (hostname.includes('amazon')) return 'Amazon'
    const parts = hostname.split('.')
    const name = parts[0] ?? 'Shop'
    return name.charAt(0).toUpperCase() + name.slice(1)
  } catch {
    return 'Shop'
  }
}

function CompactProductCard({ product, index }: { product: ProductRecommendation; index: number }) {
  const partner = getPartnerName(product.externalLink)
  const matchScore = (product as any).matchScore ?? 0
  const hasImage = Boolean(product.image?.trim())

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[var(--ui-accent)]/30 hover:shadow-lg"
      role="article"
      aria-label={product.name}
    >
      {/* Product image - taller for visual impact */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl bg-[var(--ui-subtle)]">
        {hasImage ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ui-muted)]">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          {typeof product.rating === 'number' ? (
            <div className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-[var(--ui-accent)] shadow-sm">
              <Star className="h-3 w-3 text-amber-400" />
              <span className="text-xs">{product.rating.toFixed(1)}</span>
            </div>
          ) : null}
          <div className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-[11px] text-[var(--ui-accent)] shadow-sm">{Math.round(matchScore)} pts</div>
        </div>
        {product.discount ? (
          <div className="absolute -right-3 top-12 rotate-6 rounded-md bg-[var(--ui-accent)] px-3 py-1 text-xs font-bold text-white shadow-lg">-{product.discount}%</div>
        ) : null}
        {index === 0 ? (
          <div className="absolute left-3 top-3 rounded-md bg-[var(--ui-accent)] px-3 py-1 text-xs font-semibold text-white shadow-sm">Top Pick</div>
        ) : null}

        <span className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--ui-accent)] shadow-sm backdrop-blur-sm">
          {product.category}
        </span>
      </div>

      {/* Info area */}
        <div className="flex flex-1 flex-col gap-2 p-4">
        <h4 className="line-clamp-2 text-sm font-bold leading-snug text-[var(--ui-ink)]">{product.name}</h4>
        <p className="line-clamp-2 text-xs leading-relaxed text-[var(--ui-muted)]">{product.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              {product.originalPrice ? <span className="text-[12px] text-[var(--ui-muted)] line-through">{product.originalPrice}</span> : null}
              {product.price ? <span className="text-sm font-extrabold text-[var(--ui-ink)]">{product.price}</span> : null}
            </div>
            <p className="text-[10px] text-[var(--ui-muted)]">{product.reason}</p>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--ui-muted)]">
              {typeof product.reviews === 'number' ? <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" />{product.rating} · {product.reviews} reviews</span> : null}
              {typeof product.stock === 'number' ? (
                <span className={`${product.stock <= 5 ? 'font-bold text-[var(--ui-accent)]' : 'text-[var(--ui-muted)]'}`}>{product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}</span>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 w-36">
            <a
              href={product.externalLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Buy ${product.name} at ${partner}`}
              className={`block w-full rounded-xl bg-[var(--ui-accent)] px-3 py-3 text-center text-sm font-bold text-white shadow-[0_8px_30px_rgba(15,23,42,0.12)] transition hover:bg-[var(--ui-accent-hover)] hover:scale-[0.998] active:scale-95 ${!product.externalLink ? 'pointer-events-none opacity-60' : ''}`}
            >
              <div className="inline-flex items-center justify-center gap-2"><ShoppingCart className="h-4 w-4" />Buy at {partner}</div>
            </a>
            <div className="mt-2 text-right text-[11px] text-[var(--ui-muted)]">{partner}</div>
            <div className="mt-1 text-center text-[11px] text-[var(--ui-muted)]">Secure checkout - Free returns</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ScanProductGrid({ products, pageSize }: ScanProductGridProps) {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(1)
  const effectivePageSize = pageSize ?? PAGE_SIZE

  const totalPages = Math.ceil(products.length / effectivePageSize)
  const start = page * effectivePageSize
  const pageProducts = products.slice(start, start + effectivePageSize)

  const goTo = (next: number) => {
    setDirection(next > page ? 1 : -1)
    setPage(next)
  }

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  }

  return (
    <div className="space-y-4">

      {/* Product grid - 5 columns */}
      <div className="relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
            <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`grid grid-cols-2 gap-3 ${effectivePageSize <= 4 ? 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3'}`}
          >
            {pageProducts.map((product, index) => (
              <div key={product.id}>
                <CompactProductCard product={product} index={index} />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          {/* Prev button */}
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-xs font-bold text-[var(--ui-accent)] shadow-sm transition hover:bg-[var(--ui-subtle)] disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>

          {/* Page dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === page
                  ? 'w-6 bg-[var(--ui-accent)] shadow-sm'
                  : 'w-2 bg-[var(--ui-border)] hover:bg-[var(--ui-accent)]/35'
                  }`}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages - 1}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-xs font-bold text-[var(--ui-accent)] shadow-sm transition hover:bg-[var(--ui-subtle)] disabled:pointer-events-none disabled:opacity-30"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Count indicator */}
      <p className="text-center text-[10px] font-medium text-[var(--ui-muted)]">
        Showing {start + 1}–{Math.min(start + effectivePageSize, products.length)} of {products.length} products
      </p>
    </div>
  )
}
