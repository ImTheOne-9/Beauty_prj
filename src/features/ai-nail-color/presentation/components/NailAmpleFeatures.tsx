import { Check } from 'lucide-react'
import { Reveal, ArrowLink } from './nail-ui'

const features = [
  {
    body: <>Experiment with a wide array of different <strong>nail colors, textures and press-on nails</strong><sup className="ml-0.5 text-brand-accent">New</sup>.</>,
  },
  {
    body: <>Leverage virtual <strong>nail designs</strong> to experience various full nail looks</>,
  },
  {
    body: <>Set each nail individually, achieving a fully <strong>personalized virtual try-on experience</strong></>,
  },
  {
    body: <>Switch between styles, view looks on split-screen mode, and view <strong>before/after comparisons</strong></>,
  },
]

export default function NailAmpleFeatures() {
  return (
    <section
      className="py-16 lg:py-20 bg-cover bg-center"
      style={{
        backgroundImage: `url('https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_General_gradientbg_dt_e868a1b889.jpg')`,
      }}
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Video — trái */}
        <Reveal>
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="https://bcw-media.s3.ap-northeast-1.amazonaws.com/rich_features_f04c19b4ab.png"
              className="w-full object-cover"
            >
              <source src="" type="video/mp4" />
            </video>
          </div>
        </Reveal>

        {/* Text — phải */}
        <Reveal delay={0.1}>
          <h2
            className="font-black leading-tight text-gray-900"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
            }}
          >
            Ample Features to Help Shoppers Find Their Favorite Nail Products
          </h2>

          <p className="mt-4 text-sm text-gray-600">Allow your customers to:</p>

          <ul className="mt-3 space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex gap-3">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-accent" strokeWidth={3} />
                <span className="text-sm leading-relaxed text-gray-700">{f.body}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <ArrowLink>Try Web Demo</ArrowLink>
          </div>
        </Reveal>
      </div>
    </section>
  )
}