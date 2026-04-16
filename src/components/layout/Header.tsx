import { memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

const Header = memo(function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-glass-border/50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gradient" aria-label="SparkleClean Pro Home">
          <Sparkles className="w-6 h-6 text-neon-blue" aria-hidden="true" />
          SparkleClean Pro
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-neon-blue ${
                location.pathname === link.href ? 'text-neon-blue' : 'text-white/70'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/booking" className="glass-button-neon px-5 py-2 text-sm font-semibold">
            Get Quote
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-white/10 rounded-lg"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-glass-border/50 px-4 py-4 space-y-3" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm font-medium transition-colors hover:text-neon-blue ${
                location.pathname === link.href ? 'text-neon-blue' : 'text-white/70'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/booking"
            onClick={() => setMobileOpen(false)}
            className="block glass-button-neon px-5 py-2 text-sm font-semibold text-center"
          >
            Get Quote
          </Link>
        </nav>
      )}
    </header>
  )
})

export default Header
