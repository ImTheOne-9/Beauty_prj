import { Suspense, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'

// New sections
import HeroSection from '@/features/landing/components/HeroSection'
import SolutionsSection from '@/features/landing/components/SolutionsSection'
import PartnerStoriesSection from '@/features/landing/components/PartnerStoriesSection'
import NewsSection from '@/features/landing/components/NewsSection'
import AwardsSection from '@/features/landing/components/AwardsSection'
import DarkFooter from '@/features/landing/components/DarkFooter'

// Kept existing sections
import ProductRecommendations from '@/features/landing/components/ProductRecommendations'
import Testimonials from '@/features/landing/components/Testimonials'

// ─── Section wrapper for scroll-reveal ─────────────────────────────────────────
function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      data-reveal
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Section header helper ──────────────────────────────────────────────────────
function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-rose-500">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  )
}

export default function LandingPage() {
  const pageRef = useRef<HTMLElement | null>(null)
  const MotionLink = motion.create(Link)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })

    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <main ref={pageRef} className="min-h-screen overflow-x-hidden bg-white">

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── 2. SOLUTIONS ─────────────────────────────────────────────────────── */}
      <RevealSection>
        <SolutionsSection />
      </RevealSection>

      {/* ── 3. PARTNER SUCCESS STORIES ───────────────────────────────────────── */}
      <RevealSection>
        <PartnerStoriesSection />
      </RevealSection>

      {/* ── 4. AI SCANNER (KEPT) ─────────────────────────────────────────────── */}

      {/* ── 5. PRODUCT RECOMMENDATIONS (KEPT) ───────────────────────────────── */}
      <RevealSection>
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Curated For You"
              title="Makeup picks matched to your skin"
              subtitle="After your virtual try-on, our AI recommends products from top brands that complement your unique skin tone and style."
            />
            <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:p-6">
              <Suspense fallback={<div className="flex h-48 items-center justify-center text-gray-400 text-sm">Loading recommendations...</div>}>
                <ProductRecommendations />
              </Suspense>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── 6. NEWS ──────────────────────────────────────────────────────────── */}
      <RevealSection>
        <NewsSection />
      </RevealSection>

      {/* ── 7. AWARDS ────────────────────────────────────────────────────────── */}
      <RevealSection>
        <AwardsSection />
      </RevealSection>

      {/* ── 8. TESTIMONIALS (KEPT) ───────────────────────────────────────────── */}
      <RevealSection>
        <section className="bg-white py-16">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Real People. Real Looks."
              title="Loved by beauty enthusiasts worldwide"
              subtitle="From first-time makeup buyers to professional artists — everyone uses our virtual try-on to discover looks they'd never dare try in store."
            />
            <div className="mt-10 rounded-2xl border border-gray-100 bg-gray-50 p-4 lg:p-6">
              <Suspense fallback={<div className="flex h-48 items-center justify-center text-gray-400 text-sm">Loading testimonials...</div>}>
                <Testimonials />
              </Suspense>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── 9. CTA BANNER ────────────────────────────────────────────────────── */}
      <RevealSection>
        <section className="bg-rose-600 py-16">
          <div className="mx-auto max-w-[1400px] px-4 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-rose-200">Start For Free</p>
            <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              One selfie. Thousands of looks.<br className="hidden sm:block" /> Zero commitment.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-rose-100">
              Join 2.4 million people who've already discovered their perfect look with AI.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <MotionLink
                to="/scan"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-rose-700 shadow-lg transition hover:shadow-xl"
              >
                Try On Now — It's Free
              </MotionLink>
              <MotionLink
                to="/auth"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full border-2 border-white/40 bg-white/10 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Create Free Account
              </MotionLink>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── 10. DARK FOOTER ──────────────────────────────────────────────────── */}
      <DarkFooter />
    </main>
  )
}
