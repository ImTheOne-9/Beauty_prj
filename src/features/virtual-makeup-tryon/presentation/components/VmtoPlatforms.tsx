import { Reveal, SectionHeader } from './vmto-ui'

const platforms = [
  'YouCam for Web (Web SDK)',
  'Mobile SDK (iOS & Android)',
  'AR Virtual Makeup for Google',
  'AR Virtual Makeup for Snapchat',
  'YouCam Makeup App Listing',
  'AR Virtual Makeup for YouTube',
  'Taobao Mini-program',
  'Douyin Mini-program',
  'WeChat Mini-program',
  'Online Consultation',
]

export default function VmtoPlatforms() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader
            eyebrow="Available Everywhere"
            title="AR Virtual Makeup Try On is Available In"
            subtitle="Deploy a consistent makeup try-on experience across the platforms your customers already use."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {platforms.map((p, i) => (
            <Reveal key={p} delay={(i % 4) * 0.05}>
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 transition hover:border-brand-blush hover:bg-brand-paper">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-blush text-sm font-bold text-brand-accent">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-gray-800">{p}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
