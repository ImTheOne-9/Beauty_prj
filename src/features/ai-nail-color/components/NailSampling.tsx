import { Check } from 'lucide-react'
import { Reveal, SectionHeading, ArrowLink } from './nail-ui'

const samplingFeatures = [
  {
    label: 'Nail Polish Shades',
    body: 'Unlimited selection of colors and shades to mix and match for real nails or acrylic nails.',
  },
  {
    label: 'Nail Polish Textures',
    body: 'A wide range of realistic nail polish texture effects, including cream, jelly, sheer, matte, metallic, pearl, shimmer, and textured for real nails or acrylic nails.',
    badge: 'NEW',
  },
  {
    label: 'Press-on Nails',
    body: 'A wide variety of styles of press-on nails effortlessly.',
    badge: 'NEW',
  },
  {
    label: 'Nail Art Looks',
    body: 'Fully-compiled looks for your customers to try out, including natural looks, french tips, gel looks and more.',
  },
]

export default function NailSampling() {
  return (
    <section className="bg-[#fce4ec] py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Product Sampling"
            title={
              <>
                Efficient Nail Polish and Design Sampling, Including Press-On Nails
                <sup className="ml-1 text-xs text-rose-500">NEW</sup>
              </>
            }
            subtitle="Highly customizable live camera engine that accurately showcases your nail art and nail polish products virtually."
          />

          <ul className="mt-5 space-y-4">
            {samplingFeatures.map((f) => (
              <li key={f.label} className="flex gap-3">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" strokeWidth={3} />
                <span className="text-sm leading-relaxed text-gray-700">
                  <strong>{f.label}</strong>
                  {f.badge && (
                    <sup className="ml-1 rounded bg-rose-500 px-1 py-0.5 text-[8px] font-black text-white">
                      {f.badge}
                    </sup>
                  )}
                  {': '}
                  {f.body}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <ArrowLink>Try Web Demo</ArrowLink>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <img
              src="https://bcw-media.s3.ap-northeast-1.amazonaws.com/nails_s2_poster_dt_79341c7776.png"
              alt="Nail polish sampling"
              className="w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}