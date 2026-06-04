import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function MakeupArVersatile() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  return (
    <section className="bg-white py-16 text-slate-900">
      <div className="mx-auto max-w-[1400px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Content */}
        <div className="space-y-6">
          <h2 className="font-brand text-2xl font-black tracking-tight sm:text-3xl lg:text-[2.25rem]">
            Versatile AR Makeup Features
          </h2>
          
          <p className="text-sm leading-relaxed text-slate-500">
            Our Makeup AR solution offers a wide range of features—from virtual lip color and eye makeup try-ons to colored contact lenses and precision shade matching. Deliver hyper-realistic AR filters that boost engagement and enhance the shopping experience with every click.
          </p>

          <div className="pt-4">
            <Link
              to="/virtual-makeup-try-on"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-brand-accent hover:text-brand-accent transition group"
            >
              <span>Learn More Makeup AR Services</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-accent transition group-hover:bg-brand-paper0 group-hover:text-white">
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* Right Side: Video */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-white aspect-[16/9] flex items-center justify-center">
          <video
            ref={videoRef}
            src="https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/3c02c139-78ba-4349-b289-c97cb5979a93.mp4"
            poster="https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/webp_videoframe_5528_5855b2ee92.png"
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </section>
  )
}
