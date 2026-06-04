import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2">
      <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-accent">Beauty - AI - Lux</p>
        <h1 className="mt-4 max-w-xl font-brand text-5xl font-extrabold leading-[0.96] text-brand-ink lg:text-7xl">
          The Future of <span className="text-brand-accent">Radiance</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-muted">
          Experience cinematic AI skincare profiling and curated luxury routines tailored to your skin signature.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          {[
            { to: '/scan', label: 'Start AI Scan', solid: true },
            { to: '/products', label: 'Explore Features', solid: false },
          ].map((item) => {
            const MotionLink = motion(Link)

            return (
              <MotionLink
                key={item.label}
                to={item.to}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={
                  item.solid
                    ? 'rounded-full bg-brand-accent px-6 py-3 font-semibold text-white shadow-lg shadow-brand-accent/20 transition hover:brightness-110'
                    : 'rounded-full border border-brand-blush bg-brand-surface/70 px-6 py-3 font-semibold text-brand-deep'
                }
              >
                {item.label}
              </MotionLink>
            )
          })}
        </div>

        <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-xs text-brand-muted">
          {[
            ['Skin Score', '86'],
            ['Hydration', 'High'],
            ['Match', '98%'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/60 bg-brand-surface/70 p-3 shadow-sm">
              <p className="uppercase tracking-[0.2em] text-brand-accent">{label}</p>
              <p className="mt-2 text-2xl font-black text-brand-ink">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-brand-paper shadow-[0_30px_80px_rgba(190,67,93,0.14)] backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_55%)]" />
        <img
          src="/luxury-demo.svg"
          alt="Luxury beauty product"
          className="h-[30rem] w-full object-cover opacity-92"
        />
        <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-xl backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-brand-accent">Featured Product</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-brand text-2xl font-semibold text-brand-ink">Rose Quartz Serum</h3>
              <p className="mt-1 text-sm text-brand-muted">Hydrate, glow, and smooth with a luminous finish.</p>
            </div>
            <p className="text-right text-sm font-semibold text-brand-deep">$68</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
