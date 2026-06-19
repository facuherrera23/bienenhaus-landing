import { Link } from 'react-router-dom'
import { useSettings } from '../../hooks/useData'
import { NAV_LINKS, SITE_NAME } from '../../constants'

export function Footer() {
  const { data: settings } = useSettings()

  return (
    <footer className="bg-surface-1 border-t border-border" role="contentinfo">
      <div className="max-w-container mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-xl text-white uppercase tracking-tight">
              {SITE_NAME}
            </Link>
            <p className="font-desc text-xs text-text-secondary mt-4 leading-relaxed max-w-xs">
              Inmobiliaria premium en Córdoba. Compra, venta y alquiler de propiedades con
              asesoramiento profesional y tecnología de vanguardia.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-elegant font-semibold text-xs tracking-section uppercase text-white mb-4">
              Navegación
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-desc text-xs text-text-secondary hover:text-accent transition-colors inline-block py-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-elegant font-semibold text-xs tracking-section uppercase text-white mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              {settings?.contact_phone && (
                <li>
                  <a href={`tel:${settings.contact_phone}`} className="font-desc text-xs text-text-secondary hover:text-accent transition-colors inline-block py-2">
                    {settings.contact_phone}
                  </a>
                </li>
              )}
              {settings?.contact_email && (
                <li>
                  <a href={`mailto:${settings.contact_email}`} className="font-desc text-xs text-text-secondary hover:text-accent transition-colors inline-block py-2">
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings?.wa_number && (
                <li>
                  <a
                    href={`https://wa.me/${settings.wa_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-desc text-xs text-text-secondary hover:text-accent transition-colors inline-block py-2"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-elegant font-semibold text-xs tracking-section uppercase text-white mb-4">
              Redes
            </h3>
            <ul className="space-y-3">
              {settings?.instagram && (
                <li>
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-desc text-xs text-text-secondary hover:text-accent transition-colors inline-block py-2"
                  >
                    Instagram
                  </a>
                </li>
              )}
              {settings?.facebook && (
                <li>
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-desc text-xs text-text-secondary hover:text-accent transition-colors inline-block py-2"
                  >
                    Facebook
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-desc text-2xs text-text-muted">
            © {new Date().getFullYear()} {SITE_NAME}. Todos los derechos reservados.
          </p>
          <p className="font-desc text-2xs text-text-muted">
            Powered by Bienenhaus Tech
          </p>
        </div>
      </div>
    </footer>
  )
}
