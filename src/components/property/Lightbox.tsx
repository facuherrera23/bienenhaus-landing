import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Play, Pause, Maximize, Minimize } from 'lucide-react'
import { cn, proxyImgUrl } from '../../lib/utils'

interface LightboxProps {
  images: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

export function Lightbox({ images, initialIndex = 0, isOpen, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex)
  const [autoplay, setAutoplay] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrent(initialIndex)
  }, [initialIndex, isOpen])

  useEffect(() => {
    if (autoplay && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrent((p) => (p + 1) % images.length)
      }, 4000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoplay, images.length])

  const goTo = useCallback(
    (i: number) => {
      setCurrent(i)
      if (autoplay) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
          setCurrent((p) => (p + 1) % images.length)
        }, 4000)
      }
    },
    [autoplay],
  )

  const prev = useCallback(() => {
    goTo(current === 0 ? images.length - 1 : current - 1)
  }, [current, images.length, goTo])

  const next = useCallback(() => {
    goTo(current === images.length - 1 ? 0 : current + 1)
  }, [current, images.length, goTo])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose, prev, next])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-16 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Pantalla completa"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>

          <button
            onClick={() => setAutoplay((p) => !p)}
            className={cn(
              'absolute top-4 right-[7.5rem] z-10 p-2 rounded-full transition-colors',
              autoplay ? 'bg-accent text-white' : 'bg-white/10 hover:bg-white/20 text-white',
            )}
            aria-label={autoplay ? 'Pausar' : 'Autoplay'}
          >
            {autoplay ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>

          <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-white/10 rounded-full text-sm font-num text-white">
            {current + 1} / {images.length}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={proxyImgUrl(images[current])}
              alt={`Imagen ${current + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain select-none"
              draggable={false}
            />
          </AnimatePresence>

          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    i === current ? 'bg-accent w-6' : 'bg-white/30 hover:bg-white/60',
                  )}
                  aria-label={`Ir a imagen ${i + 1}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
