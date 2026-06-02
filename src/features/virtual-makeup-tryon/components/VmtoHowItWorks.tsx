import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { VMTO_IMAGES } from './vmto-ui'

type MakeupCategory = {
  id: string
  label: string
  description: string
  video: string
  poster: string
}

const categories: MakeupCategory[] = [
  {
    id: 'lip-color',
    label: 'Lip Color',
    description: 'Try on hundreds of lip color shades virtually with true-to-life color rendering that adapts to your natural lip tone.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_lip_color_dc78470adc.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_lip_color_preview_4656032cdf.jpg',
  },
  {
    id: 'lip-shape',
    label: 'Lip Shape',
    description: 'Provide a variety of lip shapes for users to find the one that suits them best — from Petal Lips to Heart Lips and more.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/lip_color_Shape_match%20%283%29.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/webp_lip_color_Shape_match-0%20%282%29_d030d5cbb3.jpg',
  },
  {
    id: 'lip-liner',
    label: 'Lip Liner',
    description: 'Define and shape lips with precise virtual lip liner that follows the exact contour of your lips for a flawless finish.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_lip_liner_d4c8e1a51a.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_lip_liner_preview_1dc89848a6.jpg',
  },
  {
    id: 'lip-plumper',
    label: 'Lip Plumper',
    description: 'Virtually preview a fuller, more voluminous lip look with AI-powered lip plumping effects in real time.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_lip_plumper_bb9e30d2d1.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_lip_liner_preview_a46bbc0064.jpg',
  },
  {
    id: 'eyebrow',
    label: 'Eyebrow',
    description: 'Try on different eyebrow shapes, thicknesses, and colors to find the perfect brow look that frames your face.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_eyebrow_d1cf130772.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_eyebrow_preview_7e343399fe.jpg',
  },
  {
    id: 'eyeshadow',
    label: 'Eyeshadow',
    description: 'Explore endless eye looks with blended, multi-shade eyeshadow rendering that mirrors real application techniques.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_eye_shadow_2ba7758aa8.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_eye_shadow_preview_f0425483dc.jpg',
  },
  {
    id: 'eyeliner',
    label: 'Eyeliner',
    description: 'Apply winged, tightline, or classic liner styles that follow the exact contour of the eye for a flawless result.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_eyeliner_ec339ee350.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_eyeliner_preview_04ca1ac0ba.jpg',
  },
  {
    id: 'eyelashes',
    label: 'Eyelashes',
    description: 'Preview natural, volume, or dramatic lash sets that move and blink realistically with the user.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_eyelashes_7621e54654.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_eyelashes_preview_f26d8b09a9.jpg',
  },
  {
    id: 'eye-color',
    label: 'Eye Color',
    description: 'Try colored contact lenses virtually with natural-looking iris rendering that adapts to lighting and eye movement in real time.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_eyecolor_406ed40987.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_eyecolor_preview_e0fcc073d3.jpg',
  },
  {
    id: 'blush',
    label: 'Blush',
    description: 'Add a natural flush or bold pop of color with AI blush simulation that blends seamlessly across all skin tones.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_blush_0d7ffc446b.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/20240703_blush_preview_17b22a1629.jpg',
  },
  {
    id: 'foundation',
    label: 'Foundation',
    description: 'Match foundation to skin tone with AI shade detection and see coverage applied evenly across the face.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s2_video_foundation_8fa6f8b07f.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s2_poster_foundation_5c30f6ec99.jpg',
  },
  {
    id: 'concealer',
    label: 'Concealer',
    description: 'Virtually cover blemishes, dark circles, and imperfections with AI-powered concealer simulation for a flawless base.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s2_video_concealer_025f715037.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s2_poster_concealer_346fc406c3.jpg',
  },
  {
    id: 'highlighter',
    label: 'Highlighter',
    description: 'Add a luminous glow to cheekbones, brow bones, and the bridge of the nose with realistic shimmer rendering.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s2_video_highlighter_cb51648ac9.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s2_poster_highlighter_230675bc31.jpg',
  },
  {
    id: 'contour',
    label: 'Contour',
    description: 'Virtually try our makeup looks to instantly add contour to slim and shape your face for a sculpted, defined look.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s2_video_contour_88b7969d37.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s2_poster_contour_06dc50f202.jpg',
  },
  {
    id: 'bronzer',
    label: 'Bronzer',
    description: 'Achieve a sun-kissed, warm glow with AI bronzer that blends naturally across your skin tone for a healthy, radiant look.',
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s2_video_bronzer_119f69df34.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/B2_B_virtual_Makeup_s2_poster_bronzer_a22644b97c.jpg',
  },
]

export default function VmtoHowItWorks() {
  const [active, setActive] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleSelect = (i: number) => {
    setActive(i)
    // reset & play video when switching
    setTimeout(() => {
      videoRef.current?.load()
      videoRef.current?.play()
    }, 50)
  }

  const prev = () => handleSelect(active === 0 ? categories.length - 1 : active - 1)
  const next = () => handleSelect(active === categories.length - 1 ? 0 : active + 1)

  const cat = categories[active]

  return (
    <section className="relative overflow-hidden bg-gray-900 py-16 lg:py-24">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${VMTO_IMAGES.makeupBg})` }}
      />
      

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <h2
            className="font-black tracking-tight text-white text-2xl sm:text-3xl lg:text-[2.5rem]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            How Does AI Virtual Makeup Try On Work?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-300">
            The ultimate AI and AR-powered virtual makeup try-on experience is like
            looking into a virtual mirror. Give the customers a virtual makeover offline.
          </p>
        </div>

        {/* Card */}
        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Category tabs — scrollable on mobile */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-3 scrollbar-none">
            {categories.map((c, i) => (
              <button
                key={c.id}
                onClick={() => handleSelect(i)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                  active === i
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-gray-500 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 sm:p-8">
            {/* Video preview with prev/next arrows */}
            <div className="relative overflow-hidden rounded-xl bg-rose-50">
              <AnimatePresence mode="wait">
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-72 w-full sm:h-80"
                >
                  <video
                    ref={videoRef}
                    key={cat.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    poster={cat.poster}
                    className="h-full w-full object-cover object-top"
                  >
                    <source src={cat.video} type="video/mp4" />
                  </video>
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next */}
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur-sm transition hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur-sm transition hover:bg-white"
              >
                <ChevronRight className="h-4 w-4 text-gray-700" />
              </button>
            </div>

            {/* Description */}
            <div className="flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3
                    className="text-2xl font-black text-gray-900"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {cat.label}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {cat.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <button className="mt-6 w-fit rounded-full bg-rose-600 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow transition hover:bg-rose-700">
                Try It Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}