import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, MessageCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Container } from '../ui/Container'
import { useSettings } from '../../hooks/useSettings'

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/venta', label: 'Venta' },
  { to: '/alquiler', label: 'Alquiler' },
  { to: '/#tasacion', label: 'Tasación' },
  { to: '/#contacto', label: 'Contacto' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: settings } = useSettings()
  const location = useLocation()

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  const waNumber = settings?.wa_number || '5493510000000'
  const waUrl = `https://wa.me/${waNumber.replace(/\D/g, '')}`

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300',
        scrolled
          ? 'bg-surface-1/80 backdrop-blur-lg border-b border-border'
          : 'bg-transparent',
      )}
    >
      <Container className="flex items-center justify-between h-full">
        <Link
          to="/"
          className="font-display text-accent uppercase tracking-brand text-lg md:text-xl"
        >
          BIENENHAUS
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.to.startsWith('/#') ? (
              <a
                key={link.to}
                href={link.to}
                className="text-xs tracking-label uppercase text-text-secondary hover:text-white font-elegant font-semibold transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'text-xs tracking-label uppercase font-elegant font-semibold transition-colors',
                    isActive ? 'text-accent' : 'text-text-secondary hover:text-white',
                  )
                }
              >
                {link.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 bg-[#25D366] text-white text-xs tracking-label font-elegant font-semibold px-4 py-2 rounded-md hover:bg-[#1da851] transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 bg-surface-1/95 backdrop-blur-lg border-b border-border"
          >
            <nav className="flex flex-col py-4 px-5 gap-1">
              {navLinks.map((link) =>
                link.to.startsWith('/#') ? (
                  <a
                    key={link.to}
                    href={link.to}
                    className="py-3 text-sm tracking-label uppercase text-text-secondary hover:text-white font-elegant font-semibold transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        'py-3 text-sm tracking-label uppercase font-elegant font-semibold transition-colors',
                        isActive ? 'text-accent' : 'text-text-secondary hover:text-white',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ),
              )}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-2 bg-[#25D366] text-white text-sm tracking-label font-elegant font-semibold py-3 rounded-md"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
