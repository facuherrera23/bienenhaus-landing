
import { MessageCircle } from 'lucide-react'
import { useSettings } from '../../hooks/useSettings'

export function WhatsAppFloat() {
  const { data: settings } = useSettings()
  const waNumber = settings?.wa_number || '5493510000000'
  const waUrl = `https://wa.me/${waNumber.replace(/\D/g, '')}`

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:bg-[#1da851] transition-colors hover:scale-105 active:scale-95"
      aria-label="WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}
