import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

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
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-rose-500">Recognition</p>
          <h2
            className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Awards
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            As a leader in AI beauty technology, we are proud to be recognized worldwide.
          </p>
        </motion.div>

        {/* Mobile: horizontal scroll carousel; Desktop: 3-col grid */}
        <div className="mt-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div
            className="flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
          >
            {awards.map((award, i) => (
              <motion.div
                key={award.id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br ${award.gradient} border border-white p-5 shadow-sm transition-shadow hover:shadow-lg flex-shrink-0 w-[78vw] sm:w-auto sm:p-6`}
                style={{ scrollSnapAlign: 'start' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                    {award.year}
                  </span>
                  <div className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${award.iconBg} sm:h-10 sm:w-10`}>
                    <Trophy className={`h-4 w-4 ${award.iconColor} sm:h-5 sm:w-5`} />
                  </div>
                </div>

                <span className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  {award.category}
                </span>

                <h3
                  className="mt-2 text-sm font-bold leading-snug text-gray-900 sm:text-base"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {award.title}
                </h3>

                <p className="mt-3 flex-1 text-xs leading-relaxed text-gray-500">{award.org}</p>

                <button className="mt-5 flex items-center gap-1 self-start text-xs font-bold uppercase tracking-wide text-rose-600 transition hover:gap-2">
                  Read More →
                </button>

                {/* Decorative */}
                <div className="pointer-events-none absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-white/50" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll dots on mobile */}
        <div className="mt-4 flex justify-center gap-1.5 sm:hidden">
          {awards.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-5 bg-rose-500' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>

        <div className="mt-7 text-center">
          <button className="rounded-full border-2 border-rose-500 px-7 py-2.5 text-sm font-bold uppercase tracking-wide text-rose-600 transition hover:bg-rose-600 hover:text-white">
            See All Awards
          </button>
        </div>
      </div>
    </section>
  )
}
