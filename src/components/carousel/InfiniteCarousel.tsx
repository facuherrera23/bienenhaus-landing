import { useRef, useEffect } from 'react'
import { CAROUSEL_ITEMS } from '../../constants'

export function InfiniteCarousel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    let animationId: number
    let speed = 0.5

    function animate() {
      if (!scroller) return
      scroller.scrollLeft += speed

      const halfScroll = scroller.scrollWidth / 2
      if (scroller.scrollLeft >= halfScroll) {
        scroller.scrollLeft = 0
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [])

  const items = [...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS]

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-surface-1 border-y border-border/40 py-5"
      aria-hidden="true"
    >
      <div
        ref={scrollerRef}
        className="flex gap-12 overflow-x-hidden whitespace-nowrap"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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

      {/* Edge gradients */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-surface-1 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-surface-1 to-transparent pointer-events-none z-10" />
    </div>
  )
}
