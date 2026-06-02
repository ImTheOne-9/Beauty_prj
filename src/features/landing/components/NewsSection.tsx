import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const newsItems = [
  {
    id: 'news-1',
    badge: 'PRODUCT',
    badgeColor: 'bg-rose-600',
    date: 'May 10, 2026',
    title: 'Perfect Corp. Powers AI Virtual Makeup Try-On at Flagship Location',
    excerpt:
      'Revolutionizing in-store beauty experiences with real-time AI shade matching and personalized skin analysis.',
    imageGradient: 'from-rose-200 to-pink-300',
    imgEmoji: '💄',
  },
  {
    id: 'news-2',
    badge: 'REPORT',
    badgeColor: 'bg-blue-600',
    date: 'May 20, 2026',
    title: 'Perfect Corp. Releases "Hidden Transformative Dimensions" AI Impact Report',
    excerpt:
      'New data reveals consumer preferences for AI-powered beauty, natural results, and personalized experiences.',
    imageGradient: 'from-blue-200 to-indigo-300',
    imgEmoji: '📊',
  },
  {
    id: 'news-3',
    badge: 'PARTNER',
    badgeColor: 'bg-emerald-600',
    date: 'May 16, 2026',
    title: 'Perfect Corp. Integrates Tiered AI Platform with YouTube AR Partners',
    excerpt:
      'Expanding our AI ecosystem to enable beauty creators to offer virtual try-on experiences directly in videos.',
    imageGradient: 'from-emerald-200 to-teal-300',
    imgEmoji: '🤝',
  },
]

export default function NewsSection() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c === 0 ? newsItems.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === newsItems.length - 1 ? 0 : c + 1))

  const news = newsItems[current]

  return (
    <section className="bg-gray-50 py-16 lg:py-20">
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
            News
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-base text-gray-600 sm:text-lg">
            Stay up to date with the latest developments in AI beauty technology.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative mt-12 flex items-center justify-center gap-4 lg:gap-6">
          {/* Prev button */}
          <button
            onClick={prev}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition hover:border-gray-400 hover:bg-gray-50 lg:h-14 lg:w-14"
            aria-label="Previous news"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 lg:h-7 lg:w-7" />
          </button>

          {/* Card Container */}
          <div className="flex-1 overflow-hidden" style={{ maxWidth: '900px' }}>
            <AnimatePresence mode="wait">
              <motion.article
                key={news.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                {/* Grid layout: image | content */}
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Left: Image */}
                  <div
                    className={`relative flex h-64 items-center justify-center bg-gradient-to-br ${news.imageGradient} md:h-auto`}
                  >
                    <span className="text-7xl lg:text-8xl">{news.imgEmoji}</span>
                  </div>

                  {/* Right: Content */}
                  <div className="flex flex-col justify-center p-8 lg:p-10">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block rounded-full ${news.badgeColor} px-3 py-1 text-xs font-bold uppercase tracking-wide text-white`}
                      >
                        {news.badge}
                      </span>
                      <span className="text-sm text-gray-500">{news.date}</span>
                    </div>

                    <h3 className="mt-4 text-xl font-bold leading-tight text-gray-900 lg:text-2xl">
                      {news.title}
                    </h3>

                    <p className="mt-4 text-base leading-relaxed text-gray-600">
                      {news.excerpt}
                    </p>

                    <button className="mt-6 self-start rounded-md border-2 border-pink-600 bg-white px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-pink-600 transition hover:bg-pink-600 hover:text-white">
                      READ MORE
                    </button>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* Next button */}
          <button
            onClick={next}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition hover:border-gray-400 hover:bg-gray-50 lg:h-14 lg:w-14"
            aria-label="Next news"
          >
            <ChevronRight className="h-6 w-6 text-gray-600 lg:h-7 lg:w-7" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="mt-8 flex justify-center gap-2">
          {newsItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === current ? 'w-8 bg-pink-600' : 'w-2.5 bg-gray-300'
              }`}
              aria-label={`Go to news ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <button className="rounded-md bg-pink-600 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-pink-700">
            SEE MORE NEWS
          </button>
        </div>
      </div>
    </section>
  )
}
