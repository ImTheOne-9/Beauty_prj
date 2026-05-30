import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VMTO_IMAGES } from './vmto-ui'

type MakeupCategory = {
  id: string
  label: string
  description: string
}

const categories: MakeupCategory[] = [
  {
    id: 'eye-color',
    label: 'Eye Color',
    description:
      'Try colored contact lenses virtually with natural-looking iris rendering that adapts to lighting and eye movement in real time.',
  },
  {
    id: 'lip-shape',
    label: 'Lip Shape',
    description:
      'Reshape and recolor lips with precise lip-liner mapping, from glossy to matte finishes across hundreds of shades.',
  },
  {
    id: 'eyeliner',
    label: 'Eyeliner',
    description:
      'Apply winged, tightline, or classic liner styles that follow the exact contour of the eye for a flawless result.',
  },
  {
    id: 'lashes',
    label: 'False Eyelashes',
    description:
      'Preview natural, volume, or dramatic lash sets that move and blink realistically with the user.',
  },
  {
    id: 'foundation',
    label: 'Foundation',
    description:
      'Match foundation to skin tone with AI shade detection and see coverage applied evenly across the face.',
  },
  {
    id: 'contour',
    label: 'Contour',
    description:
      'Virtually try our makeup looks to instantly add contour to slim and shape your face for a sculpted, defined look. Support contour patterns.',
  },
]

export default function VmtoHowItWorks() {
  const [active, setActive] = useState(5) // Contour, matching the reference

  return (
    <section className="relative overflow-hidden bg-gray-900 py-16 lg:py-24">
      {/* Background store image, dimmed */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${VMTO_IMAGES.storeBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            className="font-black tracking-tight text-white text-2xl sm:text-3xl lg:text-[2.5rem]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            How Does AI Virtual Makeup Try On Work?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-300">
            The ultimate AI and AR-powered virtual makeup try-on experience is like
            looking into a virtual mirror. Give the customers a virtual makeover offline.
          </p>
        </div>

        {/* Interactive card */}
        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Category tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1 border-b border-gray-100 bg-gray-50 px-3 py-3">
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => setActive(i)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                  active === i
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-gray-500 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Body: portrait + description */}
          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div className="relative overflow-hidden rounded-xl bg-rose-50">
              <img
                src={VMTO_IMAGES.portraitAfter}
                alt="Virtual makeup preview"
                className="h-72 w-full object-cover object-top sm:h-80"
              />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-600 shadow">
                After
              </span>
            </div>

            <div className="flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={categories[active].id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3
                    className="text-2xl font-black text-gray-900"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {categories[active].label}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {categories[active].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <button className="mt-6 w-fit rounded-md bg-rose-600 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow transition hover:bg-rose-700">
                Try It Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
