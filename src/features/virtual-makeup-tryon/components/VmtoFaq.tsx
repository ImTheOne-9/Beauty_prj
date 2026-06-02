import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Reveal, SectionHeader } from './vmto-ui'

const faqs = [
  {
    q: 'How is AI used in the beauty industry?',
    a: 'AI powers virtual try-on, personalized product recommendations, skin analysis, and shade matching — helping brands deliver tailored experiences online and in-store.',
  },
  {
    q: 'How does virtual makeup try-on work?',
    a: 'It uses AI face-landmark detection and AR rendering to map cosmetics onto your face in real time, simulating realistic textures, finishes, and colors as you move.',
  },
  {
    q: 'How can my brand implement AI-powered virtual makeup try-on?',
    a: 'You can integrate via our Web SDK, Mobile SDK, or API, or use the self-serve service for platforms like Shopify and WooCommerce — most brands launch within days.',
  },
  {
    q: 'What are the benefits of virtual makeup try-on?',
    a: 'Higher engagement, increased conversion rates, fewer returns, and richer first-party data on customer preferences.',
  },
  {
    q: 'How can my brand offer virtual makeup try-on for customers?',
    a: 'Add a "Try On" button to product pages, embed it in your app, or deploy an in-store smart mirror — all powered by the same AI engine.',
  },
  {
    q: 'How does AI makeup technology improve online makeup sales?',
    a: 'By letting shoppers preview products on their own face, it builds confidence to purchase and reduces hesitation, driving measurable sales uplift.',
  },
  {
    q: 'Is virtual makeup try-on accurate?',
    a: 'Yes — our 3D face-modeling engine delivers hyper-realistic results that track expressions and lighting, making the preview close to the real product.',
  },
  {
    q: 'What devices can use virtual try-on?',
    a: 'Any modern smartphone, tablet, or desktop with a camera and an up-to-date browser — no app download required for the web experience.',
  },
  {
    q: 'Is AI makeup secure and private?',
    a: 'Camera processing runs on-device where possible, and we follow strict data-protection standards. No biometric data is stored without explicit consent.',
  },
  {
    q: 'How long does it take to integrate virtual try-on into my website?',
    a: 'Self-serve setups can go live in hours; custom SDK or API integrations typically take a few days depending on your stack.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-gray-900 sm:text-base">{q}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-rose-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-gray-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function VmtoFaq() {
  return (
    <section className="bg-gray-50 py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader eyebrow="Got Questions?" title="Virtual Makeup Try On FAQs" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gray-100 bg-white px-6 shadow-sm sm:px-8">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
