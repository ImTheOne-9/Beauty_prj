import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.3em] text-rose-500">{children}</p>
  )
}

export function PinkBtn({
  children,
  outline = false,
  className = '',
}: {
  children: React.ReactNode
  outline?: boolean
  className?: string
}) {
  return (
    <button
      className={`rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wide transition hover:scale-[1.02] active:scale-[0.98] ${
        outline
          ? 'border-2 border-rose-600 text-rose-600 hover:bg-rose-50'
          : 'bg-rose-600 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-700'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function ArrowLink({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-rose-600 hover:gap-3 transition-all">
      {children} <ArrowRight className="h-4 w-4" />
    </button>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
}: {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: string
  align?: 'left' | 'center'
}) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2
        className="mt-3 font-black leading-tight text-gray-900"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base leading-relaxed text-gray-600">{subtitle}</p>
      )}
    </div>
  )
}