import { Reveal, SectionHeader, OutlineButton, VMTO_IMAGES } from './vmto-ui'

const capabilities = [
  'Hyper-realistic 3D virtual makeover shopping experience',
  'After a few-tap, fast-turning look',
  'Live, real-time face tracking',
  'Ultra-precise landmark mapping',
  'Optimized for all ages of individual faces',
]

export default function VmtoFaceTech() {
  return (
    <section className="relative overflow-hidden bg-gray-950 py-16 lg:py-24">
      {/* Decorative network dots */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute left-10 top-10 h-2 w-2 rounded-full bg-rose-400" />
        <div className="absolute right-20 top-32 h-2 w-2 rounded-full bg-pink-400" />
        <div className="absolute bottom-24 left-1/3 h-2 w-2 rounded-full bg-rose-300" />
        <div className="absolute bottom-10 right-1/4 h-2 w-2 rounded-full bg-pink-300" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={VMTO_IMAGES.portraitAfter}
              alt="AI face analyzing technology"
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <SectionHeader
            align="left"
            eyebrow="Powered By"
            title={<span className="text-white">Powered by AI Face Analyzing Tech</span>}
          />
          <p className="mt-4 text-base leading-relaxed text-gray-400">
            Our makeup AI engine maps facial landmarks with sub-millimeter precision,
            enabling a true-to-life try-on experience that tracks every expression.
          </p>
          <ul className="mt-6 space-y-3">
            {capabilities.map((c) => (
              <li key={c} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500" />
                <span className="text-sm leading-relaxed text-gray-300">{c}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <OutlineButton className="border-rose-500 bg-transparent text-rose-400 hover:bg-rose-500 hover:text-white">
              Explore the Tech →
            </OutlineButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
