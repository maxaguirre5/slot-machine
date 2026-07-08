import { useState } from 'react'
import type { OutcomeOverride } from './engine/outcomeEngine'
import { DevPanel } from './components/DevPanel'
import { SlotMachine } from './components/SlotMachine'

function App() {
  const [outcomeOverride, setOutcomeOverride] = useState<
    OutcomeOverride | undefined
  >(undefined)

  return (
    <main className="app">
      <wired-card className="machine-shell" elevation={3}>
        <SlotMachine
          outcomeOverride={outcomeOverride}
          onOutcomeOverrideUsed={() => setOutcomeOverride(undefined)}
        />
      </wired-card>

      {import.meta.env.DEV ? (
        <DevPanel
          pendingOverride={outcomeOverride}
          onSetOverride={setOutcomeOverride}
        />
      ) : null}
    </main>
  )
}

export default App
