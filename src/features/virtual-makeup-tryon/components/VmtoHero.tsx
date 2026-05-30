import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const HERO_VIDEO =
  'https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_topbanner_video_dt_v2_bcc9afbf3b.mp4'

const brandLogos = [
  'ESTÉE LAUDER',
  'benefit',
  'M·A·C',
  'CLINIQUE',
  'Tarte',
  'AVON',
  'erborian',
  'DECORTÉ',
]

export default function VmtoHero() {
  const MotionLink = motion.create(Link)

  return (
    <section className="relative w-full overflow-hidden bg-rose-50">
      {/* Background video — height matches the video's native ~100:23.4 ratio so it isn't upscaled (which caused blur) */}
      <div className="relative w-full" style={{ height: 'clamp(300px, 23.4261vw, 600px)' }}>
        <video
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Copy overlay */}
        <div className="relative z-10 mx-auto flex h-full min-h-[inherit] max-w-[1400px] items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-xl [text-shadow:0_1px_12px_rgba(255,255,255,0.6)]">
            <motion.p
              className="text-xs font-bold uppercase tracking-[0.35em] text-rose-500"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              AI &amp; AR Beauty Tech
            </motion.p>

            <motion.h1
              className="mt-4 font-black leading-[1.05] tracking-[-0.03em] text-gray-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2.4rem, 4vw, 3.6rem)' }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Virtual Makeup Try On
            </motion.h1>

            <motion.p
              className="mt-5 max-w-md text-base leading-relaxed text-gray-700"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Our AI makeup encoders offer a virtually try-on with augmented reality
              technology. Increase customer engagement and boost sales for products by
              creating a makeup look with{' '}
              <span className="font-semibold text-rose-600">200% increase</span> in
              conversion rates.
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
                className="rounded-md bg-rose-600 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-700"
              >
                Try Web Demo
              </MotionLink>
              <MotionLink
                to="/scan"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-md border-2 border-gray-300 bg-white/70 px-7 py-3 text-sm font-bold uppercase tracking-wide text-gray-800 backdrop-blur-sm transition hover:border-rose-400 hover:text-rose-600"
              >
                Contact Sales
              </MotionLink>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Brand logo strip */}
      <div className="border-t border-gray-200/70 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:justify-between">
            {brandLogos.map((brand) => (
              <span
                key={brand}
                className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400 transition hover:text-gray-600"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
