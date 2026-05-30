import { Reveal, SectionHeader, PrimaryButton, VMTO_IMAGES } from './vmto-ui'
import { Check } from 'lucide-react'

const reasons = [
  {
    title: 'Digital Makeover Solution',
    body: 'A lifelike experience powered by advanced makeup AI and beauty AR for an intuitive virtual try-on across every product category.',
  },
  {
    title: 'Highly Personalized',
    body: 'Customized for your skin tone and facial features with precise, individualized recommendations.',
  },
  {
    title: 'Seamless Omnichannel Integration',
    body: 'Access online and in-store platforms for an easy-to-it source so consumers connect customer experiences.',
  },
  {
    title: 'Flexible Pricing Options',
    body: 'Add or work scale to the latest tools and your makeup of products. Self-serve or fully managed plans.',
  },
  {
    title: 'AR makeup',
    body: 'Trusted by global beauty brands like Estée Lauder, Benefit Cosmetics, AVON, and more — built for measurable conversion lift.',
  },
]

export default function VmtoWhyChoose() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left: copy + checklist */}
        <Reveal>
          <SectionHeader
            align="left"
            eyebrow="Why Choose Us"
            title="Why Choose Our AI Makeup Solution"
          />
          <ul className="mt-8 space-y-5">
            {reasons.map((r) => (
              <li key={r.title} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
                  <Check className="h-3 w-3 text-rose-600" strokeWidth={3} />
                </span>
                <span className="text-sm leading-relaxed text-gray-600">
                  <span className="font-semibold text-gray-900">{r.title}</span> — {r.body}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <PrimaryButton>Partner With Us</PrimaryButton>
          </div>
        </Reveal>

        {/* Right: device mockup */}
        <Reveal delay={0.1}>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border-8 border-gray-900 bg-gray-900 shadow-2xl">
              <img
                src={VMTO_IMAGES.lookGrid}
                alt="AI makeup solution on multiple devices"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-rose-200/50 blur-2xl" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
