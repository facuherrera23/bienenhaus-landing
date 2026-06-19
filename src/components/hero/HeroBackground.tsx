import { useState } from 'react'

interface HeroBackgroundProps {
  video?: string
  poster?: string
}

const DEFAULT_POSTER = '/bienenhaus-landing/hero-bg.png'

export function HeroBackground({ video, poster }: HeroBackgroundProps) {
  const [loaded, setLoaded] = useState(false)
  const imageSrc = poster || DEFAULT_POSTER
  const showPosterAsImage = !video && imageSrc

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {/* Background image (static fallback when no video) */}
      {showPosterAsImage && (
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
      )}

      {/* Background video */}
      {video && (
        <>
          {(poster || imageSrc) && !loaded && (
            <img
              src={poster || imageSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              aria-hidden="true"
            />
          )}
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={poster || imageSrc}
            onLoadedData={() => setLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={video} type="video/mp4" />
          </video>
        </>
      )}

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" aria-hidden="true" />
    </div>
  )
}
