import { motion } from 'framer-motion'
import { Building2, Monitor } from 'lucide-react'
import { Link } from 'react-router-dom'

const solutions = [
  {
    id: 'enterprise',
    icon: Building2,
    title: 'For Enterprise',
    subtitle: 'Complete suite of beauty tech services and in-store tools.',
    bg: 'from-rose-50 to-pink-50',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-100',
  },
  {
    id: 'online',
    icon: Monitor,
    title: 'Online Service',
    subtitle: 'Subscription-based software & platform, hassle-free.',
    bg: 'from-orange-50 to-amber-50',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
  },
]

export default function SolutionsSection() {
  return (
    <section className="bg-white py-12 lg:py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-black tracking-tight text-gray-900 text-xl sm:text-2xl lg:text-3xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Beauty and Fashion Tech Solutions for Brands of All Sizes
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500">
            From global enterprise to boutique brands — our AI platform scales with you.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {solutions.map((sol, i) => {
            const Icon = sol.icon
            return (
              <motion.div
                key={sol.id}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${sol.bg} p-5 shadow-sm transition-shadow hover:shadow-lg sm:p-7`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${sol.iconBg} sm:h-12 sm:w-12`}>
                  <Icon className={`h-5 w-5 ${sol.iconColor} sm:h-6 sm:w-6`} />
                </div>
                <h3
                  className="mt-3 text-lg font-bold text-gray-900 sm:mt-4 sm:text-xl"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {sol.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{sol.subtitle}</p>
                <Link
                  to="/scan"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-rose-600 transition hover:gap-2"
                >
                  Learn more →
                </Link>
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/40" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
