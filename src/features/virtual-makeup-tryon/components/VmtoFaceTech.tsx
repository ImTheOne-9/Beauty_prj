import { Reveal, SectionHeader, OutlineButton } from './vmto-ui'

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
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s3_bg_dt_0833bb1744.jpg')` }}
      />

      <div className="relative z-10 mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s3_poster_b09cdaeffa.jpg"
              className="h-full w-full object-cover"
            >
              <source src="https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s3_video_205a6740a9.mp4" type="video/mp4" />
            </video>
          </div>

        </Reveal>

        <Reveal delay={0.1}>
          <SectionHeader
            align="left"
            eyebrow="Powered By"
            title={<span className="text-gray-900">AI Face Analyzing Tech</span>}
          />
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Our makeup AI engine maps facial landmarks with sub-millimeter precision,
            enabling a true-to-life try-on experience that tracks every expression.
          </p>
          <ul className="mt-6 space-y-3">
            {capabilities.map((c) => (
              <li key={c} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-accent" />
                <span className="text-sm leading-relaxed text-gray-700">{c}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <OutlineButton className="border-brand-accent bg-transparent text-brand-accent hover:bg-brand-paper0 hover:text-white">
              Explore the Tech →
            </OutlineButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
