import { Reveal, SectionHeader } from './vmto-ui'
import { X, Check } from 'lucide-react'

const generalData = {
  title: 'General AI Makeup',
  subtitle: 'Best for: Creative Inspiration & Fantasy Styles',
  description: 'While they can generate fantasy looks from text prompts, they lack the precision required for retail.',
  video: '',
  poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/Untitled_design_21_79d0ca3362.png',
  tone: 'neutral' as const,
  points: [
    { label: 'No Real Products', body: 'The AI "hallucinates" colors.' },
    { label: 'Photo-Only', body: 'No live, interactive camera support.' },
    { label: 'Low Conversion', body: 'Without accurate product matching, fail to give customers the confidence to buy.' },
  ],
  cta: 'BOOK A QUICK CHAT',
}

const oursData = {
  title: '✅ Our Virtual Makeup Try On.',
  subtitle: 'Best for: Driving Sales & Reducing Returns',
  description: 'Makeup Try On goes beyond image generation by simulating real-world physics on live video.',
  video: '',
  poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/PERFECT_683de08dac.jpg',
  tone: 'brand' as const,
  points: [
    { label: 'Exact SKU Precision', body: 'Digital Makeup Try On matches exact color codes, textures (matte, gloss, shimmer), and lighting.' },
    { label: 'Real-Time Interaction', body: 'Move, smile, explore. Live Camera reacts instantly.' },
    { label: 'Built for Business', body: 'Drive longer engagement and bigger carts with true try-before-you-buy.' },
    { label: 'The Power of AI + AR', body: 'The advanced AI precisely analyzes face movement for stability, while AR renders complex textures (glitter, gloss, matte) that react to light in real-time.' },
  ],
  cta: 'TRY IT NOW',
}

function ComparisonCard({ data }: { data: typeof generalData | typeof oursData }) {
  const isBrand = data.tone === 'brand'

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_0_12px_rgba(0,0,0,0.1)]">
      {/* Video / Image */}
      <div className="relative w-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={data.poster}
          className="w-full rounded-t-2xl object-cover"
          style={{ aspectRatio: '4/3' }}
        >
          {data.video && <source src={data.video} type="video/mp4" />}
        </video>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <h3
          className={`text-lg font-black ${isBrand ? 'text-rose-600' : 'text-gray-900'}`}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {data.title}
        </h3>

        <p className={`mt-1 text-xs font-semibold ${isBrand ? 'text-rose-500' : 'text-gray-500'}`}>
          {data.subtitle}
        </p>

        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {data.description}
        </p>

        <ul className="mt-4 space-y-3">
          {data.points.map((p) => (
            <li key={p.label} className="flex gap-2.5">
              <span
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                  isBrand ? 'bg-rose-600' : 'bg-red-100'
                }`}
              >
                {isBrand ? (
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                ) : (
                  <X className="h-3 w-3 text-red-500" strokeWidth={3} />
                )}
              </span>
              <span className="text-sm leading-relaxed text-gray-600">
                <span className="font-semibold text-gray-900">{p.label}:</span> {p.body}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <button
            className={`rounded-md px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow transition ${
              isBrand
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-gray-800 hover:bg-gray-900'
            }`}
          >
            {data.cta}
          </button>
        </div>
      </div>
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
            title="General AI Makeup vs. Perfect Corp."
            subtitle="Most virtual makeup looks fake. Ours uses true 3D face modeling for a result indistinguishable from real cosmetics."
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-4xl lg:mx-auto">
          <Reveal delay={0.05}>
            <ComparisonCard data={generalData} />
          </Reveal>
          <Reveal delay={0.15}>
            <ComparisonCard data={oursData} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}