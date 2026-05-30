import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const HERO_VIDEO =
  'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/b2bhome_topbanner_skin_dt_d9f38d389a.mp4'

export default function HeroSection() {
  const MotionLink = motion.create(Link)

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '100svh', minHeight: 600 }}>
      {/* ── Background video fills full viewport including navbar area ── */}
      <video
        src={HERO_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: 'center center' }}
      />

      {/* ── Gradient scrim — left-heavy so text is readable ─────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.05) 100%)',
        }}
      />
      {/* Bottom fade so stats bar reads cleanly */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            'linear-gradient(to top, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)',
        }}
      />

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex h-full flex-col justify-center">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {/* Left panel — max half-width on desktop */}
          <div className="max-w-xl pt-16">
            <motion.p
              className="text-xs font-bold uppercase tracking-[0.35em] text-rose-500"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              AI-Powered Beauty Technology
            </motion.p>

            <motion.h1
              className="mt-4 font-display text-4xl font-black leading-[1.05] tracking-[-0.03em] text-gray-900 sm:text-5xl xl:text-6xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              AI Powerhouse for
              <span className="block text-rose-600"> Beauty, Skincare,</span>
              and Fashion Tech
            </motion.h1>

            <motion.p
              className="mt-5 max-w-md text-base leading-relaxed text-gray-700"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Boost your sales with AI and AR SaaS solutions — Providing custom services for brands
              or self-service skin analysis platform for clinics.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <MotionLink
                to="/scan"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full bg-rose-600 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-700"
              >
                Discover AI Skin Analysis
              </MotionLink>
              <MotionLink
                to="/scan"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full border-2 border-gray-400 bg-white/70 px-7 py-3 text-sm font-bold uppercase tracking-wide text-gray-800 backdrop-blur-sm transition hover:border-rose-400 hover:text-rose-600"
              >
                Try Web Demo
              </MotionLink>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
            >
              {['HIPAA', 'BSI', 'ANAB'].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-gray-300 bg-white/80 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-gray-500 shadow-sm backdrop-blur-sm"
                >
                  {badge}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Stats bar — bottom of hero */}
          <motion.div
            className="absolute bottom-8 left-0 right-0 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            <div className="grid grid-cols-2 gap-3 border-t border-white/60 pt-6 sm:grid-cols-4">
              {[
                { value: '500+', label: 'Brand Partners' },
                { value: '2.4M+', label: 'Monthly Users' },
                { value: '98.7%', label: 'AI Accuracy' },
                { value: '50+', label: 'Countries' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p
                    className="font-display text-2xl font-black text-rose-600 sm:text-3xl"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {value}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-gray-600">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
