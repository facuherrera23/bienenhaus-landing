import { CAROUSEL_ITEMS } from '../../constants'

export function InfiniteCarousel() {
  const items = [...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS]
  const duration = items.length * 4

  return (
    <div className="relative w-full overflow-hidden bg-surface-1 border-y border-border/40 py-5" aria-hidden="true">
      <div
        className="flex gap-12 whitespace-nowrap"
        style={{
          animation: `carousel-scroll ${duration}s linear infinite`,
        }}
      >
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center gap-12 font-elegant text-xs tracking-wide uppercase text-text-secondary select-none"
          >
            {item}
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent/80 flex-shrink-0" />
          </span>
        ))}
      </div>

      <style>{`
        @keyframes carousel-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-surface-1 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-surface-1 to-transparent pointer-events-none z-10" />
    </div>
  )
}
