import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const heroSlides = [
  {
    id: 'skin-analysis',
    title: 'AI Powerhouse for Beauty, Skincare, and Fashion Tech',
    description: 'Boost your sales with AI and AR SaaS solutions - Providing custom services for brands or self-service skin analysis platform for medical aesthetic clinics.',
    primaryBtn: { text: 'Discover AI Skin Analysis', link: '/scan' },
    secondaryBtn: { text: 'Try Web Demo', link: '/scan' },
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/b2bhome_topbanner_skin_dt_d9f38d389a.mp4',
    videoMobile: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/b2bhome_topbanner_skin_mb_d682d5689e.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/b2bhome_topbanner_skin_dt_2ad9ce2cf5.jpg',
    badges: ['HIPAA', 'BSI', 'ANAB'],
  },
  {
    id: 'makeup',
    title: 'Makeup, Reimagined with AI',
    description: 'The ultimate 3D AR tech enables precise, personalized virtual makeup trials, boosting 200% customer engagement and satisfaction.',
    primaryBtn: { text: 'Learn More', link: '/scan' },
    secondaryBtn: { text: 'Try Web Demo', link: '/scan' },
    image: 'https://d3ss46vukfdtpo.cloudfront.net/static/media/home_background@2x.5323f293.jpg',
    badges: ['ISO 27001 Certified'],
    hasInteractiveDemo: true,
  },
  {
    id: 'hair',
    title: 'AI Hairstyle Try-On & Hair Analysis',
    description: 'Leverage realistic AI Hair styling and analysis technology to enhance the user experience. Increase brand engagement and conversion rates through personalized virtual try-ons.',
    primaryBtn: { text: 'Try It Now', link: '/scan' },
    secondaryBtn: { text: 'TRY OUR API FOR FREE', link: '/scan' },
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/b2bhome_topbanner_hair_dt_1de2212a18.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/b2bhome_topbanner_hair_dt_e3b9f7f9d7.jpg',
  },
  {
    id: 'jewelry',
    title: 'AR Virtual Try-On for Jewelry and Watches',
    description: 'Highly-advanced virtual try-on with true-to-life hyper-realistic renderings for an exquisitely luxurious feel.',
    primaryBtn: { text: 'CONTACT US', link: '/scan' },
    secondaryBtn: { text: 'Try Web Demo', link: '/scan' },
    image: 'https://plugins-media.makeupar.com/smb/story/2022-05-29/2e9a07b0-3f48-4c81-bfcf-da351ac16e7d.png',
    bg: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/b2bhome_topbanner_jewelry_dt_bg.jpg', // 👈 thêm field bg
    hasJewelryDemo: true,
},
  {
    id: 'eyewear',
    title: 'Real-Time 3D Glasses Virtual Try-On',
    description: 'Powerful 3D face modeling engine delivers accurate eyewear try-on that can be easily integrated by brands and retailers.',
    primaryBtn: { text: 'Learn More', link: '/scan' },
    secondaryBtn: { text: 'Try Web Demo', link: '/scan' },
    image: 'https://plugins-media.makeupar.com/smb/story/2022-05-29/b4799dc8-a8e0-432c-ae07-ea1e009ce1a4.jpg',
    hasEyewearDemo: true,
  },
  {
    id: 'shade-finder',
    title: 'AI-Powered Smart Shade Finder',
    description: 'Highly-advanced shade matcher with skin tone analysis and personalized recommendations for all skin tones',
    primaryBtn: { text: 'Learn More', link: '/scan' },
    secondaryBtn: { text: 'Try Web Demo', link: '/scan' },
    video: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/b2bhome_topbanner_shade_finder_dt_10f3e0c9cb.mp4',
    poster: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/b2bhome_topbanner_shade_finder_dt_75fa2f202e.jpg',
  },
]

// Thêm component này vào trước HeroSection

