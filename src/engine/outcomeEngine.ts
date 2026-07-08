export type Outcome = {
  isWin: boolean
  symbols: [number, number, number]
}

export type OutcomeOverride = 'win' | 'loss'

const WIN_RATE = 0.25
const SYMBOL_COUNT = 9

function randomSymbol(random: () => number): number {
  return Math.floor(random() * SYMBOL_COUNT) + 1
}

function generateLossTriple(random: () => number): [number, number, number] {
  const first = randomSymbol(random)
  let second = randomSymbol(random)
  let attempts = 0

  while (second === first && attempts < 20) {
    second = randomSymbol(random)
    attempts += 1
  }

  if (second === first) {
    second = (first % SYMBOL_COUNT) + 1
  }

  const third = randomSymbol(random)
  return [first, second, third]
}

export function generateOutcome(
  random: () => number = Math.random,
  override?: OutcomeOverride,
): Outcome {
  const isWin =
    override === 'win' ? true : override === 'loss' ? false : random() < WIN_RATE

  if (isWin) {
    const symbol = randomSymbol(random)
    return { isWin: true, symbols: [symbol, symbol, symbol] }
  }

  return { isWin: false, symbols: generateLossTriple(random) }
}

export function simulateWinRate(
  iterations: number,
  random: () => number = Math.random,
): number {
  let wins = 0

  for (let i = 0; i < iterations; i += 1) {
    if (generateOutcome(random).isWin) {
      wins += 1
    }
  }

  return wins / iterations
}
