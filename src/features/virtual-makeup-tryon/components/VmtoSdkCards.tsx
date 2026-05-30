import { Reveal, SectionHeader } from './vmto-ui'
import { Globe, Smartphone, Code2, Sparkles } from 'lucide-react'

const offerings = [
  {
    id: 'web-sdk',
    icon: Globe,
    title: 'Web SDK',
    description:
      'Our virtual makeover simulator works with major browsers across all platforms, allowing easy integration into your brand sites.',
    cta: 'Learn More',
    accent: 'from-rose-50 to-pink-50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    id: 'mobile-sdk',
    icon: Smartphone,
    title: 'Mobile SDK',
    description:
      'Create your own makeup virtual try-on mobile app with the most advanced AI makeup simulator technology.',
    cta: 'Learn More',
    accent: 'from-pink-50 to-purple-50',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
  {
    id: 'api',
    icon: Code2,
    title: 'Makeup Try-On API',
    description:
      'Offer hyper-realistic makeup try-on across any platform, giving customers an interactive way to discover their full makeup collection.',
    cta: 'Request a Demo',
    accent: 'from-amber-50 to-orange-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 'service',
    icon: Sparkles,
    title: 'Makeup Try-On Service',
    description:
      "Self-serve SaaS for adding Virtual Try-On buttons to your site. Supports Shopify, WooCommerce, Wix, and Squarespace.",
    cta: 'Start Free Trial',
    accent: 'from-indigo-50 to-blue-50',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
]

export default function VmtoSdkCards() {
  return (
    <section className="bg-gray-50 py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader
            eyebrow="Integrate Anywhere"
            title="Virtual Makeover Try-On Anywhere, Anytime"
            subtitle="Deploy our virtual makeup try-on across web, mobile, and API — built for engineers, designed for beauty brands."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {offerings.map((o, i) => {
            const Icon = o.icon
            return (
              <Reveal key={o.id} delay={i * 0.08}>
                <div
                  className={`group flex h-full flex-col rounded-2xl bg-gradient-to-br ${o.accent} p-6 shadow-sm transition hover:shadow-lg`}
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${o.iconBg}`}>
                    <Icon className={`h-6 w-6 ${o.iconColor}`} />
                  </div>
                  <h3
                    className="mt-4 text-lg font-bold text-gray-900"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {o.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
                    {o.description}
                  </p>
                  <button className="mt-5 inline-flex w-fit items-center gap-1 text-xs font-bold uppercase tracking-wide text-rose-600 transition group-hover:gap-2">
                    {o.cta} →
                  </button>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
