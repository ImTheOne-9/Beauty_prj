import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function MakeupArSteps() {
  const steps = [
    {
      num: 1,
      title: 'Skin Tone Detection for Accurate Foundation Match',
      image: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/webp_step1_2def55e5ed.png',
    },
    {
      num: 2,
      title: 'Personalized Foundation Recommendations Tailored to Customers',
      image: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/webp_step2_d8941a1a02.png',
    },
    {
      num: 3,
      title: 'Virtual Try-On with AI Foundation Shade Matcher',
      image: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/webp_step3_fefb258151.png',
    },
  ]

  return (
    <section className="bg-slate-50 py-20 text-slate-900">
      <div className="mx-auto max-w-[1400px] px-8 space-y-12">
        {/* Title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="font-brand text-2xl font-black tracking-tight sm:text-3xl lg:text-[2.25rem]">
            Easy Steps for Foundation AR Try-on
          </h2>
          <p className="text-sm text-slate-500">
            Various AR features for beauty virtual try on, users can create any makeup look in a real time.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="flex-1 flex flex-col md:flex-row items-center gap-4 relative">
              
              {/* Step Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex-grow flex flex-col justify-between items-center text-center">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  <span>STEP</span>
                  <span className="text-brand-accent font-mono text-sm">{step.num}</span>
                </div>
                <img
                  alt={step.title}
                  src={step.image}
                  className="w-full max-w-[180px] aspect-square object-contain mb-4"
                />
                <h3 className="font-brand text-sm font-bold text-slate-900 leading-snug">
                  {step.title}
                </h3>
              </div>

              {/* Arrow connector between steps (hidden on mobile, and after last step) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center shrink-0">
                  <ChevronRight className="h-6 w-6 text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-8">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-brand-accent hover:text-brand-accent transition group"
          >
            <span>Get Custom Demo</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-accent transition group-hover:bg-brand-paper0 group-hover:text-white">
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth={2}>
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>

      </div>
    </section>
  )
}
