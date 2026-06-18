import { useState, useRef, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Send, CheckCircle } from 'lucide-react'
import { Container } from '../ui/Container'
import { sendTasacion } from '../../api/valuations'
import { stagger, fadeUp } from '../../animations/variants'
import type { TasacionData } from '../../types/api'

const propertyTypes = [
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'finca', label: 'Finca' },
  { value: 'local', label: 'Local' },
  { value: 'otro', label: 'Otro' },
]

const motivos = [
  { value: 'venta', label: 'Quiero vender' },
  { value: 'compra', label: 'Quiero comprar' },
  { value: 'alquiler', label: 'Quiero alquilar' },
  { value: 'tasacion', label: 'Solo tasación' },
  { value: 'otro', label: 'Otro' },
]

export function ValuationSection() {
  const [isOpen, setIsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    property_type: 'casa',
    motivo: 'venta',
    email: '',
    city: '',
    address: '',
    comments: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    // Honeypot check
    const hp = (document.getElementById('hp_website') as HTMLInputElement)?.value
    if (hp) return

    // Timestamp check
    const ts = (document.getElementById('ts') as HTMLInputElement)?.value
    if (ts && Date.now() - Number(ts) < 3000) return

    setSubmitting(true)

    try {
      await sendTasacion(formData as TasacionData)
      setSuccess(true)
      formRef.current?.reset()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al enviar. Intentalo de nuevo.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="tasacion" className="section-block bg-surface-1/50">
      <Container>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="section-heading"
        >
          <motion.span variants={fadeUp} className="eyebrow">
            TASACIÓN
          </motion.span>
          <motion.h2 variants={fadeUp} className="section-title">
            SOLICITÁ UNA TASACIÓN GRATUITA
          </motion.h2>
          <motion.div variants={fadeUp} className="section-line" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          {/* Accordion trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between bg-surface-2 border border-border rounded-lg p-6 hover:border-accent/30 transition-colors text-left"
          >
            <div>
              <span className="font-display text-xl uppercase tracking-tight">
                Completá el formulario
              </span>
              <span className="block font-desc text-sm text-text-secondary mt-1">
                Recibí una tasación profesional sin compromiso
              </span>
            </div>
            <ChevronDown
              size={20}
              className={`text-text-muted transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="bg-surface-2 border-x border-b border-border rounded-b-lg p-6">
                  {success ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <CheckCircle size={48} className="text-accent mb-4" />
                      <span className="font-display text-2xl uppercase tracking-tight text-white">
                        ¡Solicitud enviada!
                      </span>
                      <span className="font-desc text-sm text-text-secondary mt-2">
                        Te vamos a contactar a la brevedad.
                      </span>
                      <button
                        onClick={() => {
                          setSuccess(false)
                          setIsOpen(false)
                        }}
                        className="mt-6 text-accent font-elegant text-sm hover:underline"
                      >
                        Cerrar
                      </button>
                    </div>
                  ) : (
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                      {/* Honeypot */}
                      <input
                        id="hp_website"
                        name="website"
                        type="text"
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                      />
                      <input id="ts" type="hidden" value={Date.now()} />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          name="name"
                          placeholder="Nombre *"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-surface-3 border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
                        />
                        <input
                          name="phone"
                          placeholder="Teléfono *"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-surface-3 border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select
                          name="property_type"
                          value={formData.property_type}
                          onChange={handleChange}
                          className="w-full bg-surface-3 border border-border rounded-md px-4 py-3 text-sm text-white font-desc focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer"
                        >
                          {propertyTypes.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <select
                          name="motivo"
                          value={formData.motivo}
                          onChange={handleChange}
                          className="w-full bg-surface-3 border border-border rounded-md px-4 py-3 text-sm text-white font-desc focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer"
                        >
                          {motivos.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          name="email"
                          type="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-surface-3 border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
                        />
                        <input
                          name="city"
                          placeholder="Ciudad *"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full bg-surface-3 border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
                        />
                      </div>

                      <input
                        name="address"
                        placeholder="Dirección"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full bg-surface-3 border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
                      />

                      <textarea
                        name="comments"
                        placeholder="Comentarios adicionales"
                        rows={3}
                        value={formData.comments}
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
                            Solicitar Tasación
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Container>
    </section>
  )
}
