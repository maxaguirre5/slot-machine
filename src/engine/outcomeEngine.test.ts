import { describe, expect, it } from 'vitest'
import { generateOutcome, simulateWinRate } from './outcomeEngine'

describe('generateOutcome', () => {
  it('returns matching symbols on forced win', () => {
    const outcome = generateOutcome(() => 0, 'win')
    expect(outcome.isWin).toBe(true)
    expect(outcome.symbols[0]).toBe(outcome.symbols[1])
    expect(outcome.symbols[1]).toBe(outcome.symbols[2])
    expect(outcome.symbols[0]).toBeGreaterThanOrEqual(1)
    expect(outcome.symbols[0]).toBeLessThanOrEqual(9)
  })

  it('returns non-matching symbols on forced loss', () => {
    const outcome = generateOutcome(() => 0, 'loss')
    expect(outcome.isWin).toBe(false)
    expect(
      outcome.symbols[0] === outcome.symbols[1] &&
        outcome.symbols[1] === outcome.symbols[2],
    ).toBe(false)
  })

  it('uses symbols between 1 and 9', () => {
    for (let i = 0; i < 100; i += 1) {
      const outcome = generateOutcome(Math.random)
      for (const symbol of outcome.symbols) {
        expect(symbol).toBeGreaterThanOrEqual(1)
        expect(symbol).toBeLessThanOrEqual(9)
      }
    }
  })

  it('wins approximately 25% of the time', () => {
    const winRate = simulateWinRate(10_000, Math.random)
    expect(winRate).toBeGreaterThanOrEqual(0.2)
    expect(winRate).toBeLessThanOrEqual(0.3)
  })

  it('respects deterministic win threshold', () => {
    const winOutcome = generateOutcome(() => 0.24)
    expect(winOutcome.isWin).toBe(true)

    const lossOutcome = generateOutcome(() => 0.25)
    expect(lossOutcome.isWin).toBe(false)
  })
})
