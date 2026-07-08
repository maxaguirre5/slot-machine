import { useState } from 'react'
import { simulateWinRate, type OutcomeOverride } from '../engine/outcomeEngine'

type DevPanelProps = {
  onSetOverride: (override: OutcomeOverride | undefined) => void
  pendingOverride?: OutcomeOverride
}

export function DevPanel({ onSetOverride, pendingOverride }: DevPanelProps) {
  const [bulkIterations, setBulkIterations] = useState('1000')
  const [bulkResult, setBulkResult] = useState<string | null>(null)

  const runBulkSimulation = () => {
    const iterations = Number.parseInt(bulkIterations, 10)

    if (!Number.isFinite(iterations) || iterations <= 0) {
      setBulkResult('Enter a positive number of spins.')
      return
    }

    const winRate = simulateWinRate(iterations)
    const percent = (winRate * 100).toFixed(1)
    setBulkResult(`${iterations} spins → ${percent}% wins`)
  }

  return (
    <wired-card className="dev-panel" elevation={2}>
      <h2>Dev Tools</h2>
      <p className="dev-note">
        Visible in development only. Use these to test outcomes quickly.
      </p>

      <div className="dev-actions">
        <wired-button onClick={() => onSetOverride('win')}>
          Force Win (next spin)
        </wired-button>
        <wired-button onClick={() => onSetOverride('loss')}>
          Force Loss (next spin)
        </wired-button>
        <wired-button onClick={() => onSetOverride(undefined)}>
          Clear Override
        </wired-button>
      </div>

      {pendingOverride ? (
        <p className="dev-status">Next spin override: {pendingOverride}</p>
      ) : (
        <p className="dev-status">Next spin override: none</p>
      )}

      <div className="dev-bulk">
        <label htmlFor="bulk-iterations">Bulk spin simulator</label>
        <div className="dev-bulk-row">
          <input
            id="bulk-iterations"
            type="number"
            min="1"
            value={bulkIterations}
            onChange={(event) => setBulkIterations(event.target.value)}
          />
          <wired-button onClick={runBulkSimulation}>Run</wired-button>
        </div>
        {bulkResult ? <p className="dev-result">{bulkResult}</p> : null}
      </div>
    </wired-card>
  )
}
