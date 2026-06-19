import { useState } from 'react'

interface HeroBackgroundProps {
  video?: string
  poster?: string
}

export function HeroBackground({ video, poster }: HeroBackgroundProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {/* Static background image */}
      {!video && (
        <img
          src={poster || '/bienenhaus-landing/hero-bg.png'}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
      )}

      {/* Background video */}
      {video && (
        <>
          {!loaded && (
            <img
              src={poster || '/bienenhaus-landing/hero-bg.png'}
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
            poster={poster || '/bienenhaus-landing/hero-bg.png'}
            onLoadedData={() => setLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={video} type="video/mp4" />
          </video>
        </>
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
    </div>
  )
}
