import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const HERO_VIDEO =
  'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/b2bhome_topbanner_skin_dt_d9f38d389a.mp4'
const HERO_VIDEO_MOBILE = 
  'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/b2bhome_topbanner_skin_mb_d682d5689e.mp4'
export default function HeroSection() {
  const MotionLink = motion.create(Link)

  return (
    <>
      {/* ── MOBILE HERO (< lg): video top, text below ──────────────────── */}
      <section className="lg:hidden w-full bg-white">
        {/* Video block — portrait crop on mobile */}
        <div className="relative w-full overflow-hidden" style={{ height: '300vw', minHeight: 220, maxHeight: 700 }}>
          <video
            src={HERO_VIDEO_MOBILE}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: 'center 20%' }}
          />
          {/* Bottom fade into white */}
          <div
            className="absolute inset-x-0 bottom-0 h-16"
            style={{ background: 'linear-gradient(to top, #ffffff, transparent)' }}
          />
        </div>

        {/* Text content below video */}
        <div className="px-5 pb-10 pt-4 bg-white">
          <motion.p
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            AI-Powered Beauty Technology
          </motion.p>

          <motion.h1
            className="mt-3 font-black leading-tight tracking-tight text-gray-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.6rem, 5.5vw, 2.2rem)' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            AI Powerhouse for
            <span className="block text-rose-600"> Beauty, Skincare,</span>
            and Fashion Tech
          </motion.h1>

          <motion.p
            className="mt-3 text-sm leading-relaxed text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Boost your sales with AI and AR SaaS solutions — custom services for brands or
            self-service skin analysis for clinics.
          </motion.p>

          <motion.div
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <MotionLink
              to="/scan"
              whileTap={{ scale: 0.97 }}
              className="flex-1 rounded-full bg-rose-600 px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-rose-500/25 transition hover:bg-rose-700"
            >
              Discover AI Skin Analysis
            </MotionLink>
            <MotionLink
              to="/scan"
              whileTap={{ scale: 0.97 }}
              className="flex-1 rounded-full border-2 border-gray-300 bg-white px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-gray-700 transition hover:border-rose-400 hover:text-rose-600"
            >
              Try Virtually
            </MotionLink>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-5 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {['HIPAA', 'BSI', 'ANAB'].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[9px] font-bold tracking-[0.18em] text-gray-500"
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DESKTOP HERO (≥ lg): full-viewport video overlay ────────────── */}
      <section
        className="hidden lg:block relative w-full overflow-hidden"
        style={{ height: '100svh', minHeight: 640 }}
      >
        {/* Background video */}
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

        {/* Gradient scrim — left-heavy for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.60) 42%, rgba(255,255,255,0.04) 100%)',
          }}
        />
        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.65) 0%, transparent 100%)' }}
        />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-center">
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
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
                className="mt-4 font-black leading-[1.05] tracking-[-0.03em] text-gray-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2.4rem, 3.8vw, 4rem)' }}
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

            {/* Stats bar */}
            <motion.div
              className="absolute bottom-8 left-0 right-0 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
            >
              <div className="grid grid-cols-4 gap-3 border-t border-white/50 pt-6">
                {[
                  { value: '500+', label: 'Brand Partners' },
                  { value: '2.4M+', label: 'Monthly Users' },
                  { value: '98.7%', label: 'AI Accuracy' },
                  { value: '50+', label: 'Countries' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p
                      className="text-3xl font-black text-rose-600"
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
    </>
  )
}
