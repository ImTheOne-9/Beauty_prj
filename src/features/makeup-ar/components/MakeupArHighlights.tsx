import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

export default function MakeupArHighlights() {
  const [activeIndex, setActiveIndex] = useState(0)

  const highlights = [
    {
      title: 'Accurate Color Blending',
      icon: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/webp_hair_color_s3_icon_1_v2_5199aa026d_fbb8fa7894.png',
      desc: 'Accurate color matching using deep learning AI to offer a true-to-life AR makeup try-ons for the users. This accuracy of color match gives consumers the confidence of product they wish to purchase.',
      linkText: 'Learn More',
      linkTo: '/auth',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Texture & Shade Matching',
      icon: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/hair_color_s3_icon_2_3500e6ba95.svg',
      desc: "Realistic textures and finishes matching real life products in AR try outs. From matte, metallic, satin, sheer, gloss, shimmer, metallic to holographic, you'll be amazed how much details AR & AI can provide.",
      linkText: 'More details in virtual try on',
      linkTo: '/scan',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Glow-Ready AR Technology',
      icon: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/webp_hair_color_s3_icon_1_v2_5199aa026d_8c4bf92d4e.png',
      desc: 'The smart 3D AR engine is able to detect lighting conditions and provide true-to-life AR makeup effects.',
      linkText: 'Get Custom Product Demo',
      linkTo: '/auth',
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Skin Tone Analysis',
      icon: 'https://bcw-media.s3.ap-northeast-1.amazonaws.com/strapi/assets/hair_color_s3_icon_2_3500e6ba95.svg',
      desc: 'Powerful AR facial detection and machine learning technologies underpin accurate skin tone analysis. Detecting changes in lighting, facial movements and shots from any angle, for a realistic and personalized makeover experience for users of all skin tones.',
      linkText: 'Start a Free Trial for eCommerce',
      linkTo: '/plans',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    },
  ]

  return (
    <section className="bg-slate-50 py-20 text-slate-900">
      <div className="mx-auto max-w-[1400px] px-8 space-y-12">
        {/* Title */}
        <div className="text-left">
          <h2 className="font-display text-2xl font-black tracking-tight sm:text-3xl lg:text-[2.25rem]">
            4 Highlights of Makeup AR Tech
          </h2>
        </div>

        {/* Highlight content split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Visual representation (image changes on index update) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl bg-white p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full relative"
                >
                  <img
                    src={highlights[activeIndex].image}
                    alt={highlights[activeIndex].title}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent rounded-2xl" />
                  
                  {/* Decorative face mesh overlay to simulate tracking */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                    <svg viewBox="0 0 100 100" className="w-48 h-48 text-rose-500" stroke="currentColor" strokeWidth={1} fill="none">
                      <ellipse cx="50" cy="50" rx="35" ry="42" />
                      <line x1="15" y1="50" x2="85" y2="50" />
                      <line x1="50" y1="8" x2="50" y2="92" />
                      <circle cx="38" cy="42" r="4" />
                      <circle cx="62" cy="42" r="4" />
                      <path d="M40,68 C45,73 55,73 60,68" />
                    </svg>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Highlights Accordion List */}
          <div className="lg:col-span-7 space-y-4">
            {highlights.map((item, idx) => {
              const isOpen = activeIndex === idx
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? 'border-rose-500/20 bg-white shadow-md' 
                      : 'border-slate-200 bg-white/50 hover:bg-white'
                  }`}
                >
                  {/* Accordion header */}
                  <button
                    onClick={() => setActiveIndex(idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50">
                        <img src={item.icon} alt="" className="h-6 w-6 object-contain" />
                      </div>
                      <span className="font-display text-base font-bold text-slate-900">
                        {item.title}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-rose-500' : ''
                      }`}
                    />
                  </button>

                  {/* Accordion body */}
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-[300px] border-t border-slate-100' : 'max-h-0'
                    }`}
                  >
                    <div className="p-6 space-y-4">
                      <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
                      
                      <Link
                        to={item.linkTo}
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-rose-600 hover:text-rose-700 transition group"
                      >
                        <span>{item.linkText}</span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-rose-500 transition group-hover:bg-rose-500 group-hover:text-white">
                          <svg viewBox="0 0 16 16" fill="none" className="h-2.5 w-2.5" stroke="currentColor" strokeWidth={2}>
                            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
