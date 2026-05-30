import { motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatedNavbar } from '@/shared/components/layout/AnimatedNavbar'
import { pageTransition } from '@/animations/motion'

export function AppLayout() {
  const location = useLocation()
  // Landing page: navbar is transparent, hero extends to top → no padding needed
  // All other pages: add top padding to clear the fixed 64px navbar
  const isLanding = location.pathname === '/'

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white">
      <AnimatedNavbar />
      <motion.main
        style={{ paddingTop: isLanding ? 0 : 'var(--app-header-height)' }}
        {...pageTransition}
      >
        <Outlet />
      </motion.main>
    </div>
  )
}
