import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { sendContact } from '../../api/valuations'

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  propertyTitle: string
}

interface FormState {
  name: string
  email: string
  phone: string
  message: string
}

const initialForm: FormState = {
  name: '',
  email: '',
  phone: '',
  message: '',
}

export function InquiryModal({ isOpen, onClose, propertyTitle }: InquiryModalProps) {
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      setError('Nombre y email son obligatorios')
      return
    }
    setLoading(true)
    setError('')
    try {
      await sendContact({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: `${form.message.trim()}\n\n---\nConsulta desde: ${propertyTitle}`,
      })
      setSuccess(true)
      setTimeout(() => {
        setForm(initialForm)
        setSuccess(false)
        onClose()
      }, 2500)
    } catch {
      setError('Ocurrió un error al enviar. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setForm(initialForm)
      setSuccess(false)
      setError('')
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Consultar">
      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-8 gap-3"
        >
          <CheckCircle className="h-12 w-12 text-green-400" />
          <p className="text-sm font-desc text-text-secondary text-center">
            Consulta enviada con éxito. Te responderemos a la brevedad.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-xs text-text-muted font-desc mb-4">
            Consultando sobre: <span className="text-white font-semibold">{propertyTitle}</span>
          </div>

          <Input
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            required
          />

          <Input
            label="Teléfono"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+54 9 351 ..."
          />

          <div className="w-full">
            <label className="block text-xs tracking-label uppercase text-text-secondary font-elegant font-semibold mb-2">
              Mensaje
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              placeholder="Escribí tu consulta..."
              className={cn(
                'w-full bg-surface-2 border rounded-md px-4 py-3 text-sm text-white font-desc placeholder:text-text-muted resize-none',
                'transition-colors duration-200',
                'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
                'border-border',
              )}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-error font-desc">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-md font-elegant font-semibold transition-all duration-200 text-sm py-3 px-6 bg-accent text-black hover:bg-accent-dark" disabled={loading}>
            <Send className="h-4 w-4" />
            {loading ? 'Enviando...' : 'Enviar consulta'}
          </button>
        </form>
      )}
    </Modal>
  )
}
