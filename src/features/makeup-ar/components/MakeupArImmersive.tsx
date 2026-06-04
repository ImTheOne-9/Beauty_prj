import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

export default function MakeupArImmersive() {
  const MotionLink = motion.create(Link)

  const items = [
    {
      title: 'Instant Makeover in Just One Second',
      desc: 'Deliver instant beauty transformations—fully compatible with web & app.',
    },
    {
      title: 'Real-Time AR Beauty Filters',
      desc: 'Flawlessly try-ons from every angle in real time for a seamless, photorealistic look from every side.',
    },
    {
      title: 'Affordable AR Tech',
      desc: 'Access powerful AR features with a flexible, cost-effective monthly subscription.',
    },
  ]

  return (
    <section className="bg-white py-16 text-slate-900">
      {/* Centered Heading */}
      <div className="mx-auto max-w-4xl px-4 text-center mb-16">
        <h2 className="font-brand text-2xl font-black tracking-tight sm:text-3xl lg:text-[2.25rem]">
          Immersive AI Makeup Experience with AI &amp; AR
        </h2>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-[1400px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left column - text & check list */}
        <div className="space-y-6">
          <h3 className="font-brand text-xl font-bold tracking-tight sm:text-2xl text-slate-900">
            AI &amp; AR Tech for Beauty Makeover
          </h3>
          
          <ul className="space-y-4">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5 rounded-full border border-brand-blush bg-brand-paper p-1 text-brand-accent">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm text-slate-600">
                  <strong className="text-slate-900 font-bold">{item.title} - </strong>
                  {item.desc}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-4">
            <MotionLink
              to="/plans"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-brand-accent hover:text-brand-accent transition group"
            >
              <span>Start with a Free Trial</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-accent transition group-hover:bg-brand-paper0 group-hover:text-white">
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </MotionLink>
          </div>
        </div>

        {/* Right column - Video/Gif preview */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-white aspect-[4/3] flex items-center justify-center">
          <img
            src="https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/Comp-1_2.gif"
            alt="AI AR Tech for Beauty Makeover"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
