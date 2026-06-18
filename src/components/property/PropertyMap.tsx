
import { cn } from '../../lib/utils'

interface PropertyMapProps {
  lat: number
  lng: number
  location?: string
  className?: string
}

export function PropertyMap({ lat, lng, location, className }: PropertyMapProps) {
  const query = `${lat},${lng}`
  const src = `https://www.google.com/maps/embed/v1/place?key=&q=${query}&center=${query}&zoom=15&maptype=roadmap`

  return (
    <div
      className={cn(
        'w-full h-[380px] max-sm:h-[280px] max-[400px]:h-[220px] rounded-lg overflow-hidden border border-border',
        className,
      )}
    >
      <iframe
        title={location ?? 'Ubicación'}
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0, filter: 'grayscale(1) invert(0.9) hue-rotate(180deg)' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}
