import { useEffect, useState } from 'react'

/** How long each reel holds a symbol before flipping to the next one. */
export const REEL_SPIN_CYCLE_MS = 180

type ReelProps = {
  symbol: number
  isSpinning: boolean
  spinCycleMs?: number
}

export function Reel({
  symbol,
  isSpinning,
  spinCycleMs = REEL_SPIN_CYCLE_MS,
}: ReelProps) {
  const [displaySymbol, setDisplaySymbol] = useState(symbol)

  useEffect(() => {
    if (!isSpinning) {
      setDisplaySymbol(symbol)
    }
  }, [isSpinning, symbol])

  useEffect(() => {
    if (!isSpinning) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setDisplaySymbol(Math.floor(Math.random() * 9) + 1)
    }, spinCycleMs)

    return () => window.clearInterval(intervalId)
  }, [isSpinning, spinCycleMs])

  return (
    <div className="reel" aria-label={`Reel showing ${displaySymbol}`}>
      <span className="reel-symbol">{displaySymbol}</span>
    </div>
  )
}
