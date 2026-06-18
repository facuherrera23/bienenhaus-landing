import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react'
import { Container } from '../ui/Container'
import { useSettings } from '../../hooks/useSettings'

export function Footer() {
  const { data: settings } = useSettings()

  const socialLinks = [
    { href: settings?.instagram || '#', icon: Instagram, label: 'Instagram' },
    { href: settings?.facebook || '#', icon: Facebook, label: 'Facebook' },
  ]

  return (
    <footer className="bg-surface-1 border-t border-border">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <Link
              to="/"
              className="font-display text-accent uppercase tracking-brand text-lg"
            >
              BIENENHAUS
            </Link>
            <p className="mt-4 text-sm text-text-secondary font-desc leading-relaxed max-w-xs">
              {settings?.site_description ||
                'Premium real estate in Córdoba. Find your perfect property with us.'}
            </p>
          </div>

          <div>
            <h4 className="text-xs tracking-section uppercase text-white font-elegant font-semibold mb-4">
              Navegación
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Inicio' },
                { to: '/venta', label: 'Venta' },
                { to: '/alquiler', label: 'Alquiler' },
                { to: '/#tasacion', label: 'Tasación' },
                { to: '/#contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.to}>
                  {link.to.startsWith('/#') ? (
                    <a
                      href={link.to}
                      className="text-sm text-text-secondary hover:text-white font-desc transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="text-sm text-text-secondary hover:text-white font-desc transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-section uppercase text-white font-elegant font-semibold mb-4">
              Contacto
            </h4>
            <ul className="space-y-3">
              {settings?.contact_email && (
                <li>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-white font-desc transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings?.contact_phone && (
                <li>
                  <a
                    href={`tel:${settings.contact_phone}`}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-white font-desc transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                    {settings.contact_phone}
                  </a>
                </li>
              )}
              <li>
                <span className="flex items-center gap-2 text-sm text-text-secondary font-desc">
                  <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                  Córdoba, Argentina
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-section uppercase text-white font-elegant font-semibold mb-4">
              Redes
            </h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 w-10 rounded-md border border-border text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-border py-5">
        <Container className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted font-desc">
            &copy; {new Date().getFullYear()} Bienenhaus. Todos los derechos reservados.
          </p>
          <p className="text-xs text-text-muted font-desc">
            CPI: 12345
          </p>
        </Container>
      </div>
    </footer>
  )
}
