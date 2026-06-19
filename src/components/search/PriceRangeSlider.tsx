import { useCallback, useEffect, useRef, useState } from 'react'

interface PriceRangeSliderProps {
  min: number
  max: number
  valueMin: number
  valueMax: number
  onChange: (min: number, max: number) => void
  prefix?: string
}

export function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  prefix = 'USD',
}: PriceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [localMin, setLocalMin] = useState(valueMin)
  const [localMax, setLocalMax] = useState(valueMax)

  useEffect(() => {
    setLocalMin(valueMin)
    setLocalMax(valueMax)
  }, [valueMin, valueMax])

  const getPercent = useCallback(
    (val: number) => ((val - min) / (max - min)) * 100,
    [min, max]
  )

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), localMax - 1)
    setLocalMin(val)
    onChange(val, localMax)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), localMin + 1)
    setLocalMax(val)
    onChange(localMin, val)
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="font-elegant text-xs text-text-muted">
          {prefix} {localMin.toLocaleString()}
        </span>
        <span className="font-elegant text-xs text-text-muted">
          {prefix} {localMax.toLocaleString()}
        </span>
      </div>

      <div className="relative h-6" ref={trackRef}>
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-surface-3 rounded-full" />

        {/* Active track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 bg-accent/60 rounded-full"
          style={{
            left: `${getPercent(localMin)}%`,
            right: `${100 - getPercent(localMax)}%`,
          }}
        />

        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={localMin}
          onChange={handleMinChange}
          className="absolute inset-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:cursor-pointer"
          aria-label="Precio mínimo"
        />

        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={localMax}
          onChange={handleMaxChange}
          className="absolute inset-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:cursor-pointer"
          aria-label="Precio máximo"
        />
      </div>
    </div>
  )
}
