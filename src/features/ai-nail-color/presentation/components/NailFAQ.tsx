import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Reveal } from './nail-ui'

const faqs = [
  {
    q: 'How to find nail polish that suits you?',
    a: 'Use our AI-powered Virtual Nail Try-On to instantly preview thousands of shades and styles on your actual hand, in real time — no mess, no commitment required.',
  },
  {
    q: 'Can AI polish my nails?',
    a: 'While AI cannot physically apply nail polish, our virtual try-on technology lets you see exactly how any shade or style will look on your nails before you buy or apply.',
  },
  {
    q: 'What types of nail products can I try on virtually?',
    a: 'You can virtually try nail polish colors, nail art designs, press-on nails, gel looks, french tips, and more — all with realistic texture rendering.',
  },
  {
    q: 'Is the virtual nail try-on available on mobile?',
    a: 'Yes. Our solution is available across web, mobile apps, and all major retail channels, ensuring a seamless experience wherever your customers shop.',
  },
  {
    q: 'How accurate is the AI nail try-on?',
    a: 'Powered by Physically Based Rendering (PBR) and precise hand tracking, our AI delivers hyper-realistic results that accurately represent textures, finishes, and colors.',
  },
]

export default function NailFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="bg-gray-50 py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2
            className="text-center font-black text-gray-900"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
            }}
          >
            Virtual Nail Polish Try On FAQs
          </h2>
        </Reveal>

        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-200">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-gray-50"
                >
                  <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}