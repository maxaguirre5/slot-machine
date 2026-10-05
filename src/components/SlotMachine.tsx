import { useCallback, useMemo, useRef, useState } from 'react'
import {
  generateOutcome,
  type OutcomeOverride,
} from '../engine/outcomeEngine'
import { Reel, REEL_SPIN_CYCLE_MS } from './Reel'

// Stop times are whole multiples of the reel cycle so that each reel always
// shows the same number of symbol changes, no matter how fast the reels spin.
// Changing REEL_SPIN_CYCLE_MS rescales the spin duration instead of silently
// dropping frames.
const MIN_SPIN_CYCLES = 6
const STAGGER_CYCLES = 9

const MIN_SPIN_MS = REEL_SPIN_CYCLE_MS * MIN_SPIN_CYCLES
const STAGGER_MS = REEL_SPIN_CYCLE_MS * STAGGER_CYCLES

function randomInitialSymbols(): [number, number, number] {
  return [
    Math.floor(Math.random() * 9) + 1,
    Math.floor(Math.random() * 9) + 1,
    Math.floor(Math.random() * 9) + 1,
  ]
}

type SlotMachineProps = {
  outcomeOverride?: OutcomeOverride
  onOutcomeOverrideUsed?: () => void
}

export function SlotMachine({
  outcomeOverride,
  onOutcomeOverrideUsed,
}: SlotMachineProps) {
  const [symbols, setSymbols] = useState<[number, number, number]>(
    randomInitialSymbols,
  )
  const [reelSpinning, setReelSpinning] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ])
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const timeoutIds = useRef<number[]>([])

  const clearScheduledStops = useCallback(() => {
    for (const timeoutId of timeoutIds.current) {
      window.clearTimeout(timeoutId)
    }
    timeoutIds.current = []
  }, [])

  const scheduleStop = useCallback((callback: () => void, delayMs: number) => {
    const timeoutId = window.setTimeout(callback, delayMs)
    timeoutIds.current.push(timeoutId)
  }, [])

  const handleSpin = useCallback(() => {
    if (isSpinning) {
      return
    }

    clearScheduledStops()
    setIsSpinning(true)
    setResultMessage(null)
    setReelSpinning([true, true, true])

    const outcome = generateOutcome(Math.random, outcomeOverride)
    onOutcomeOverrideUsed?.()

    scheduleStop(() => {
      setSymbols((current) => {
        const next = [...current] as [number, number, number]
        next[0] = outcome.symbols[0]
        return next
      })
      setReelSpinning((current) => [false, current[1], current[2]])
    }, MIN_SPIN_MS)

    scheduleStop(() => {
      setSymbols((current) => {
        const next = [...current] as [number, number, number]
        next[1] = outcome.symbols[1]
        return next
      })
      setReelSpinning((current) => [current[0], false, current[2]])
    }, MIN_SPIN_MS + STAGGER_MS)

    scheduleStop(() => {
      setSymbols(outcome.symbols)
      setReelSpinning([false, false, false])
      setResultMessage(outcome.isWin ? 'Winner!' : 'LOSER!')
      if (outcome.isWin) {
        setWins((current) => current + 1)
      } else {
        setLosses((current) => current + 1)
      }
      setIsSpinning(false)
    }, MIN_SPIN_MS + STAGGER_MS * 2)
  }, [
    clearScheduledStops,
    isSpinning,
    onOutcomeOverrideUsed,
    outcomeOverride,
    scheduleStop,
  ])

  const spinLabel = useMemo(
    () => (isSpinning ? 'Spinning…' : 'Spin'),
    [isSpinning],
  )

  return (
    <div className="slot-machine">
      <h1 className="title">Slot Machine</h1>

      <div className="reels" aria-live="polite">
        {symbols.map((symbol, index) => (
          <Reel
            key={index}
            symbol={symbol}
            isSpinning={reelSpinning[index]}
          />
        ))}
      </div>

      {resultMessage ? (
        <p
          className={`result ${resultMessage === 'Winner!' ? 'result-win' : 'result-loss'}`}
          aria-live="assertive"
        >
          {resultMessage}
        </p>
      ) : (
        <p className="result result-empty">&nbsp;</p>
      )}

      <div className="controls">
        <wired-button disabled={isSpinning} onClick={handleSpin}>
          {spinLabel}
        </wired-button>
      </div>

      <p className="score">
        Wins: {wins} &nbsp; Losses: {losses}
      </p>
    </div>
  )
}
