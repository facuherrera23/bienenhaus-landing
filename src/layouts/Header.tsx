import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
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
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const waLink = settings?.wa_number
    ? `https://wa.me/${settings.wa_number.replace(/[^0-9]/g, '')}`
    : null

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-[400ms] ${
        scrolled
          ? 'bg-[rgba(0,0,0,0.92)] border-white/10'
          : 'bg-transparent border-transparent'
      }`}
      style={{
        backdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none',
      }}
    >
      {/* Accent line on scroll */}
      <div
        className={`absolute bottom-[-1px] left-0 right-0 h-px pointer-events-none transition-opacity duration-[400ms] ${
          scrolled ? 'opacity-40' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(32,184,171,0.28), #20b8ab, rgba(32,184,171,0.28), transparent)',
        }}
      />

      <div className="max-w-container mx-auto px-5 lg:px-12 h-[72px] flex items-center">
        {/* Brand / Logo */}
        <Link to="/" className="flex-1 flex items-center">
          <img
            src="/bienenhaus-landing/images/logo-blanco.png"
            alt="Bienenhaus Propiedades"
            className="h-14 w-auto"
            style={{
              opacity: scrolled ? 0.92 : 0,
              transform: scrolled ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.96)',
              visibility: scrolled ? 'visible' : 'hidden',
              transition: 'opacity 0.35s ease, transform 0.35s ease, visibility 0.35s',
            }}
          />
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => handleNavClick(link)}
              className="relative font-body text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors duration-200 group"
              style={{ color: isActive(link) ? '#20b8ab' : '#9a9a9a' }}
              onMouseEnter={(e) => { if (!isActive(link)) e.currentTarget.style.color = '#ffffff' }}
              onMouseLeave={(e) => { if (!isActive(link)) e.currentTarget.style.color = '#9a9a9a' }}
            >
              {link.label}
              <span
                className="absolute -bottom-[4px] left-0 right-0 h-px bg-accent transition-transform duration-250 origin-left"
                style={{
                  transform: isActive(link) ? 'scaleX(1)' : 'scaleX(0)',
                  transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
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
        <div className="hidden lg:flex items-center ml-8">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-accent border text-[10px] font-body font-bold tracking-[0.12em] uppercase px-[18px] py-[7px] transition-all duration-200 hover:-translate-y-px"
              style={{
                borderColor: 'rgba(32,184,171,0.28)',
                borderRadius: '2px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(32,184,171,0.18)'
                e.currentTarget.style.borderColor = '#20b8ab'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(32,184,171,0.28)'
              }}
            >
              WhatsApp
            </a>
          )}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden flex flex-col gap-[5px] bg-none border-none p-1 ml-4"
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
          <div className="lg:hidden bg-[rgba(0,0,0,0.98)] border-t border-b border-white/[0.06]">
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
                  className="block text-center bg-transparent text-accent border text-[10px] font-body font-bold tracking-[0.12em] uppercase py-3 mt-2 transition-all"
                  style={{
                    borderColor: 'rgba(32,184,171,0.28)',
                    borderRadius: '2px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(32,184,171,0.18)'
                    e.currentTarget.style.borderColor = '#20b8ab'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'rgba(32,184,171,0.28)'
                  }}
                >
                  WhatsApp
                </a>
              )}
            </nav>
          </div>
        )}
      </AnimatePresence>
    </header>
  )
}
