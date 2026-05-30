import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react'

const awards = [
  {
    id: 'award-1',
    year: '2026',
    category: 'AI IMPACT AWARDS',
    title: 'Recognized AI Impact Award for Best Customer Experience in Beauty & Retail Category',
    org: 'From the 2026 AI Impact Awards, recognizing our transformative contributions to AI-powered customer experiences in the global retail and beauty sectors.',
    gradient: 'from-amber-50 to-yellow-100',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  {
    id: 'award-2',
    year: '2025',
    category: 'RETAIL TECH AWARDS',
    title: '2025 Global Tech Award for Retail Technology Innovation Journey',
    org: 'From the 2025 Global Retail Tech Awards, honoring breakthrough innovation in AI-powered fashion and beauty retail transformation.',
    gradient: 'from-blue-50 to-indigo-100',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    id: 'award-3',
    year: '2025',
    category: 'AI COMPANY OF THE YEAR',
    title: 'AI Company of the Year at 2025 BeautyTech Breakthrough Awards',
    org: 'Recognized at the 2025 BeautyTech Breakthrough Awards for leading innovations in AI-driven beauty personalization technology.',
    gradient: 'from-rose-50 to-pink-100',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-100',
  },
]

export default function AwardsSection() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c === 0 ? awards.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === awards.length - 1 ? 0 : c + 1))

  const award = awards[current]

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem]">
            Awards
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-base text-gray-600 sm:text-lg">
            As a leader in AI beauty technology, we are proud to be recognized worldwide.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative mt-12 flex items-center justify-center gap-4 lg:gap-6">
          {/* Prev button */}
          <button
            onClick={prev}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition hover:border-gray-400 hover:bg-gray-50 lg:h-14 lg:w-14"
            aria-label="Previous award"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 lg:h-7 lg:w-7" />
          </button>

          {/* Card Container */}
          <div className="flex-1 overflow-hidden" style={{ maxWidth: '800px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={award.id}
                className={`overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br ${award.gradient} shadow-lg`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <div className="relative p-8 lg:p-12">
                  {/* Top row: Year and Trophy Icon */}
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-gray-600">
                      {award.year}
                    </span>
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${award.iconBg} lg:h-16 lg:w-16`}>
                      <Trophy className={`h-7 w-7 ${award.iconColor} lg:h-8 lg:w-8`} />
                    </div>
                  </div>

                  {/* Category */}
                  <span className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                    {award.category}
                  </span>

                  {/* Title */}
                  <h3 className="mt-3 text-xl font-bold leading-tight text-gray-900 lg:text-2xl">
                    {award.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-4 text-base leading-relaxed text-gray-700">
                    {award.org}
                  </p>

                  {/* CTA Button */}
                  <button className="mt-6 rounded-md border-2 border-pink-600 bg-white px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-pink-600 transition hover:bg-pink-600 hover:text-white">
                    READ MORE
                  </button>

                  {/* Decorative circle */}
                  <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/40" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next button */}
          <button
            onClick={next}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition hover:border-gray-400 hover:bg-gray-50 lg:h-14 lg:w-14"
            aria-label="Next award"
          >
            <ChevronRight className="h-6 w-6 text-gray-600 lg:h-7 lg:w-7" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="mt-8 flex justify-center gap-2">
          {awards.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === current ? 'w-8 bg-pink-600' : 'w-2.5 bg-gray-300'
              }`}
              aria-label={`Go to award ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <button className="rounded-md bg-pink-600 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-pink-700">
            SEE ALL AWARDS
          </button>
        </div>
      </div>
    </section>
  )
}
