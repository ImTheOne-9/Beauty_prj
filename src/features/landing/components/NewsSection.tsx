import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

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
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-rose-500">Latest Updates</p>
          <h2
            className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            News
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Stay up to date with the latest developments in AI beauty technology.
          </p>
        </motion.div>

        {/* Mobile: horizontal scroll; Desktop: 3-col grid */}
        <div className="mt-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* Scroll container */}
          <div className="flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
            {newsItems.map((item, i) => (
              <motion.article
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg flex-shrink-0 w-[78vw] sm:w-auto"
                style={{ scrollSnapAlign: 'start' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                {/* Image */}
                <div
                  className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${item.imageGradient} overflow-hidden sm:h-48`}
                >
                  <span className="text-5xl sm:text-6xl">{item.imgEmoji}</span>
                  <div className="pointer-events-none absolute inset-0 bg-black/10 opacity-0 transition group-hover:opacity-100" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded-full ${item.badgeColor} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white`}
                    >
                      {item.badge}
                    </span>
                    <span className="text-[11px] text-gray-400">{item.date}</span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold leading-snug text-gray-900 group-hover:text-rose-600 transition-colors sm:text-base"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {item.title}
                  </h3>

                  <p className="mt-2 flex-1 text-xs leading-relaxed text-gray-500">{item.excerpt}</p>

                  <button className="mt-4 flex items-center gap-1 self-start text-xs font-bold uppercase tracking-wide text-rose-600 transition hover:gap-2">
                    Read More <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Scroll dots on mobile */}
        <div className="mt-4 flex justify-center gap-1.5 sm:hidden">
          {newsItems.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-5 bg-rose-500' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>

        <div className="mt-7 text-center">
          <button className="rounded-full bg-rose-600 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-rose-700">
            See More News
          </button>
        </div>
      </div>
    </section>
  )
}
