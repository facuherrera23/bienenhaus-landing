import { useState } from 'react'

interface HeroBackgroundProps {
  video?: string
  poster?: string
}

export function HeroBackground({ video, poster }: HeroBackgroundProps) {
  const [loaded, setLoaded] = useState(false)
  const showPosterAsImage = !video && poster

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {/* Background image (static) */}
      {showPosterAsImage && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
      )}

      {/* Background video */}
      {video && (
        <>
          {poster && !loaded && (
            <img
              src={poster}
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
            poster={poster || undefined}
            onLoadedData={() => setLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={video} type="video/mp4" />
          </video>
        </>
      )}

      {/* Gradient fallback when neither video nor poster */}
      {!video && !poster && (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-surface-1 to-black" />
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
