import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X, Search } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { UserAccountMenu } from '@/shared/components/layout/UserAccountMenu'

// ─── Enterprise Mega Menu Data ──────────────────────────────────────────────
const enterpriseMenu = {
  title: 'Enterprise Services',
  subtitle:
    'Our most powerful AI & AR beauty, fashion, and skin tech solutions for larger & multi-nation brands with complex requirements and maximum scale',
  columns: [
    {
      heading: 'Makeup',
      headingColor: '#e91e8c',
      items: [
        { label: 'AR Makeup Virtual Try-On', to: '/virtual-makeup-try-on' },
      ],
    },
    {
      heading: 'Nail',
      headingColor: '#e91e8c',
      items: [{ label: 'Virtual Try-On for Nails', to: '/scan' }],
    },
  ],
  footer: [
    { label: 'CONTACT SALES', to: '/auth', isPrimary: true },
    { label: 'TRY OUR DEMO', to: '/scan', isOutline: true },
    { label: 'VIEW ALL PRODUCTS →', to: '/scan', isText: true },
  ],
}

// ─── Simple dropdown items ───────────────────────────────────────────────────
const simpleMenus: Record<string, { label: string; to: string }[]> = {
  Technologies: [
    { label: 'AgileHand™', to: '/scan' },
    { label: 'Makeup AR', to: '/scan' },
    { label: 'Live 3D Face AR', to: '/scan' },
    { label: 'Skincare AR', to: '/scan' },
    { label: 'Face AI', to: '/scan' },
  ],
  Resources: [
    { label: 'Blog', to: '/scan' },
    { label: 'Case Studies', to: '/scan' },
    { label: 'Documentation', to: '/scan' },
  ],
}

// ─── Top-level nav items ─────────────────────────────────────────────────────
const topNavItems = [
  { label: 'Enterprise', hasMenu: 'enterprise' },
  { label: 'Technologies', hasMenu: 'simple' },
  { label: 'Resources', hasMenu: 'simple' },
  { label: 'Pricing', to: '/plans', requireAuth: true },
  { label: 'Blog', to: '/scan' },
]

