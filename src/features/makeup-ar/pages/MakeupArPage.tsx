import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'

import MakeupArHero from '../components/MakeupArHero'
import MakeupArImmersive from '../components/MakeupArImmersive'
import MakeupArHighlights from '../components/MakeupArHighlights'
import MakeupArVersatile from '../components/MakeupArVersatile'
import MakeupArSteps from '../components/MakeupArSteps'
import MakeupArFAQ from '../components/MakeupArFAQ'

export default function MakeupArPage() {
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
      <MakeupArHero />
      <MakeupArImmersive />
      <MakeupArHighlights />
      <MakeupArVersatile />
      <MakeupArSteps />
      <MakeupArFAQ />
    </main>
  )
}
