import { useEffect, useState } from 'react'

type ReelProps = {
  symbol: number
  isSpinning: boolean
  spinCycleMs?: number
}

export function Reel({ symbol, isSpinning, spinCycleMs = 80 }: ReelProps) {
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