export function AnimatedNavbar() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Forward mouse wheel events to drawer when it's open
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!mobileOpen || !drawerRef.current) return
      drawerRef.current.scrollTop += e.deltaY
      e.preventDefault()
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [mobileOpen])

  // Detect scroll — threshold 80px to stay transparent over the video hero
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile drawer is open (works on iOS Safari)
  useEffect(() => {
    if (mobileOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [mobileOpen])
  useEffect(() => {
    setActiveMenu(null)
    setMobileOpen(false)
    setMobileExpandedMenu(null)
  }, [location.pathname])

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleMouseEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActiveMenu(label)
  }

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120)
  }

  const isLandingPage = location.pathname === '/'

  // Navbar is transparent on landing page when not scrolled
  const isTransparent = isLandingPage && !scrolled

  return (
    <header
      ref={navRef}
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
        isTransparent
          ? 'bg-transparent shadow-none'
          : 'bg-white shadow-[0_1px_0_rgba(0,0,0,0.08)]',
      )}
    >
      {/* ── Main nav bar ─────────────────────────────────────────────────── */}
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8" style={{ height: 64 }}>
        {/* Logo */}
        <Link
          to="/"
          className={cn(
            'flex-shrink-0 font-display text-2xl font-black tracking-[-0.03em] transition-colors',
            isTransparent ? 'text-gray-900' : 'text-rose-600',
          )}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          BEAUTY<span className={isTransparent ? 'text-rose-500' : 'text-rose-400'}>.</span>AI
        </Link>

        {/* Desktop nav items */}
        <nav className="hidden lg:flex items-center gap-1 ml-8">
          {topNavItems.map((item) => {
            const isActive = activeMenu === item.label
            const hasDropdown = !!item.hasMenu

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => hasDropdown && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                {item.to ? (
                  <NavLink
                    to={item.to}
                    onClick={item.requireAuth && !user ? (e) => { e.preventDefault(); navigate('/auth') } : undefined}
                    className={cn(
                      'flex items-center gap-0.5 rounded px-3 py-1.5 text-sm font-medium transition-colors',
                      isTransparent
                        ? 'text-gray-800 hover:text-rose-600'
                        : 'text-gray-700 hover:text-rose-600',
                    )}
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <button
                    className={cn(
                      'flex items-center gap-0.5 rounded px-3 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-rose-600'
                        : isTransparent
                          ? 'text-gray-800 hover:text-rose-600'
                          : 'text-gray-700 hover:text-rose-600',
                    )}
                    onClick={() => setActiveMenu(isActive ? null : item.label)}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        'ml-0.5 h-3.5 w-3.5 transition-transform duration-200',
                        isActive ? 'rotate-180' : '',
                      )}
                    />
                  </button>
                )}

                {/* Simple dropdown — vertical list, same top offset as Enterprise */}
                <AnimatePresence>
                  {isActive && item.hasMenu === 'simple' && simpleMenus[item.label] && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="fixed bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-50 min-w-[200px] py-2"
                      style={{ top: 64 }}
                      onMouseEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current) }}
                      onMouseLeave={handleMouseLeave}
                    >
                      {simpleMenus[item.label].map((menuItem) => (
                        <Link
                          key={menuItem.label}
                          to={menuItem.to}
                          onClick={() => setActiveMenu(null)}
                          className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          style={{ fontFamily: 'DM Sans, sans-serif' }}
                        >
                          {menuItem.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          <button
            aria-label="Search"
            className={cn(
              'p-2 rounded-full transition-colors hover:bg-gray-100',
              isTransparent ? 'text-gray-700' : 'text-gray-600',
            )}
          >
            <Search className="h-4 w-4" />
          </button>

          {user ? (
            <UserAccountMenu />
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                className={cn(
                  'text-sm font-medium transition-colors px-2 py-1',
                  isTransparent ? 'text-gray-800 hover:text-rose-600' : 'text-gray-700 hover:text-rose-600',
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/scan')}
                className="rounded-md bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-700 shadow-sm"
              >
                Try For Free
              </button>
            </>
          )}
        </div>

        {/* Mobile right: Sign In + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          {user ? (
            <UserAccountMenu />
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className={cn(
                'text-sm font-medium transition-colors px-2 py-1',
                isTransparent ? 'text-gray-800' : 'text-gray-700',
              )}
            >
              Sign In
            </button>
          )}
          <button
            className={cn(
              'p-2 rounded-md transition-colors',
              isTransparent ? 'text-gray-800' : 'text-gray-700',
            )}
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Enterprise Mega Menu ─────────────────────────────────────────── */}
      <AnimatePresence>
        {activeMenu === 'Enterprise' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)] border-t border-gray-100"
            onMouseEnter={() => {
              if (closeTimer.current) clearTimeout(closeTimer.current)
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
              {/* Header */}
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {enterpriseMenu.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500 max-w-3xl" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {enterpriseMenu.subtitle}
                </p>
              </div>

              {/* Columns grid */}
              <div className="flex gap-x-12 gap-y-6">
                {enterpriseMenu.columns.map((col) => (
                  <div key={col.heading}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: col.headingColor, fontFamily: 'DM Sans, sans-serif' }}>
                      {col.heading}
                    </p>
                    <ul className="space-y-1.5">
                      {col.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            to={item.to}
                            onClick={() => setActiveMenu(null)}
                            className="text-xs text-gray-600 hover:text-rose-600 transition-colors leading-snug block"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Footer actions */}
              <div className="mt-8 pt-5 border-t border-gray-100 flex items-center gap-4">
                {enterpriseMenu.footer.map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    onClick={() => setActiveMenu(null)}
                    className={cn(
                      'text-sm font-semibold transition-colors',
                      action.isPrimary &&
                        'rounded-md bg-rose-600 px-5 py-2 text-white hover:bg-rose-700',
                      action.isOutline &&
                        'rounded-md border border-gray-300 px-5 py-2 text-gray-700 hover:border-rose-400 hover:text-rose-600',
                      action.isText &&
                        'text-gray-700 hover:text-rose-600 px-2',
                    )}
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} style={{ zIndex: 0 }} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl flex flex-col"
              style={{ zIndex: 1 }}
            >
              <div ref={drawerRef} className="flex-1 overflow-y-auto overscroll-contain p-5" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex items-center justify-between mb-6">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-xl font-black text-rose-600"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  BEAUTY.AI
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {user && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2">
                  <p className="text-xs font-semibold text-rose-900">Account</p>
                  <UserAccountMenu onNavigate={() => setMobileOpen(false)} />
                </div>
              )}

              <nav className="flex flex-col gap-1">
                {topNavItems.map((item) => {
                  const isExpanded = mobileExpandedMenu === item.label
                  const hasSimple = item.hasMenu === 'simple' && simpleMenus[item.label]
                  const hasEnterprise = item.hasMenu === 'enterprise'

                  if (item.to) {
                    return (
                      <Link
                        key={item.label}
                        to={item.requireAuth && !user ? '/auth' : item.to}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        {item.label}
                      </Link>
                    )
                  }

                  return (
                    <div key={item.label}>
                      <button
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        onClick={() => setMobileExpandedMenu(isExpanded ? null : item.label)}
                      >
                        {item.label}
                        <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isExpanded ? 'rotate-180 text-rose-600' : '')} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {hasSimple && (
                              <div className="ml-3 border-l border-gray-100 pl-3 pb-1">
                                {simpleMenus[item.label].map((menuItem) => (
                                  <Link
                                    key={menuItem.label}
                                    to={menuItem.to}
                                    onClick={() => setMobileOpen(false)}
                                    className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                  >
                                    {menuItem.label}
                                  </Link>
                                ))}
                              </div>
                            )}

                            {hasEnterprise && (
                              <div className="ml-3 border-l border-gray-100 pl-3 pb-1 flex flex-col gap-3 mt-1">
                                {enterpriseMenu.columns.map((col) => (
                                  <div key={col.heading}>
                                    <p className="px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ color: col.headingColor }}>
                                      {col.heading}
                                    </p>
                                    {col.items.map((menuItem) => (
                                      <Link
                                        key={menuItem.label}
                                        to={menuItem.to}
                                        onClick={() => setMobileOpen(false)}
                                        className="block rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                      >
                                        {menuItem.label}
                                      </Link>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}

                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                  {!user ? (
                    <>
                      <Link
                        to="/auth"
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:border-rose-300 hover:text-rose-600 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/scan"
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg bg-rose-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                      >
                        Try For Free
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={() => { signOut(); setMobileOpen(false) }}
                      className="block w-full rounded-lg bg-rose-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  )}
                </div>
              </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}