import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Watch, Gem, Sparkles, Hand } from 'lucide-react'

// ─── Arrow link ──────────────────────────────────────────────────────────────
function ArrowLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-900 group"
    >
      <span>{children}</span>
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-900 transition group-hover:bg-slate-900 group-hover:text-white">
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth={2}>
          <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  )
}

// ─── Auto-play video ──────────────────────────────────────────────────────────
function AutoVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => { ref.current?.play().catch(() => {}) }, [])
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="auto"
      className="h-full w-full object-cover"
    />
  )
}

// ─── Section with text + media (video or image) ───────────────────────────────
type SectionProps = {
  title: string
  desc: React.ReactNode
  link: { to: string; label: string }
  media: React.ReactNode
  reverse?: boolean
  bg?: string
}

function FeatureSection({ title, desc, link, media, reverse = false, bg = 'bg-white' }: SectionProps) {
  return (
    <section className={`${bg} w-full`}>
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-2 items-stretch min-h-[480px]">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`flex flex-col justify-center gap-6 px-10 py-14 lg:px-16 ${reverse ? 'lg:order-2' : 'lg:order-1'}`}
        >
          <h2 className="font-brand text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem]">
            {title}
          </h2>
          <div className="text-sm leading-relaxed text-slate-500">{desc}</div>
          <ArrowLink to={link.to}>{link.label}</ArrowLink>
        </motion.div>

        {/* Media */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className={`relative aspect-[4/3] lg:aspect-auto overflow-hidden ${reverse ? 'lg:order-1' : 'lg:order-2'}`}
        >
          {media}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AgileHandFeatures() {
  const categories = [
    { icon: Watch, label: 'Watches' },
    { icon: Sparkles, label: 'Bracelets' },
    { icon: Gem, label: 'Rings' },
    { icon: Hand, label: 'Nails' },
  ]

  return (
    <div className="divide-y divide-slate-100">
      {/* 1 ── Powering Next Level */}
      <FeatureSection
        bg="bg-white"
        title="Powering Next Level Hand Virtual Try-On Shopping Experiences"
        desc="Groundbreaking technology to help brands integrate smooth virtual try-on on a wide range of products for hand, including watch, bracelet, ring, nail polish, and press on nails."
        link={{ to: '/scan', label: 'Try the Demo' }}
        media={
          <AutoVideo src="https://d3ss46vukfdtpo.cloudfront.net/static/media/Powering.ff03272b.mp4" />
        }
      />

      {/* 2 ── AI Neural Networks (reverse + grey) */}
      <FeatureSection
        bg="bg-[#f2f2f2]"
        reverse
        title="Powered by AI Neural Networks for Ultra Precise Hand Tracking"
        desc={
          <>
            Only the best hand tracking performance can deliver ultra realistic hand virtual try-ons for various hand product categories.
            <br /><br />
            Our hand tracking technology is trained on real hand models with a complete array of gestures, skin tones, textures, as well as hand and finger sizes, encompassing all unique personal traits, providing a truly inclusive solution.
          </>
        }
        link={{ to: '/scan', label: 'Try the Demo' }}
        media={
          <AutoVideo
            src="https://d3ss46vukfdtpo.cloudfront.net/static/media/Powered.a31c9790.mp4"
            poster="https://plugins-media.makeupar.com/smb/story/2022-01-18/4bcbc6d4-48e6-4295-ae08-67d37326b14e.jpg"
          />
        }
      />

      {/* 3 ── Wide Range (with category icons inline) */}
      <FeatureSection
        bg="bg-white"
        title="Powering a Wide Range of Experiences"
        desc={
          <div className="space-y-5">
            <p>AgileHand™ technology is at the heart of several virtual try-on experiences.</p>
            <div className="grid grid-cols-4 gap-3">
              {categories.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                    <Icon className="h-5 w-5 text-brand-accent" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600">{label}</span>
                </div>
              ))}
            </div>
            <p>For companies wishing to bring their products into the Metaverse, AgileHand™ provides a fast path to asset digitization with hyper-realistic, high-touch results.</p>
          </div>
        }
        link={{ to: '/auth', label: 'Contact Us' }}
        media={
          <img
            src="https://plugins-media.makeupar.com/smb/story/2022-01-19/67f8f592-600e-4eb7-8089-a40f91119490.png"
            alt="Wide range of experiences"
            className="h-full w-full object-cover"
          />
        }
      />

      {/* 4 ── PBR / Feels Like Wearing (reverse + pastel gradient) */}
      <FeatureSection
        bg="bg-gradient-to-br from-[#d2f0fe] via-[#ede0ff] to-[#fae3ff]"
        reverse
        title="Feels Like Wearing the Real Product"
        desc={
          <>
            Our AR virtual try-on experience is enhanced by <strong className="text-slate-900">Physically Based Rendering (PBR)</strong> method. It simulates many real-life physics, including built materials, textures, micro-reflections, light scattering, and more.
            <br /><br />
            Using PBR, all our AR experiences present your virtual products with unprecedented details and incredible accuracy.
          </>
        }
        link={{ to: '/auth', label: 'Contact Us' }}
        media={
          <AutoVideo
            src="https://d3ss46vukfdtpo.cloudfront.net/static/media/Feels.2bb4ff32.mp4"
            poster="https://plugins-media.makeupar.com/smb/story/2022-01-18/45244313-04eb-4808-ae43-0693214e7d1f.jpg"
          />
        }
      />

      {/* 5 ── Environmental Lighting */}
      <FeatureSection
        bg="bg-white"
        title="Extreme Realism with Enhanced Environmental Lighting"
        desc="Developed with proprietary visual computing algorithm, the Enhanced Environmental Lighting feature further adds to the extreme realism of our virtual try-on experience, mimicking natural lighting and imposing realistic reflections on the AR virtual products."
        link={{ to: '/scan', label: 'Try the Demo' }}
        media={
          <AutoVideo
            src="https://d3ss46vukfdtpo.cloudfront.net/static/media/Extreme.2c028362.mp4"
            poster="https://plugins-media.makeupar.com/smb/story/2022-01-18/2865f331-cb0d-440a-ae02-bcab4efacd8d.jpg"
          />
        }
      />

      {/* 6 ── Any Device (reverse + grey) */}
      <FeatureSection
        bg="bg-[#f2f2f2]"
        reverse
        title="Instantaneous Experience: Works on Any Camera-enabled Device"
        desc={
          <>
            AgileHand™ eliminates all the pain points along the consumer journey to deliver a solution that works instantly, without a need to use any physical objects to calibrate the camera.
            <br /><br />
            AgileHand™ is able to determine wrist &amp; finger sizes automatically and impose AR objects seamlessly on your customers' hands instantly, creating a fully immersive shopping experience.
          </>
        }
        link={{ to: '/scan', label: 'Try the Demo' }}
        media={
          <AutoVideo
            src="https://d3ss46vukfdtpo.cloudfront.net/static/media/Instantaneous.c021d342.mp4"
            poster="https://plugins-media.makeupar.com/smb/story/2022-01-26/a16d12b6-45bb-4581-8b01-33303125cbb2.jpg"
          />
        }
      />
    </div>
  )
}