// Component before/after - chỉ chiếm nửa phải
function MakeupInteractiveDemo({ sliderDefault = 50 }: { sliderDefault?: number }) {
  const [sliderX, setSliderX] = useState(sliderDefault)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = Math.min(90, Math.max(20, ((clientX - rect.left) / rect.width) * 100))
    setSliderX(pct)
  }

  // Đường chéo: offset 30% giống gốc
  const offset = 8 // độ chéo nhỏ thôi
  const leftPoly  = `polygon(0% 0%, ${sliderX - offset}% 0%, ${sliderX}% 100%, 0% 100%)`
  const rightPoly = `polygon(${sliderX - offset}% 0%, 100% 0%, 100% 100%, ${sliderX}% 100%)`
  const handleLeft = `${sliderX - offset / 2}%` // trung điểm của đường chéo ở giữa chiều cao

  // Vị trí handle theo px dựa trên % container


  const annotations = [
    { label: 'Hair Color',        top: 'calc(16.5% - 24px)' },
    { label: 'Eyebrow',           top: 'calc(23% - 24px)'   },
    { label: 'Eyelash',           top: 'calc(29% - 24px)'   },
    { label: 'Eyeshadow',         top: 'calc(38% - 24px)'   },
    { label: 'Highlight & Bronzer', top: 'calc(52% - 24px)' },
    { label: 'Blush',             top: 'calc(59% - 24px)'   },
    { label: 'Lipstick',          top: 'calc(65.5% - 24px)' },
    { label: 'Contour',           top: 'calc(73% - 24px)'   },
    { label: 'Eyecolor',          top: 'calc(85% - 24px)'   },
    { label: 'Eyewear',           top: 'calc(91% - 24px)'   },
  ]

  return (
    <div className="absolute bottom-0 top-16 right-0 w-[55%] flex">
      {/* Vùng kéo before/after */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden"
        style={{ cursor: 'ew-resize', userSelect: 'none' }}
        onMouseDown={(e) => { isDragging.current = true; handleMove(e.clientX) }}
        onMouseUp={() => (isDragging.current = false)}
        onMouseLeave={() => (isDragging.current = false)}
        onMouseMove={(e) => isDragging.current && handleMove(e.clientX)}
        onTouchStart={(e) => { isDragging.current = true; handleMove(e.touches[0].clientX) }}
        onTouchEnd={() => (isDragging.current = false)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      >
        {/* Before image - clip trái */}
        <img
          src="https://bcm-media.beautycircle.com/pfweb/assets/images/2B_top_banner_before-210521.png"
          className="absolute inset-0 h-full w-full object-contain object-top"
          style={{ clipPath: leftPoly, pointerEvents: 'none' }}
          draggable={false}
          alt="Before"
        />

        {/* After image - clip phải */}
        <img
          src="https://bcm-media.beautycircle.com/pfweb/assets/images/2B_top_banner_after_makeup-210521.png"
          className="absolute inset-0 h-full w-full object-contain object-top"
          style={{ clipPath: rightPoly, pointerEvents: 'none' }}
          draggable={false}
          alt="After"
        />

        {/* Đường chia chéo */}
        {/* Đường chia chéo — thay toàn bộ phần "Đường chia chéo" */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <line
            x1={`${sliderX - offset}%`}
            y1="0%"
            x2={`${sliderX}%`}
            y2="100%"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2"
          />
        </svg>

        {/* Handle circle — giữ nguyên vị trí giữa đường chéo */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${sliderX - offset / 2}%` }}
        >
          <div className="relative flex items-center">
            <span className="absolute right-full pr-3 text-[10px] font-bold tracking-widest text-white whitespace-nowrap drop-shadow">
              Before
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/30 border-2 border-white shadow-xl backdrop-blur-sm">
              <ChevronLeft className="h-3.5 w-3.5 text-white" />
              <ChevronRight className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="absolute left-full pl-3 text-[10px] font-bold tracking-widest text-white whitespace-nowrap drop-shadow">
              After
            </span>
          </div>
        </div>

        {/* Annotation dots + labels */}
        {annotations.map(({ label, top }) => (
          <div
            key={label}
            className="absolute right-4 flex items-center gap-2 pointer-events-none"
            style={{ top }}
          >
            <div className="h-px flex-1 bg-white/60" style={{ width: '8vw' }} />
            <div className="h-2 w-2 rounded-full bg-white shadow" />
            <span className="text-[10px] font-bold tracking-[0.18em] text-white drop-shadow whitespace-nowrap">
              {label.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
export default function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const MotionLink = motion.create(Link)

  const prev = () => {
    setIsAutoPlaying(false)
    setCurrent((c) => (c === 0 ? heroSlides.length - 1 : c - 1))
  }

  const next = () => {
    setIsAutoPlaying(false)
    setCurrent((c) => (c === heroSlides.length - 1 ? 0 : c + 1))
  }

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setCurrent((c) => (c === heroSlides.length - 1 ? 0 : c + 1))
    }, 6000) // Change slide every 6 seconds
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const slide = heroSlides[current]

  return (
    <>
      {/* ── MOBILE HERO (< lg) ──────────────────── */}
      <section className="lg:hidden w-full bg-white relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Video/Image block */}
            <div className="relative w-full overflow-hidden" style={{ height: '300vw', minHeight: 220, maxHeight: 700 }}>
              {slide.video ? (
                <video
                  src={slide.videoMobile || slide.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster={slide.poster}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: 'center 20%' }}
                />
              ) : (
                <div
                  className="absolute inset-0 h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
              )}
              {/* Bottom fade */}
              <div
                className="absolute inset-x-0 bottom-0 h-16"
                style={{ background: 'linear-gradient(to top, #ffffff, transparent)' }}
              />
            </div>

            {/* Text content */}
            <div className="px-5 pb-10 pt-4 bg-white">
              <motion.p
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                AI-Powered Beauty Technology
              </motion.p>

              <motion.h1
                className="mt-3 font-black leading-tight tracking-tight text-gray-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.6rem, 5.5vw, 2.2rem)' }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {slide.title}
              </motion.h1>

              <motion.p
                className="mt-3 text-sm leading-relaxed text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {slide.description}
              </motion.p>

              <motion.div
                className="mt-6 flex flex-col gap-3 sm:flex-row"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <MotionLink
                  to={slide.primaryBtn.link}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 rounded-full bg-rose-600 px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-rose-500/25 transition hover:bg-rose-700"
                >
                  {slide.primaryBtn.text}
                </MotionLink>
                <MotionLink
                  to={slide.secondaryBtn.link}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 rounded-full border-2 border-gray-300 bg-white px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-gray-700 transition hover:border-rose-400 hover:text-rose-600"
                >
                  {slide.secondaryBtn.text}
                </MotionLink>
              </motion.div>

              {/* Trust badges */}
              {slide.badges && (
                <motion.div
                  className="mt-5 flex items-center gap-3 flex-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {slide.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[9px] font-bold tracking-[0.18em] text-gray-500"
                    >
                      {badge}
                    </span>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="absolute top-1/2 left-0 right-0 z-20 flex items-center justify-between px-2 -translate-y-1/2 pointer-events-none">
          <button
            onClick={prev}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg transition hover:bg-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={next}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg transition hover:bg-white"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsAutoPlaying(false)
                setCurrent(i)
              }}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-8 bg-rose-600' : 'w-2 bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── DESKTOP HERO (≥ lg) ────────────── */}
      <section
        className="hidden lg:block relative w-full overflow-hidden"
        style={{ height: '100svh', minHeight: 640 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Background video or image */}
            {slide.video ? (
              <video
                src={slide.video}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={slide.poster}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: 'center center' }}
              />
            ) : slide.id === 'makeup' ? (
              <>
              {/* Background xám nhạt */}
                <div
                  className="absolute inset-0 h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                <MakeupInteractiveDemo sliderDefault={50}/>  
              </>
            ): slide.id === 'jewelry' ? (
              <>
                <div
                  className="absolute inset-0 h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${(slide as any).bg || slide.image})` }}
                />
                <img
                  src={slide.image}
                  className="absolute inset-y-0 right-0 h-full w-auto object-contain object-right-bottom"
                  alt=""
                />
              </>
            ) : (
              <div
                className="absolute inset-0 h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
            )}

            

            

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-center pointer-events-none">
              <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl pt-16 pointer-events-auto">
                  <motion.p
                    className="text-xs font-bold uppercase tracking-[0.35em] text-rose-500"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    AI-Powered Beauty Technology
                  </motion.p>

                  <motion.h1
                    className="mt-4 font-black leading-[1.05] tracking-[-0.03em] text-gray-900"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2.4rem, 3.8vw, 4rem)' }}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  >
                    {slide.title}
                  </motion.h1>

                  <motion.p
                    className="mt-5 max-w-md text-base leading-relaxed text-gray-700"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    {slide.description}
                  </motion.p>

                  <motion.div
                    className="mt-8 flex flex-wrap gap-3"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                  >
                    <MotionLink
                      to={slide.primaryBtn.link}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-full bg-rose-600 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-700"
                    >
                      {slide.primaryBtn.text}
                    </MotionLink>
                    <MotionLink
                      to={slide.secondaryBtn.link}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-full border-2 border-gray-400 bg-white/70 px-7 py-3 text-sm font-bold uppercase tracking-wide text-gray-800 backdrop-blur-sm transition hover:border-rose-400 hover:text-rose-600"
                    >
                      {slide.secondaryBtn.text}
                    </MotionLink>
                  </motion.div>

                  {slide.badges && (
                    <motion.div
                      className="mt-8 flex flex-wrap items-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.7, delay: 0.45 }}
                    >
                      {slide.badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full border border-gray-300 bg-white/80 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-gray-500 shadow-sm backdrop-blur-sm"
                        >
                          {badge}
                        </span>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Makeup annotation buttons */}
                

                {/* Stats bar */}
                <motion.div
                  className="absolute bottom-8 left-0 right-0 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pointer-events-auto"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.55 }}
                >
                  <div className="grid grid-cols-4 gap-3 border-t border-white/50 pt-6">
                    {[
                      { value: '500+', label: 'Brand Partners' },
                      { value: '2.4M+', label: 'Monthly Users' },
                      { value: '98.7%', label: 'AI Accuracy' },
                      { value: '50+', label: 'Countries' },
                    ].map(({ value, label }) => (
                      <div key={label} className="text-center">
                        <p
                          className="text-3xl font-black text-rose-600"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {value}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-gray-600">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="absolute top-1/2 left-0 right-0 z-20 flex items-center justify-between px-8 -translate-y-1/2 pointer-events-none">
          <button
            onClick={prev}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg transition hover:bg-white hover:scale-105"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-7 w-7 text-gray-700" />
          </button>
          <button
            onClick={next}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg transition hover:bg-white hover:scale-105"
            aria-label="Next slide"
          >
            <ChevronRight className="h-7 w-7 text-gray-700" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center gap-2.5">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsAutoPlaying(false)
                setCurrent(i)
              }}
              className={`h-2.5 rounded-full transition-all ${
                i === current ? 'w-10 bg-rose-600' : 'w-2.5 bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>
    </>
  )
}
