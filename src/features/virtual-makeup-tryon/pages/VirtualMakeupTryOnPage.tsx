import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'

import VmtoHero from '@/features/virtual-makeup-tryon/components/VmtoHero'
import VmtoHowItWorks from '@/features/virtual-makeup-tryon/components/VmtoHowItWorks'
import VmtoBlush from '@/features/virtual-makeup-tryon/components/VmtoBlush'
import VmtoWhyChoose from '@/features/virtual-makeup-tryon/components/VmtoWhyChoose'
import VmtoComparison from '@/features/virtual-makeup-tryon/components/VmtoComparison'
import VmtoRoi from '@/features/virtual-makeup-tryon/components/VmtoRoi'
import VmtoFaceTech from '@/features/virtual-makeup-tryon/components/VmtoFaceTech'
import VmtoFaq from '@/features/virtual-makeup-tryon/components/VmtoFaq'
import DarkFooter from '@/features/landing/components/DarkFooter'

export default function VirtualMakeupTryOnPage() {
  const pageRef = useRef<HTMLElement | null>(null)

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
      <VmtoHero />
      <VmtoHowItWorks />
      <VmtoBlush />
      <VmtoWhyChoose />
      <VmtoComparison />
      <VmtoRoi />
      <VmtoFaceTech />
      <VmtoFaq />
      <DarkFooter />
    </main>
  )
}
