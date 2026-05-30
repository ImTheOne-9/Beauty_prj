import { Reveal, SectionHeader, VMTO_IMAGES } from './vmto-ui'
import { X, Check } from 'lucide-react'

const general = {
  title: 'General AI Makeup',
  tone: 'neutral' as const,
  points: [
    { label: 'Real Skin Texture', body: 'Flat overlays that look painted-on and ignore the underlying skin texture.' },
    { label: 'Photo Only', body: 'Limited to interactive photos and rarely supports live, real-time video.' },
    { label: 'Generic Shades', body: 'One-size-fits-all colors that do not adapt to individual skin tones.' },
  ],
}

const ours = {
  title: 'Our AI Makeup',
  tone: 'brand' as const,
  points: [
    { label: 'True 3D Rendering', body: 'Realistic finishes that preserve skin texture, lighting, and depth.' },
    { label: 'Real-Time Interaction', body: 'Live video try-on with smooth tracking, even during head movement.' },
    { label: 'Built for Business', body: 'Drives engagement and bigger carts with seamless front-to-checkout flow.' },
    { label: 'The Power of AI + AR', body: 'The advanced AI accuracy makes our makeup virtually indistinguishable from the real thing.' },
  ],
}

function ComparisonColumn({
  data,
}: {
  data: typeof general | typeof ours
}) {
  const isBrand = data.tone === 'brand'
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border p-6 sm:p-8 ${
        isBrand
          ? 'border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg'
          : 'border-gray-200 bg-white'
      }`}
    >
      <h3
        className={`text-xl font-black ${isBrand ? 'text-rose-700' : 'text-gray-900'}`}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {data.title}
      </h3>
      <ul className="mt-6 space-y-5">
        {data.points.map((p) => (
          <li key={p.label} className="flex gap-3">
            <span
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                isBrand ? 'bg-rose-600' : 'bg-gray-200'
              }`}
            >
              {isBrand ? (
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              ) : (
                <X className="h-3 w-3 text-gray-500" strokeWidth={3} />
              )}
            </span>
            <span className="text-sm leading-relaxed text-gray-600">
              <span className="font-semibold text-gray-900">{p.label}</span> — {p.body}
            </span>
          </li>
        ))}
      </ul>
      {isBrand && (
        <button className="mt-7 w-fit rounded-md bg-rose-600 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow transition hover:bg-rose-700">
          Integrate AI AR Try-On
        </button>
      )}
    </div>
  )
}

export default function VmtoComparison() {
  return (
    <section className="bg-gray-50 py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader
            eyebrow="See The Difference"
            title="General AI Makeup vs. Our AI"
            subtitle="Most virtual makeup looks fake. Ours uses true 3D face modeling for a result indistinguishable from real cosmetics."
          />
        </Reveal>

        {/* Split-face image */}
        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl shadow-card">
            <div className="relative">
              <img
                src={VMTO_IMAGES.portraitAfter}
                alt="Comparison of general AI makeup versus our AI"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/70" />
              <span className="absolute bottom-3 left-3 rounded-full bg-gray-900/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                General AI
              </span>
              <span className="absolute bottom-3 right-3 rounded-full bg-rose-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                Our AI
              </span>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal delay={0.05}>
            <ComparisonColumn data={general} />
          </Reveal>
          <Reveal delay={0.15}>
            <ComparisonColumn data={ours} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
