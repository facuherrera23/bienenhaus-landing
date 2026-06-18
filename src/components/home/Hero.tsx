import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useSettings } from '../../hooks/useSettings'
import { stagger, fadeUp } from '../../animations/variants'

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
    <div className="flex flex-col items-center">
      <span className="font-num text-2xl md:text-3xl font-bold text-white">
        <CountUp end={value} suffix={suffix} />
      </span>
      <span className="font-desc text-2xs tracking-badge uppercase text-text-muted mt-1">
        {label}
      </span>
    </div>
  )
}

export function Hero() {
  const { data: settings } = useSettings()
  const [videoLoaded, setVideoLoaded] = useState(false)

  const hasVideo = Boolean(settings?.hero_video)
  const hasPoster = Boolean(settings?.hero_image)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background: video or grainy */}
      {hasVideo ? (
        <>
          {hasPoster && !videoLoaded && (
            <img
              src={settings!.hero_image!}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={settings?.hero_image || undefined}
            onLoadedData={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={settings!.hero_video!} type="video/mp4" />
          </video>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-surface-1 to-black" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Content */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center px-5 max-w-4xl mx-auto"
      >
        <motion.span
          variants={fadeUp}
          className="text-accent font-elegant text-2xs tracking-eyebrow uppercase mb-4"
        >
          CÓRDOBA · ARGENTINA
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="font-display text-[34px] md:text-4xl uppercase tracking-tight leading-none text-white"
        >
          BIENENHAUS
        </motion.h1>

        {settings?.hero_subtitle && (
          <motion.p
            variants={fadeUp}
            className="font-desc text-sm md:text-base text-text-secondary max-w-xl mt-5"
          >
            {settings.hero_subtitle}
          </motion.p>
        )}

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            to="/#tasacion"
            className="inline-flex items-center justify-center gap-2 bg-accent text-black font-elegant font-semibold text-sm py-4 px-8 rounded-md hover:bg-accent-dark transition-colors"
          >
            Tasar Propiedad
          </Link>
          <Link
            to="/venta"
            className="inline-flex items-center justify-center gap-2 border border-border text-text-secondary hover:text-white hover:border-text-muted font-elegant font-semibold text-sm py-4 px-8 rounded-md transition-colors"
          >
            Explorar
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats strip */}
      {(settings?.properties_count != null ||
        settings?.agents_count != null ||
        settings?.years_count != null ||
        settings?.trust_count != null) && (
        <div className="absolute bottom-0 inset-x-0 z-10">
          <div className="container-main">
            <div className="border-t border-border/60 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              {settings.properties_count != null && (
                <StatItem value={settings.properties_count} label="Propiedades" />
              )}
              {settings.agents_count != null && (
                <StatItem value={settings.agents_count} label="Agentes" />
              )}
              {settings.years_count != null && (
                <StatItem value={settings.years_count} label="Años" suffix="+" />
              )}
              {settings.trust_count != null && (
                <StatItem value={settings.trust_count} label="Confianza" suffix="%" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDown size={20} className="text-text-muted" />
      </motion.div>
    </section>
  )
}
