import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Share2, Copy, Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import { fmtPrice, fmtPriceARS } from '../../lib/formatters'
import type { Property, Rental } from '../../types/property'
import { Button } from '../ui/Button'

interface PriceCardProps {
  property: Property | Rental
  operation: 'venta' | 'alquiler'
  onInquiryOpen: () => void
}

export function PriceCard({ property, operation, onInquiryOpen }: PriceCardProps) {
  const [copied, setCopied] = useState(false)
  const isRental = operation === 'alquiler'
  const price = isRental
    ? fmtPriceARS((property as Rental).price_ars)
    : fmtPrice((property as Property).price)
  const features = property.features ?? []
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
    }
  }

  const waShare = `https://wa.me/?text=${encodeURIComponent(`Mirá esta propiedad: ${property.title} - ${shareUrl}`)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="sticky top-24 bg-surface-2 border border-border rounded-lg overflow-hidden"
    >
      <div className="p-5 border-b border-border">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-num text-2xl font-bold text-accent">{price}</span>
        </div>
        {property.expenses && (
          <p className="text-xs text-text-muted font-desc">+ {property.expenses} expensas</p>
        )}
      </div>

      {features.length > 0 && (
        <div className="px-5 py-4 border-b border-border">
          <h4 className="text-2xs font-elegant tracking-wider uppercase text-text-muted mb-3">
            Características
          </h4>
          <ul className="space-y-1.5">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-text-secondary font-desc">
                <span className="mt-1 h-1 w-1 rounded-full bg-accent flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-5 space-y-3">
        <Button
          variant="whatsapp"
          size="md"
          className="w-full"
          href={waShare}
        >
          <MessageCircle className="h-4 w-4" />
          Consultar por WhatsApp
        </Button>

        <button
          onClick={onInquiryOpen}
          className="w-full text-center text-xs font-elegant tracking-wide text-text-secondary hover:text-accent transition-colors underline underline-offset-4"
        >
          Formulario de contacto
        </button>
      </div>

      <div className="px-5 pb-5 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" href={waShare}>
          <Share2 className="h-3.5 w-3.5" />
          WhatsApp
        </Button>
        <button
          onClick={handleCopyLink}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-2 font-elegant font-semibold rounded-md transition-all duration-200',
            'py-2 px-4 text-xs tracking-label',
            'bg-transparent text-text-secondary border border-white/20 hover:bg-white hover:text-bg hover:border-white',
          )}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copiar link
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}
