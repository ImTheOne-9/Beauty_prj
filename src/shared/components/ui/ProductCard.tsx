import { ArrowUpRight, ShoppingBag } from 'lucide-react'
import { type ProductRecommendation } from '@/shared/lib/types'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { useEffect, useState } from 'react'

type ProductCardProps = {
  product: ProductRecommendation
  ctaVariant?: 'A' | 'B'
}

function getVariantSwatchStyle(variant: NonNullable<ProductRecommendation['variants']>[number]) {
  const color = variant.colorHex || '#e5e7eb'
  const shimmerColor = variant.shimmerColor?.trim()

  if (shimmerColor) {
    return {
      background: `linear-gradient(135deg, ${color} 0 50%, ${shimmerColor} 50% 100%)`,
    }
  }

  return { backgroundColor: color }
}

export function ProductCard({ product, ctaVariant }: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(product.stock && product.stock <= 5 ? product.stock * 3600 : null)
  const hasImage = Boolean(product.image?.trim())
  const visibleVariants = product.variants?.filter((variant) => variant.colorHex?.trim()).slice(0, 6) ?? []
  const extraVariantCount = Math.max(0, (product.variants?.length ?? 0) - visibleVariants.length)
  const label = product.brand?.trim() || product.category
  const showCategory = Boolean(product.brand?.trim() && product.category && product.category !== product.brand)

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
    <article className="group flex h-full flex-col rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 transition-all duration-200 hover:border-zinc-300 hover:shadow-md">
      <div className="overflow-hidden rounded-md bg-[var(--ui-subtle)]">
        <div className="flex aspect-square w-full items-center justify-center p-4">
          {hasImage ? (
            <img
              className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
              src={product.image}
              alt={product.name}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ui-muted)]">
              No image
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col text-[var(--ui-ink)]">
        <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-[var(--ui-accent)]">
          {label}
        </p>
        {showCategory ? (
          <p className="mt-1 text-center text-[11px] font-medium text-[var(--ui-muted)]">{product.category}</p>
        ) : null}
        <h3 className="mt-2 line-clamp-2 min-h-12 text-center text-base font-bold leading-6 text-[var(--ui-ink)]">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-center text-sm leading-5 text-[var(--ui-muted)]">
          {product.description || product.reason}
        </p>

        {visibleVariants.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {visibleVariants.map((variant) => (
              <span
                key={variant.id}
                className="h-7 w-7 shrink-0 rounded-full border-2 border-white shadow-sm ring-1 ring-[var(--ui-border)]"
                style={getVariantSwatchStyle(variant)}
                title={[variant.name, variant.texture].filter(Boolean).join(' - ') || 'Variant'}
              />
            ))}
            {extraVariantCount > 0 ? (
              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-[var(--ui-border)] px-2 text-[11px] font-semibold text-[var(--ui-muted)]">
                +{extraVariantCount}
              </span>
            ) : null}
          </div>
        ) : null}

        {product.matchReason ? (
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="font-mono text-[12px] text-[var(--ui-muted)]">Match: {product.matchReason}</div>
            <button onClick={() => setModalOpen(true)} className="text-xs font-semibold text-[var(--ui-accent)] underline">Details</button>
          </div>
        ) : null}
        
        <div className="mt-auto pt-5">
          <a
            href={product.externalLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full rounded-xl py-3 text-center text-xs font-extrabold uppercase tracking-wider text-white shadow-md ${
              ctaVariant === 'B'
                ? 'animate-pulse bg-[var(--ui-accent-hover)] shadow-[0_10px_30px_rgba(15,23,42,0.12)]'
                : 'bg-[var(--ui-accent)] shadow-[0_10px_30px_rgba(15,23,42,0.10)]'
            } hover:brightness-105 active:scale-[0.98] transition-all ${!product.externalLink ? 'pointer-events-none opacity-60' : ''}`}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <ShoppingBag className="h-4 w-4" />
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
                <ShoppingBag className="h-4 w-4" /> Buy now
              </Button>
            </a>
          </div>
        </div>
      </Modal>
    ) : null}
    </article>
  )
}


