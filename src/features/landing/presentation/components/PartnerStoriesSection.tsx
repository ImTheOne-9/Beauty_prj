import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const stories = [
  {
    id: 'mac',
    brand: 'M·A·C',
    logo: 'M·A·C',
    stat: '200%',
    statLabel: 'boost in customer engagement',
    statSubtext: 'with digital tools',
    quote:
      "Their technological excellence made Perfect Corp. and YouCam a great match for M·A·C. ... It's always mind-boggling how accurate the AR is.",
    author: 'Sonia Anand',
    position: 'Executive Director, Global Digital Retail Innovation, M·A·C Cosmetics',
    image: '/demo-products/mac-demo.jpg', // Placeholder
  },
  {
    id: 'benefit',
    brand: 'benefit',
    logo: 'benefit',
    stat: '14×',
    statLabel: 'uplift in sales',
    statSubtext: 'when consumers engage with our Perfect Corp.-powered Pore Analysis Tool',
    quote:
      "We're seeing almost a 14x uplift in sales when consumers engage with our Perfect Corp.-powered Pore Analysis Tool.",
    author: 'Toto HaBa',
    position: 'Senior Vice President of Global Marketing',
    image: '/demo-products/benefit-demo.jpg', // Placeholder
  },
  {
    id: 'aveda',
    brand: 'AVEDA',
    logo: 'AVEDA',
    stat: '3.5×',
    statLabel: 'increase in engagement',
    statSubtext: 'with AI-powered virtual try-on',
    quote:
      'The AI technology has transformed how our customers discover and experience our products online.',
    author: 'Amanda Park',
    position: 'Chief Digital Officer',
    image: '/demo-products/aveda-demo.jpg', // Placeholder
  },
]

export default function PartnerStoriesSection() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c === 0 ? stories.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === stories.length - 1 ? 0 : c + 1))

  const story = stories[current]

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem]">
            Partner Success Stories
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-base text-gray-600 sm:text-lg">
            Our AI & AR business solutions are empowering our partners to embrace the digital transformation.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative mt-12 flex items-center justify-center gap-4 lg:gap-6">
          {/* Prev button */}
          <button
            onClick={prev}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition hover:border-gray-400 hover:bg-gray-50 lg:h-14 lg:w-14"
            aria-label="Previous story"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 lg:h-7 lg:w-7" />
          </button>

          {/* Card Container */}
          <div className="flex-1 overflow-hidden" style={{ maxWidth: '1100px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={story.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                {/* Grid layout: image | content | testimonial */}
                <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr,1fr]">
                  {/* Left: Image with before/after effect */}
                  <div className="relative h-64 bg-gradient-to-br from-pink-100 to-purple-100 lg:h-auto">
                    {/* Placeholder for actual image */}
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto h-32 w-32 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-4xl">💄</span>
                        </div>
                        <p className="mt-4 text-sm text-gray-600">Before / After Demo</p>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Brand + Stats */}
                  <div className="flex flex-col justify-center border-t border-gray-200 bg-gray-50 p-8 lg:border-l lg:border-t-0">
                    <div className="text-center">
                      {/* Brand Logo */}
                      <div className="mb-6">
                        <span className="text-4xl font-bold tracking-wider text-gray-900 lg:text-5xl">
                          {story.logo}
                        </span>
                      </div>

                      {/* Stat */}
                      <div className="mb-2">
                        <span className="text-6xl font-black text-pink-600 lg:text-7xl">
                          {story.stat}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        {story.statLabel}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {story.statSubtext}
                      </p>

                      {/* CTA Button */}
                      <button className="mt-6 rounded-md border-2 border-pink-600 bg-white px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-pink-600 transition hover:bg-pink-600 hover:text-white">
                        READ STORY
                      </button>
                    </div>
                  </div>

                  {/* Right: Testimonial */}
                  <div className="flex flex-col justify-center border-t border-gray-200 bg-white p-8 lg:border-l lg:border-t-0">
                    <blockquote className="text-base leading-relaxed text-gray-700 lg:text-lg">
                      "{story.quote}"
                    </blockquote>
                    <div className="mt-6">
                      <p className="font-bold text-gray-900">{story.author}</p>
                      <p className="mt-1 text-sm text-gray-600">{story.position}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next button */}
          <button
            onClick={next}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition hover:border-gray-400 hover:bg-gray-50 lg:h-14 lg:w-14"
            aria-label="Next story"
          >
            <ChevronRight className="h-6 w-6 text-gray-600 lg:h-7 lg:w-7" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="mt-8 flex justify-center gap-2">
          {stories.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === current ? 'w-8 bg-pink-600' : 'w-2.5 bg-gray-300'
              }`}
              aria-label={`Go to story ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <button className="rounded-md bg-pink-600 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-pink-700">
            SEE ALL THE STORIES
          </button>
        </div>
      </div>
    </section>
  )
}
