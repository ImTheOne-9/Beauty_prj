import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// ─── Brand + shared asset URLs (reused from existing landing components) ───────
export const BRAND = 'BEAUTY.AI'

export const VMTO_IMAGES = {
  portraitAfter:
    'https://bcm-media.beautycircle.com/pfweb/assets/images/2B_top_banner_after_makeup-210521.png',
  portraitBefore:
    'https://bcm-media.beautycircle.com/pfweb/assets/images/2B_top_banner_before-210521.png',
  storeBg:
    'https://d3ss46vukfdtpo.cloudfront.net/static/media/home_background@2x.5323f293.jpg',
  lookGrid:
    'https://bcw-media.s3.ap-northeast-1.amazonaws.com/multi_blush_8642169f9e.jpg',
  lookGrid2: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/Makeup_Product_Page_Revamp_77a9a11441.png',
  makeupBg: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s2_bg_2c96300b8d.jpg'
}

// ─── Scroll-reveal wrapper ─────────────────────────────────────────────────────
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Centered section header ───────────────────────────────────────────────────
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: 'center' | 'left'
}) {
  const isCenter = align === 'center'
  return (
    <div className={isCenter ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl text-left'}>
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-accent">{eyebrow}</p>
      )}
      <h2
        className="mt-2 font-black leading-tight text-brand-ink text-2xl sm:text-3xl lg:text-[2.5rem]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base leading-relaxed text-brand-muted ${
            isCenter ? 'mx-auto max-w-2xl' : ''
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ─── Buttons ───────────────────────────────────────────────────────────────────
export function PrimaryButton({
  children,
  className = '',
  type = 'button',
  onClick,
}: {
  children: ReactNode
  className?: string
  type?: 'button' | 'submit'
  onClick?: () => void
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`public-primary rounded-md px-7 py-3 text-sm font-bold uppercase tracking-wide shadow-lg shadow-brand-accent/25 transition ${className}`}
    >
      {children}
    </button>
  )
}

export function OutlineButton({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`public-secondary rounded-md px-7 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-brand-accent hover:text-white ${className}`}
    >
      {children}
    </button>
  )
}
