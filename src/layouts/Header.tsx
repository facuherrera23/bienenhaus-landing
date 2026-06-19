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
    <>
      <style>{`
        #navbar {
          position: fixed; top:0; left:0; right:0; z-index:100;
          border-bottom: 1px solid transparent;
          transition: background .4s, border-color .4s, backdrop-filter .4s;
        }
        #navbar.scrolled {
          background: rgba(0,0,0,0.92);
          border-color: rgba(255,255,255,0.06);
          backdrop-filter: blur(20px) saturate(1.2);
        }
        #navbar.scrolled::after {
          content: '';
          position: absolute; bottom: -1px; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(32,184,171,0.28), #20b8ab, rgba(32,184,171,0.28), transparent);
          opacity: .4;
        }
        .nav-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 48px;
          height: 72px; display: flex; align-items: center; gap: 32px;
        }
        .nav-brand { flex: 1; display: flex; align-items: center; }
        .nav-links { display: flex; gap: 32px; }
        .nav-link {
          font-family: 'Poppins', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #9a9a9a; transition: color .2s; position: relative;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
          height: 1px; background: #20b8ab;
          transform: scaleX(0); transition: transform .25s cubic-bezier(.22,.61,.36,1);
        }
        .nav-link:hover { color: #ffffff; }
        .nav-link:hover::after { transform: scaleX(1); }
        .nav-link.active { color: #20b8ab; }
        .nav-link.active::after { transform: scaleX(1); }
        .nav-cta {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 7px 18px;
          background: transparent; color: #20b8ab;
          border: 1px solid rgba(32,184,171,0.28);
          font-family: 'Poppins', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          transition: all .2s cubic-bezier(.22,.61,.36,1);
        }
        .nav-cta:hover {
          background: rgba(32,184,171,0.18);
          border-color: #20b8ab;
          transform: translateY(-1px);
        }
        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; padding: 4px;
        }
        .hamburger span {
          display: block; width: 22px; height: 1.5px;
          background: #9a9a9a; transition: all .25s;
        }
        @media (max-width: 768px) {
          .nav-links, .hide-mobile { display: none !important; }
          .hamburger { display: flex; }
          .nav-inner { padding: 0 24px; }
        }
        #mobileMenu {
          display: none; flex-direction: column; gap: 4px;
          padding: 16px 24px 20px;
          background: rgba(0,0,0,0.98);
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        #mobileMenu.open { display: flex; }
        #mobileMenu .nav-link {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        #mobileMenu .nav-link::after { display: none; }
        .nav-logo {
          height: 56px; width: auto; display: block;
          opacity: 0; transform: translateY(-4px) scale(0.96);
          transition: opacity .35s ease, transform .35s ease, visibility .35s;
          visibility: hidden;
        }
        #navbar.scrolled .nav-logo {
          opacity: 0.92; transform: translateY(0) scale(1);
          visibility: visible;
        }
        #navbar.scrolled .nav-logo:hover { opacity: 1; }
      `}</style>

      <header id="navbar" className={scrolled ? 'scrolled' : ''}>
        <div className="nav-inner">
          <div className="nav-brand">
            <Link to="/">
              <img
                src="/bienenhaus-landing/images/logo-blanco.png"
                alt="Bienenhaus Propiedades"
                className="nav-logo"
              />
            </Link>
          </div>

          <div className="nav-links" id="navLinks">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => handleNavClick(link)}
                className={`nav-link${isActive(link) ? ' active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-cta hide-mobile"
            >
              WhatsApp
            </a>
          )}

          <button
            className="hamburger"
            id="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <div id="mobileMenu" className="open">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => handleNavClick(link)}
                  className={`nav-link${isActive(link) ? ' active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-cta"
                  style={{ marginTop: '8px', textAlign: 'center' }}
                >
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
