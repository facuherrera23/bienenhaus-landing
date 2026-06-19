import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useSettings } from '../../hooks/useData'
import { stagger, fadeUp } from '../../animations/variants'
import { HeroBackground } from './HeroBackground'
import { HeroContent } from './HeroContent'

function CountUp({
  end,
  suffix = '',
  duration = 2000,
}: {
  end: number
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)
  const [hasCounted, setHasCounted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasCounted) {
          setHasCounted(true)
          const start = performance.now()
          let raf: number

          function animate(now: number) {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.floor(eased * end))
            if (progress < 1) {
              raf = requestAnimationFrame(animate)
            }
          }

          raf = requestAnimationFrame(animate)
          return () => cancelAnimationFrame(raf)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration, hasCounted])

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  )
}

function StatItem({
  value,
  label,
  suffix = '',
}: {
  value: number
  label: string
  suffix?: string
}) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col items-center">
      <span className="font-num text-xl md:text-2xl lg:text-3xl font-bold text-white truncate max-w-full">
        <CountUp end={value} suffix={suffix} />
      </span>
      <span className="font-desc text-2xs tracking-badge uppercase text-text-muted mt-1">
        {label}
      </span>
    </motion.div>
  )
}

export function HeroSection() {
  const { data: settings } = useSettings()

  const hasStats =
    settings?.properties_count != null ||
    settings?.agents_count != null ||
    settings?.years_count != null ||
    settings?.trust_count != null

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
      aria-label="Hero principal"
    >
      <HeroBackground video={settings?.hero_video || undefined} poster={settings?.hero_image || undefined} />

      <HeroContent subtitle={settings?.hero_subtitle || undefined} />

      {/* Stats strip */}
      {hasStats && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="absolute bottom-0 inset-x-0 z-10"
        >
          <div className="max-w-container mx-auto px-5">
            <div className="border-t border-border/60 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              {settings!.properties_count != null && (
                <StatItem value={settings!.properties_count!} label="Propiedades" />
              )}
              {settings!.agents_count != null && (
                <StatItem value={settings!.agents_count!} label="Agentes" />
              )}
              {settings!.years_count != null && (
                <StatItem value={settings!.years_count!} label="Años" suffix="+" />
              )}
              {settings!.trust_count != null && (
                <StatItem value={settings!.trust_count!} label="Confianza" suffix="%" />
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10"
        aria-hidden="true"
      >
        <ChevronDown size={20} className="text-text-muted" />
      </motion.div>
    </section>
  )
}
