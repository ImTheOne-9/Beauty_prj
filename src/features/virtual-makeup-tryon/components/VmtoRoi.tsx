import { Reveal, SectionHeader } from './vmto-ui'

const stats = [
  { brand: 'ESTÉE LAUDER', value: '2.5×', label: 'increase in conversion' },
  { brand: 'AVON', value: '320%', label: 'increase in engagement' },
  { brand: "e.l.f.", value: '200%', label: 'increase in time on site' },
]

export default function VmtoRoi() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader
            eyebrow="Proven Results"
            title="Our AI Makeup Solution Has Been Proven to Deliver Immediate ROI"
            subtitle="Leading beauty and cosmetic brands see measurable lift after adding our virtual try-on."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.brand} delay={i * 0.1}>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center shadow-sm">
                <p
                  className="text-5xl font-black text-rose-600 lg:text-6xl"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {s.value}
                </p>
                <p className="mt-3 text-sm font-semibold text-gray-700">{s.label}</p>
                <p className="mt-4 border-t border-gray-200 pt-4 text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
                  {s.brand}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 text-center">
            <button className="rounded-md bg-rose-600 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-rose-700">
              Contact Us to Learn More
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
