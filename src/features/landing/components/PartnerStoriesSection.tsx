import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const stories = [
  {
    id: 'mac',
    brand: 'M·A·C',
    logo: 'M·A·C',
    stat: '200%',
    statLabel: 'Boost in customer engagement',
    quote:
      'Perfect Corp\'s AI Virtual Try-On has transformed how our customers discover and purchase products. The engagement metrics are extraordinary.',
    author: 'Sarah Chen, Digital Experience Director',
    accentColor: 'text-gray-900',
    bgColor: 'bg-white',
  },
  {
    id: 'loreal',
    brand: 'L\'ORÉAL',
    logo: "L'ORÉAL",
    stat: '14×',
    statLabel: 'Higher conversion rate vs. traditional',
    quote:
      'Integrating AI beauty technology into our digital ecosystem has elevated the customer journey to a whole new level of personalization.',
    author: 'Marie Dupont, VP of Digital Innovation',
    accentColor: 'text-gray-900',
    bgColor: 'bg-white',
  },
  {
    id: 'estee',
    brand: 'ESTÉE LAUDER',
    logo: 'ESTÉE LAUDER',
    stat: '3.5×',
    statLabel: 'Revenue increase with AI try-on',
    quote:
      'Our customers are spending more time exploring products and feeling more confident in their purchase decisions than ever before.',
    author: 'Amanda Park, Chief Digital Officer',
    accentColor: 'text-gray-900',
    bgColor: 'bg-white',
  },
]

export default function PartnerStoriesSection() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c === 0 ? stories.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === stories.length - 1 ? 0 : c + 1))

  const story = stories[current]

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-rose-500">Case Studies</p>
          <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            Partner Success Stories
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            See how leading beauty brands achieve extraordinary results with our AI platform.
          </p>
        </motion.div>

        <div className="relative mt-10 flex items-center gap-4">
          {/* Prev button */}
          <button
            onClick={prev}
            className="flex-shrink-0 rounded-full border border-gray-200 bg-white p-2.5 shadow-sm transition hover:border-rose-300 hover:shadow-md"
            aria-label="Previous story"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          {/* Main card */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={story.id}
                className="grid gap-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg sm:grid-cols-[1fr,auto,1fr]"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {/* Left: brand logo side panel */}
                <div className="flex flex-col items-center justify-center bg-gray-900 p-8">
                  <span className="font-display text-3xl font-black tracking-wider text-white">
                    {story.logo}
                  </span>
                  <div className="mt-4 h-px w-12 bg-rose-500" />
                  <p className="mt-3 text-center text-xs text-gray-400">Partner Since 2021</p>
                </div>

                {/* Center divider */}
                <div className="hidden w-px bg-gray-100 sm:block" />

                {/* Right: stats + quote */}
                <div className="flex flex-col justify-center p-8">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-6xl font-black text-rose-600">{story.stat}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-gray-700">{story.statLabel}</p>

                  <blockquote className="mt-5 border-l-2 border-rose-200 pl-4 text-sm italic leading-relaxed text-gray-600">
                    "{story.quote}"
                  </blockquote>
                  <p className="mt-3 text-xs font-semibold text-gray-500">— {story.author}</p>

                  <button className="mt-6 self-start rounded-full bg-rose-600 px-5 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-rose-700">
                    Read Story →
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next button */}
          <button
            onClick={next}
            className="flex-shrink-0 rounded-full border border-gray-200 bg-white p-2.5 shadow-sm transition hover:border-rose-300 hover:shadow-md"
            aria-label="Next story"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Dots */}
        <div className="mt-5 flex justify-center gap-2">
          {stories.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-6 bg-rose-500' : 'w-2 bg-gray-300'
              }`}
              aria-label={`Go to story ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <button className="rounded-full border-2 border-rose-500 px-8 py-2.5 text-sm font-bold uppercase tracking-wide text-rose-600 transition hover:bg-rose-600 hover:text-white">
            See All Stories
          </button>
        </div>
      </div>
    </section>
  )
}
