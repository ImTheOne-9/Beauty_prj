import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function MakeupArFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      q: 'What is AR beauty solutions?',
      a: 'It provides a full suite of AR beauty solutions—from virtual lip color try-ons to eye color contact simulations—designed for both enterprise and eCommerce needs. Our technology delivers real-time, flawless filters with 360° face tracking, ensuring a seamless, immersive try-on experience from every angle—helping consumers visualize products on themselves before making a purchase. These solutions not only enhance consumer confidence and satisfaction but also significantly boost engagement, reduce return rates, and increase conversion across digital channels.',
    },
    {
      q: 'What is makeup software?',
      a: 'Makeup software refers to digital tools designed to optimize the consumer journey from product discovery to purchase. This includes a wide range of AI-powered virtual try-on technologies that simulate real-time makeup application, and seamlessly integrate with a brand’s website —enhancing engagement, reducing returns, and driving higher conversion rates.',
    },
  ]

  return (
    <section className="bg-white py-16 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 space-y-12">
        {/* Title */}
        <h2 className="text-center font-display text-2xl font-black tracking-tight sm:text-3xl lg:text-[2.25rem]">
          Makeup AR FAQs
        </h2>

        {/* FAQ list */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="border-b border-slate-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
                >
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-rose-500' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 text-sm leading-relaxed text-slate-500">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
