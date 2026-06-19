import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings } from '../hooks/useData'

interface NavLink {
  label: string
  path: string
  hash?: string
}

const NAV_LINKS: NavLink[] = [
  { label: 'Inicio', path: '/' },
  { label: 'Nosotros', path: '/#quienes' },
  { label: 'Comprar', path: '/venta' },
  { label: 'Alquilar', path: '/alquiler' },
  { label: 'Equipo', path: '/#agents' },
  { label: 'Contacto', path: '/#contact' },
  { label: 'Tasá tu propiedad', path: '/#tasacion' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { data: settings } = useSettings()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function isActive(link: NavLink) {
    if (link.path.startsWith('/#')) return false
    if (link.path === '/') return location.pathname === '/'
    return location.pathname.startsWith(link.path)
  }

  function handleNavClick(link: NavLink) {
    setMenuOpen(false)
    if (link.hash) {
      const section = document.getElementById(link.hash)
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const waLink = settings?.wa_number
    ? `https://wa.me/${settings.wa_number.replace(/[^0-9]/g, '')}`
    : null

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-[400ms] ${
        scrolled
          ? 'bg-black/92 border-b border-white/[0.06]'
          : 'bg-transparent border-b border-transparent'
      }`}
      style={{ backdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none' }}
    >
      {/* Accent gradient line on scroll */}
      {scrolled && (
        <div
          className="absolute bottom-[-1px] left-0 right-0 h-px opacity-40 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(32,184,171,0.28), #20b8ab, rgba(32,184,171,0.28), transparent)',
          }}
        />
      )}

      <div className="max-w-container mx-auto px-5 lg:px-12 h-[72px] lg:h-[72px] flex items-center gap-8">
        {/* Logo */}
        <Link to="/" className="flex-1 flex items-center gap-3">
          <img
            src="/bienenhaus-landing/images/logo-blanco.png"
            alt="Bienenhaus"
            className="h-14 w-auto transition-all duration-[350ms] ease-in-out"
            style={{
              opacity: scrolled ? 0.92 : 0,
              transform: scrolled ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.96)',
              visibility: scrolled ? 'visible' : 'hidden' as any,
            }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => handleNavClick(link)}
              className="group relative font-body text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors duration-200"
              style={{ color: isActive(link) ? '#20b8ab' : '#9a9a9a' }}
              onMouseEnter={(e) => { if (!isActive(link)) e.currentTarget.style.color = '#ffffff' }}
              onMouseLeave={(e) => { if (!isActive(link)) e.currentTarget.style.color = '#9a9a9a' }}
            >
              {link.label}
              <span
                className="absolute -bottom-[3px] left-0 right-0 h-px bg-accent transition-transform duration-250 origin-left"
                style={{
                  transform: isActive(link) ? 'scaleX(1)' : 'scaleX(0)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scaleX(1)' }}
                onMouseLeave={(e) => {
                  if (!isActive(link)) e.currentTarget.style.transform = 'scaleX(0)'
                }}
              />
            </Link>
          ))}
        </nav>

        {/* WhatsApp CTA */}
        <div className="hidden lg:flex items-center">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-accent border border-[rgba(32,184,171,0.28)] text-[10px] font-body font-bold tracking-[0.12em] uppercase py-[7px] px-[18px] transition-all duration-200 hover:bg-[rgba(32,184,171,0.18)] hover:border-accent hover:-translate-y-px"
              style={{ borderRadius: '2px' }}
            >
              WhatsApp
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden flex flex-col gap-[5px] bg-none border-none p-1"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <span className="block w-[22px] h-[1.5px] bg-[#9a9a9a] transition-all duration-250" />
          <span className="block w-[22px] h-[1.5px] bg-[#9a9a9a] transition-all duration-250" />
          <span className="block w-[22px] h-[1.5px] bg-[#9a9a9a] transition-all duration-250" />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-black/98 border-t border-b border-white/[0.06]"
          >
            <nav className="flex flex-col px-6 py-4 gap-1" aria-label="Navegación móvil">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => handleNavClick(link)}
                  className="font-body text-[10px] font-semibold tracking-[0.12em] uppercase py-3 border-b border-white/[0.06] transition-colors"
                  style={{ color: isActive(link) ? '#20b8ab' : '#9a9a9a' }}
                >
                  {link.label}
                </Link>
              ))}
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center bg-transparent text-accent border border-[rgba(32,184,171,0.28)] text-[10px] font-body font-bold tracking-[0.12em] uppercase py-3 rounded-sm mt-2 transition-all hover:bg-[rgba(32,184,171,0.18)] hover:border-accent"
                >
                  WhatsApp
                </a>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
