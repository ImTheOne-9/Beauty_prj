import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AgileHandHero() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  return (
    <section className="relative w-full overflow-hidden" style={{ height: 'calc(36.4964vw)', minHeight: '340px' }}>
      {/* Full-bleed video background */}
      <video
        ref={videoRef}
        src="https://d3ss46vukfdtpo.cloudfront.net/static/media/desktop-banner.3238b5e9.mp4"
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Subtle dark overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

      {/* Content — left-aligned like PF reference */}
      <div className="absolute inset-0 flex flex-col justify-center px-[8vw]">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-white font-black leading-[1.05] tracking-tight"
          style={{ fontSize: 'clamp(1.75rem, 4.5vw, 4rem)' }}
        >
          AgileHand™<br />
          <span className="bg-gradient-to-r from-brand-blush via-brand-accent to-brand-deep bg-clip-text text-transparent">
            Tracking Technology
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 text-white/80 font-light leading-snug max-w-[36ch]"
          style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.1rem)' }}
        >
          Ultra-precise 3D Hand Tracking Technology for<br />
          the Best in Class Virtual Try-on Experience
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex gap-3"
        >
          <Link
            to="/auth"
            className="rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-accent shadow-lg transition hover:bg-brand-paper hover:shadow-brand-blush/60"
          >
            Contact Us
          </Link>
          <Link
            to="/scan"
            className="rounded-full border border-white/50 bg-white/10 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Try Demo
          </Link>
        </motion.div>
      </div>
    </section>
  )
}