import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function MakeupArHero() {
  const MotionLink = motion.create(Link)

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-white">
      {/* Background cover image */}
      <div 
        className="relative w-full bg-cover bg-center" 
        style={{ 
          backgroundImage: `url("https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/webp_Cover%20Banner%202732x640%20%281%29_3c76d326f0.jpg")`,
          height: 'clamp(280px, 23.4261vw, 500px)' 
        }}
      >
        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-slate-950/40" />

        {/* Banner content */}
        <div className="absolute inset-0 flex flex-col justify-center px-[8vw] z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl text-white"
          >
            Makeup AR
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-3 text-sm font-light text-white/90 max-w-xl leading-relaxed"
          >
            Seamless Virtual Makeup Experience to Elevate Your Business with Beauty Tech.
          </motion.p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <MotionLink
              to="/auth"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-md bg-rose-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-700"
            >
              Contact Sales
            </MotionLink>
            <MotionLink
              to="/virtual-makeup-try-on"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 transition hover:border-rose-400 hover:text-rose-600"
            >
              Learn More
            </MotionLink>
          </div>
        </div>
      </div>

      
    </section>
  )
}
