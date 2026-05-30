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
      "Perfect Corp's AI Virtual Try-On has transformed how our customers discover and purchase products. The engagement metrics are extraordinary.",
    author: 'Sarah Chen, Digital Experience Director',
  },
  {
    id: 'loreal',
    brand: "L'ORÉAL",
    logo: "L'ORÉAL",
    stat: '14×',
    statLabel: 'Higher conversion rate vs. traditional',
    quote:
      'Integrating AI beauty technology into our digital ecosystem has elevated the customer journey to a whole new level of personalization.',
    author: 'Marie Dupont, VP of Digital Innovation',
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
  },
]

export default function PartnerStoriesSection() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c === 0 ? stories.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === stories.length - 1 ? 0 : c + 1))

  const story = stories[current]

  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-rose-500">Case Studies</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Partner Success Stories
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            See how leading beauty brands achieve extraordinary results with our AI platform.
          </p>
        </motion.div>

        <div className="relative mt-8 flex items-center gap-2 sm:gap-4">
          {/* Prev button */}
          <button
            onClick={prev}
            className="flex-shrink-0 rounded-full border border-gray-200 bg-white p-2 shadow-sm transition hover:border-rose-300 hover:shadow-md sm:p-2.5"
            aria-label="Previous story"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
          </button>

          {/* Card */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={story.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {/* Mobile: stacked layout */}
                <div className="flex flex-col sm:grid sm:grid-cols-[160px,1px,1fr]">
                  {/* Brand panel */}
                  <div className="flex items-center justify-center gap-4 bg-gray-900 px-6 py-6 sm:flex-col sm:gap-0 sm:py-8">
                    <span className="font-black tracking-wider text-white sm:text-3xl text-xl">
                      {story.logo}
                    </span>
                    <div className="hidden sm:block mt-4 h-px w-10 bg-rose-500" />
                    <p className="hidden sm:block mt-3 text-center text-xs text-gray-400">Partner Since 2021</p>
                  </div>

                  {/* Divider (desktop only) */}
                  <div className="hidden w-px bg-gray-100 sm:block" />

                  {/* Stats + quote */}
                  <div className="flex flex-col justify-center p-5 sm:p-8">
                    <div className="flex items-baseline gap-3">
                      <span
                        className="font-black text-rose-600 text-4xl sm:text-6xl"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {story.stat}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-gray-700">{story.statLabel}</p>

                    <blockquote className="mt-4 border-l-2 border-rose-200 pl-4 text-sm italic leading-relaxed text-gray-600">
                      &ldquo;{story.quote}&rdquo;
                    </blockquote>
                    <p className="mt-3 text-xs font-semibold text-gray-500">— {story.author}</p>

                    <button className="mt-5 self-start rounded-full bg-rose-600 px-5 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-rose-700">
                      Read Story →
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next button */}
          <button
            onClick={next}
            className="flex-shrink-0 rounded-full border border-gray-200 bg-white p-2 shadow-sm transition hover:border-rose-300 hover:shadow-md sm:p-2.5"
            aria-label="Next story"
          >
            <ChevronRight className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
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
        <div className="mt-7 text-center">
          <button className="rounded-full border-2 border-rose-500 px-7 py-2.5 text-sm font-bold uppercase tracking-wide text-rose-600 transition hover:bg-rose-600 hover:text-white">
            See All Stories
          </button>
        </div>
      </div>
    </section>
  )
}
