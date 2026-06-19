import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS, SITE_NAME } from '../constants'
import { useSettings } from '../hooks/useData'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { data: settings } = useSettings()

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-[72px]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl border-b border-border/40" />
      <div className="relative h-full max-w-container mx-auto px-5 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-xl text-white uppercase tracking-tight hover:text-accent transition-colors"
        >
          {SITE_NAME}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => {
            const isActive = link.path === '/'
              ? location.pathname === '/'
              : link.path.startsWith('/#')
                ? false
                : location.pathname.startsWith(link.path)
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-elegant text-xs tracking-wide uppercase transition-colors ${
                  isActive ? 'text-accent' : 'text-text-secondary hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* WhatsApp CTA */}
        <div className="hidden lg:flex items-center gap-4">
          {settings?.wa_number && (
            <a
              href={`https://wa.me/${settings.wa_number.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent text-black font-elegant font-semibold text-xs py-2 px-4 rounded-md hover:bg-accent-dark transition-colors"
            >
              WhatsApp
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-white p-2"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
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
            className="lg:hidden absolute top-full inset-x-0 bg-black/95 backdrop-blur-xl border-b border-border"
          >
            <nav className="flex flex-col py-6 px-5 gap-4" aria-label="Navegación móvil">
              {NAV_LINKS.map((link) => {
                const isActive = link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path)
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className={`font-elegant text-sm uppercase tracking-wide transition-colors ${
                      isActive ? 'text-accent' : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              {settings?.wa_number && (
                <a
                  href={`https://wa.me/${settings.wa_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent text-black font-elegant font-semibold text-sm text-center py-3 rounded-md mt-2"
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
