import { useState, useRef, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Instagram, Facebook, Mail, Send, CheckCircle } from 'lucide-react'
import { Container } from '../ui/Container'
import { useSettings } from '../../hooks/useSettings'
import { sendContact } from '../../api/valuations'
import { stagger, fadeUp } from '../../animations/variants'
import type { ContactData } from '../../types/api'

const socialLinks = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    getUrl: (s: { wa_number?: string; wa_number_2?: string }) =>
      `https://wa.me/${(s.wa_number || '').replace(/[^0-9]/g, '')}`,
    color: 'hover:border-accent/40',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    getUrl: (s: { instagram?: string }) => s.instagram || '#',
    color: 'hover:border-accent/40',
  },
  {
    icon: Facebook,
    label: 'Facebook',
    getUrl: (s: { facebook?: string }) => s.facebook || '#',
    color: 'hover:border-accent/40',
  },
  {
    icon: Mail,
    label: 'Email',
    getUrl: (s: { contact_email?: string }) => `mailto:${s.contact_email || ''}`,
    color: 'hover:border-accent/40',
  },
]

export function ContactSection() {
  const { data: settings } = useSettings()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const hp = (document.getElementById('contact_hp') as HTMLInputElement)?.value
    if (hp) return

    const ts = (document.getElementById('contact_ts') as HTMLInputElement)?.value
    if (ts && Date.now() - Number(ts) < 3000) return

    setSubmitting(true)

    try {
      await sendContact(formData as ContactData)
      setSuccess(true)
      formRef.current?.reset()
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al enviar. Intentalo de nuevo.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contacto" className="section-block bg-surface-1/50">
      <Container>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="section-heading"
        >
          <motion.span variants={fadeUp} className="eyebrow">
            CONTACTO
          </motion.span>
          <motion.h2 variants={fadeUp} className="section-title">
            ESTAMOS PARA AYUDARTE
          </motion.h2>
          <motion.div variants={fadeUp} className="section-line" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Social cards */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 gap-4"
          >
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <motion.a
                  key={social.label}
                  variants={fadeUp}
                  href={social.getUrl(settings || {})}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center gap-3 bg-surface-2 border border-border rounded-lg p-8 ${social.color} transition-colors text-center group`}
                >
                  <Icon
                    size={28}
                    className="text-text-secondary group-hover:text-accent transition-colors"
                  />
                  <span className="font-elegant text-sm text-text-secondary group-hover:text-white transition-colors">
                    {social.label}
                  </span>
                </motion.a>
              )
            })}

            {/* Phone number */}
            {settings?.contact_phone && (
              <motion.a
                variants={fadeUp}
                href={`tel:${settings.contact_phone}`}
                className="col-span-2 flex items-center justify-center gap-3 bg-surface-2 border border-border rounded-lg p-5 hover:border-accent/40 transition-colors group"
              >
                <span className="font-elegant text-sm text-text-secondary group-hover:text-white transition-colors">
                  {settings.contact_phone}
                </span>
              </motion.a>
            )}
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {success ? (
              <div className="flex flex-col items-center py-12 text-center bg-surface-2 border border-border rounded-lg">
                <CheckCircle size={48} className="text-accent mb-4" />
                <span className="font-display text-2xl uppercase tracking-tight text-white">
                  ¡Mensaje enviado!
                </span>
                <span className="font-desc text-sm text-text-secondary mt-2">
                  Te responderemos a la brevedad.
                </span>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-accent font-elegant text-sm hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="bg-surface-2 border border-border rounded-lg p-8 space-y-4"
              >
                {/* Honeypot */}
                <input
                  id="contact_hp"
                  name="website"
                  type="text"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />
                <input id="contact_ts" type="hidden" value={Date.now()} />

                <input
                  name="name"
                  placeholder="Nombre *"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-surface-3 border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
                />

                <input
                  name="email"
                  type="email"
                  placeholder="Email *"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surface-3 border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
                />

                <input
                  name="phone"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-surface-3 border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
                />

                <textarea
                  name="message"
                  placeholder="Mensaje *"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-surface-3 border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors resize-none"
                />

                {error && (
                  <p className="text-error font-desc text-xs">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-accent text-black font-elegant font-semibold text-sm py-4 px-6 rounded-md hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {submitting ? 'Enviando...' : (
                    <>
                      <Send size={16} />
                      Enviar Mensaje
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
