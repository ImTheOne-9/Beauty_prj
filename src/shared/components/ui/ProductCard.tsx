import { ArrowUpRight, ShoppingCart } from 'lucide-react'
import { type ProductRecommendation } from '@/shared/lib/types'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Modal } from '@/shared/components/ui/Modal'
import { useEffect, useState } from 'react'

type ProductCardProps = {
  product: ProductRecommendation
  ctaVariant?: 'A' | 'B'
}

export function ProductCard({ product, ctaVariant }: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(product.stock && product.stock <= 5 ? product.stock * 3600 : null)
  const hasImage = Boolean(product.image?.trim())

  useEffect(() => {
    let timer: number | undefined
    if (secondsLeft && secondsLeft > 0) {
      timer = window.setInterval(() => {
        setSecondsLeft((s) => (s && s > 0 ? s - 1 : 0))
      }, 1000)
    }
    return () => {
      if (timer) window.clearInterval(timer)
    }
  }, [product.id, secondsLeft])

  const formatSeconds = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h}h ${m}m ${sec}s`
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden border border-[var(--ui-border)] p-0 transition-all duration-300 hover:border-[var(--ui-accent)]/35 hover:shadow-md">
      <div className="relative h-52 overflow-hidden bg-[var(--ui-subtle)]">
        {hasImage ? (
          <img
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ui-muted)]">
            No image
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-45" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 text-[var(--ui-ink)]">
        <div className="flex justify-between items-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--ui-accent)]">{product.category}</p>
          <span className="rounded-lg border border-[var(--ui-accent)]/15 bg-[var(--ui-accent)]/5 px-2 py-0.5 text-[10px] font-bold text-[var(--ui-accent)]">
            Affiliate Link
          </span>
        </div>
        <h3 className="font-ui text-xl font-bold leading-snug text-[var(--ui-ink)]">{product.name}</h3>
        <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{product.description}</p>
        <p className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-subtle)] p-3.5 text-xs font-medium leading-relaxed text-[var(--ui-ink)]">
          {product.reason}
        </p>
        {product.matchReason ? (
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="font-mono text-[12px] text-[var(--ui-muted)]">Match: {product.matchReason}</div>
            <button onClick={() => setModalOpen(true)} className="text-xs font-semibold text-[var(--ui-accent)] underline">Details</button>
          </div>
        ) : null}
        
        <div className="mt-auto pt-3">
          <a
            href={product.externalLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-white shadow-md ${
              ctaVariant === 'B'
                ? 'animate-pulse bg-[var(--ui-accent-hover)] shadow-[0_10px_30px_rgba(15,23,42,0.12)]'
                : 'bg-[var(--ui-accent)] shadow-[0_10px_30px_rgba(15,23,42,0.10)]'
            } hover:brightness-105 active:scale-[0.98] transition-all ${!product.externalLink ? 'pointer-events-none opacity-60' : ''}`}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Buy now
              <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
            </span>
          </a>

          {typeof product.stock === 'number' ? (
            <div className="mt-2 flex items-center justify-between text-[12px]">
              <div className={`rounded-full px-2 py-1 ${product.stock <= 5 ? 'bg-[var(--ui-accent)]/10 text-[var(--ui-accent)] font-bold' : 'text-[var(--ui-muted)]'}`}>
                {product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
              </div>
              <div className="text-right text-[11px] text-[var(--ui-muted)]">
                Secure checkout
                {secondsLeft && secondsLeft > 0 ? (
                  <div className="text-[11px] text-[var(--ui-accent)]">Offer ends in {formatSeconds(secondsLeft)}</div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    {modalOpen ? (
      <Modal
        open={modalOpen}
        title={product.name}
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-4">
          {hasImage ? (
            <img src={product.image} alt={product.name} className="w-full rounded-md object-cover" />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-md bg-[var(--ui-subtle)] text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ui-muted)]">
              No image
            </div>
          )}
          <p className="text-sm text-[var(--ui-muted)]">{product.description}</p>
          {product.matchReason ? <p className="font-mono text-xs text-[var(--ui-muted)]">Reason: {product.matchReason}</p> : null}
          <div className="flex items-center justify-between">
            <div>
              {product.price ? <div className="text-lg font-bold text-[var(--ui-ink)]">{product.price}</div> : null}
              {product.originalPrice ? <div className="text-sm line-through text-[var(--ui-muted)]">{product.originalPrice}</div> : null}
            </div>
            <a href={product.externalLink} target="_blank" rel="noopener noreferrer">
              <Button className={`px-4 py-2 text-sm ${ctaVariant === 'B' ? 'animate-pulse' : ''}`}>
                <ShoppingCart className="h-4 w-4" /> Buy now
              </Button>
            </a>
          </div>
        </div>
      </Modal>
    ) : null}
    </Card>
  )
}


