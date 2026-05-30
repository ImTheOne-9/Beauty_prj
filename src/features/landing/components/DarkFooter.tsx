import { Link } from 'react-router-dom'

// Inline SVG social icons (lucide-react version compat)
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
)
const IconYoutube = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
)
const IconTwitter = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
const IconLinkedin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const footerLinks = [
  {
    title: 'Platform & Services',
    links: ['AI Virtual Try-On', 'Skin Analysis AI', 'Face AR Filters', 'Smart Shade Finder', 'Hair Color AI', 'Nail Try-On'],
  },
  {
    title: 'By Industry',
    links: ['Beauty Brands', 'Fashion Retail', 'Skincare Brands', 'E-Commerce', 'Telecoms & Devices'],
  },
  {
    title: 'Technology',
    links: ['AI Solutions', 'SDK & API', 'Web & App SDK', 'AR Technology', 'Face AI Engine'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Press Room', 'Awards', 'Blog'],
  },
  {
    title: 'News & Events',
    links: ['Latest News', 'Events', 'Case Studies', 'Webinars', 'Newsletter'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Developer Docs', 'Privacy Policy', 'Terms of Service', 'Contact Us'],
  },
]

const socialLinks = [
  { icon: IconInstagram, label: 'Instagram', href: '#' },
  { icon: IconYoutube, label: 'YouTube', href: '#' },
  { icon: IconTwitter, label: 'X / Twitter', href: '#' },
  { icon: IconLinkedin, label: 'LinkedIn', href: '#' },
]

export default function DarkFooter() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-8">
        {/* Logo + tagline */}
        <div className="mb-10 flex flex-col items-start gap-2 border-b border-gray-800 pb-8">
          <Link to="/" className="font-display text-lg font-black tracking-[0.1em] text-white">
            ✦ LUMINA AI
          </Link>
          <p className="max-w-md text-sm text-gray-500">
            AI-powered virtual makeup try-on — see any look on your face in real time before you buy.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {footerLinks.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      to="#"
                      className="text-xs text-gray-500 transition hover:text-white"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-gray-800 pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Lumina AI. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 text-gray-500 transition hover:border-rose-500 hover:text-rose-400"
              >
                <Icon/>
              </a>
            ))}
          </div>

          <p className="text-xs text-gray-600">AI Makeup Virtual Try-On — powered by real-time face mapping.</p>
        </div>
      </div>
    </footer>
  )
}
