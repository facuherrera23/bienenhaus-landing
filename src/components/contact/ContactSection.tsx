import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../../animations/variants'
import { submitContact } from '../../services'

export function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await submitContact(form)
      setSuccess(true)
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      setError('Error al enviar el mensaje. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-24 px-5 bg-surface-1" id="contacto" aria-label="Contacto">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-elegant text-2xs tracking-section uppercase text-accent mb-3 block">
            Contacto
          </span>
          <h2 className="font-display text-2xl md:text-3xl uppercase text-white">
            Hablemos
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Map */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-surface-2 border border-border rounded-lg overflow-hidden h-[250px] md:h-[400px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3404.713!2d-64.188776!3d-31.420083!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432a3f8d9c8b8f7%3A0x8f8e8d7c6b5a4f3e!2sC%C3%B3rdoba%2C%20Argentina!5e0!3m2!1ses!2sar!4v1"
              width="100%"
              height="100%"
              style={{ filter: 'grayscale(1) invert(0.9) hue-rotate(180deg)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Bienenhaus"
            />
          </motion.div>

          {/* Form */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 bg-surface-2 border border-border rounded-lg"
              >
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#20b8ab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="font-elegant font-semibold text-sm text-white">Mensaje enviado</p>
                <p className="font-desc text-xs text-text-secondary mt-2">
                  Te responderemos a la brevedad.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 text-accent font-elegant text-xs hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={fadeUp}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-surface-3 border border-border rounded-lg px-4 py-4 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-surface-3 border border-border rounded-lg px-4 py-4 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Teléfono (opcional)"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-surface-3 border border-border rounded-lg px-4 py-4 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <textarea
                    name="message"
                    placeholder="Mensaje"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className="w-full bg-surface-3 border border-border rounded-lg px-4 py-4 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors resize-none"
                  />
                </motion.div>

                {error && (
                  <p className="font-desc text-xs text-error">{error}</p>
                )}

                <motion.div variants={fadeUp}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-accent text-black font-elegant font-semibold text-sm py-4 rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </motion.div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
