# Objective

Build a classic three-reel slot machine proof of concept that feels fun and builds tension — reels spin together and stop one at a time. The player spins, sees a result, and tracks wins and losses over time.

# Target customer

Anyone who wants a quick, playful slot machine demo — for learning, prototyping, or showing off a hand-drawn UI style.

# Success

- Three reels spin and stop with staggered timing (left to right)
- Matching symbols on all three reels show "Winner!"; anything else shows "LOSER!"
- Wins occur exactly 25% of the time (designed outcomes, not fair random)
- Win/loss counter updates after each spin
- UI uses Wired Elements for a sketchy, hand-drawn look
- App runs locally with a single command

# What I believe

- Designed outcomes (decide win/loss first, then animate to result) are the right way to hit the 25% win rate without breaking the reel display logic
- Staggered reel stops create the tension that makes slot machines fun
- A score counter adds enough feedback without needing a betting economy for v1
- Wired Elements + a sketch font (Gloria Hallelujah) will give the app personality with minimal custom styling

# What I need to research

Nothing blocking — stack and approach are decided.

# Solution directions

Single-page React app at `~/slot-machine/` using Vite, TypeScript, and Wired Elements web components.

# Risks to validate + how to validate them cheaply/quickly

- **25% win rate drift** — Run ~100 spins via a dev helper and confirm win rate stays at 25%
- **Wired Elements + React integration** — Scaffold early; confirm custom elements render and respond to events
- **Animation jank** — Manual QA on staggered stops; reels must feel smooth, not flickery

---

# Detailed spec

## Overview

A browser-based three-reel slot machine. The player clicks Spin, all reels animate, reels stop left to right, a result message appears, and the win/loss counter updates. Outcomes are predetermined before animation begins.

## Architecture

```
┌─────────────────────────────────────┐
│           Slot Machine UI           │
│  ┌─────┐  ┌─────┐  ┌─────┐         │
│  │ R1  │  │ R2  │  │ R3  │         │
│  └─────┘  └─────┘  └─────┘         │
│  [ Spin ]          Wins: N Losses: M│
│  "Winner!" / "LOSER!"               │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│ Outcome Engine  │────▶│ Reel Controller  │
│ 25% win         │     │ staggered stops  │
│ pick triple     │     │ R1 → R2 → R3     │
└─────────────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Score Tracker   │
└─────────────────┘
```

## Technology

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Build | Vite | Fast dev server, minimal config |
| UI framework | React + TypeScript | Default for new projects; good agent ergonomics |
| UI components | [wired-elements](https://github.com/rough-stuff/wired-elements) | Required hand-drawn look |
| Font | Gloria Hallelujah (Google Fonts) | Matches Wired Elements aesthetic |
| Styling | Minimal CSS / inline layout | Wired Elements carry the visual identity; avoid Tailwind unless needed |

Dependencies stay minimal: `react`, `react-dom`, `wired-elements`, plus Vite/TS dev tooling.

## Core modules

### Outcome Engine

On each spin, before animation:

1. Roll win with 25% probability, loss with 75%
2. **Win:** pick random symbol 1–9; all three reels target that symbol
3. **Loss:** pick three symbols 1–9 such that they are **not** all equal (retry until valid)

Pure function, unit-testable. No dependency on UI state.

### Reel Controller

- Each reel displays symbols 1–9
- On spin start: all three cycle through symbols rapidly
- Staggered stop: reel 1 stops first, reel 2 ~0.5–1s later, reel 3 ~0.5–1s after reel 2
- Each reel lands on its predetermined target from the Outcome Engine
- Spin button disabled from spin start until reel 3 stops

### Score Tracker

- Two counters: wins and losses
- Increment the appropriate counter after reel 3 stops and the result message is shown
- Lives in React state; no persistence required for v1

### Slot Machine UI

- Three reel display areas showing the current symbol (large, readable)
- `wired-button` for Spin
- `wired-card` or equivalent for the machine frame
- Result message: **"Winner!"** (all three match) or **"LOSER!"** (any other combination)
- Score display: `Wins: N  Losses: M`
- Result message hidden or cleared when a new spin begins

## User flow

```
1. Player sees three reels (initial symbols), score counters at 0, Spin enabled
2. Player clicks Spin
3. Spin button disables; result message clears
4. Outcome Engine picks win/loss and target triple
5. All reels start cycling
6. Reel 1 stops on target → brief pause → Reel 2 stops → brief pause → Reel 3 stops
7. Result message appears ("Winner!" or "LOSER!")
8. Score counter increments
9. Spin button re-enables
```

## Requirements

### Functional

- Three reels, symbols 1 through 9 only
- Spin triggers animation; reels stop left to right with staggered timing
- Win = all three reels show the same symbol → display "Winner!"
- Loss = any other combination → display "LOSER!"
- Win rate exactly 25% per spin (designed outcomes)
- Track cumulative wins and losses across spins

### Non-functional

- Single `npm run dev` starts the app; playable in browser immediately
- No backend, no auth, no database
- Responsive enough for desktop browser; mobile polish out of scope

## Dev helpers (self-sufficiency)

Include hidden dev affordances for fast manual QA:

- **Force win / force loss** — dev-only toggles or keyboard shortcuts to override the Outcome Engine on the next spin
- **Bulk spin simulator** — dev-only control to run N spins and log win rate (validates 25% target without manual clicking)

Dev helpers must not appear in production builds or must be gated behind a dev flag (e.g. `import.meta.env.DEV`).

## Error handling

- Guard against double-clicks during spin (button disabled + state machine)
- If Wired Elements fail to load, show a clear fallback message in the DOM
- Outcome Engine loss-path loop must always terminate (at most a few retries for non-matching triple)

## Testing approach

| What | How |
|------|-----|
| Outcome Engine 25% rate | Unit test: mock RNG, run 1000 iterations, assert ~25% wins (± tolerance) |
| Outcome Engine loss triples | Unit test: never returns three matching symbols on loss path |
| Score increment | Unit test or component test: win increments wins, loss increments losses |
| Staggered animation | Manual QA: spin, confirm left-to-right stop order and timing |
| End-to-end feel | Manual QA walkthrough per spin flow |

## Security

Static client-only app — no user input beyond clicking Spin, no network calls, no secrets. No security surface beyond serving static files locally.

## Out of scope (parking lot)

- Credits, betting, or balance economy
- Sound effects
- Persisting score to localStorage
- Reset score button
- Mobile-specific layout polish
- Multiple paylines or partial matches
- Weighted/fair-random reel logic

---

# Implementation plan

## Open questions

- Reel stop stagger timing: use ~750ms between stops unless manual QA suggests otherwise
- Initial reel symbols on first load: random triple (any combination is fine)

## Tasks

### Phase 0: Scaffold & Wired Elements
☐ Initialize Vite + React + TypeScript project at `~/slot-machine/`
☐ Install `wired-elements`; register custom elements in the app entry point
☐ Add Gloria Hallelujah via Google Fonts
☐ Render a `wired-button` and `wired-card` on a placeholder page; confirm hand-drawn styling loads

### Phase 1: Outcome Engine
☐ Create pure Outcome Engine module with win/loss roll and triple generation
☐ Add unit tests for win rate (~25%), win triples (all match), and loss triples (never all match)
☐ Run tests; confirm all pass

### Phase 2: Playable game loop (no animation)
☐ Build SlotMachine layout: three reel displays, Spin button, score counters, result message area
☐ Wire Spin click → Outcome Engine → instant reel update → "Winner!" or "LOSER!" → increment score
☐ Disable Spin during the brief instant-update (prep for animation phase)
☐ Manual QA: spin 10 times, confirm messages and counters behave correctly

### Phase 3: Staggered reel animation
☐ Add reel cycling animation while spinning (all three cycle together)
☐ Stop reels left to right with staggered delay; each lands on predetermined target
☐ Show result message and update score only after reel 3 stops
☐ Disable Spin from spin start until reel 3 stops; clear result message on new spin
☐ Manual QA: confirm tension/build-up feel and correct stop order

### Phase 4: Dev helpers & verification
☐ Add dev-only force-win / force-loss controls (gated on `import.meta.env.DEV`)
☐ Add dev-only bulk spin simulator; log win rate over N iterations
☐ Run bulk simulator (~1000 spins); confirm win rate ≈ 25%
☐ Final manual QA walkthrough of full spin flow

---

## Phase 0: Scaffold & Wired Elements

**Affected files:**
- `~/slot-machine/` (new project root) — Vite React TS scaffold
- `package.json` — add `wired-elements` dependency
- `src/main.tsx` — import wired-elements; mount React app
- `src/App.tsx` — placeholder layout with `wired-card` and `wired-button`
- `index.html` — Gloria Hallelujah font link
- `src/index.css` — minimal layout and font-family

**Goal:** Runnable dev environment with Wired Elements rendering correctly.

**Done means:** `npm run dev` serves the app; browser shows hand-drawn card and button; no console errors about unknown custom elements.

**Test it:**
1. Run dev server
2. Open app in browser
3. Confirm sketchy hand-drawn appearance on wired components
4. Confirm Gloria Hallelujah font on text

---

## Phase 1: Outcome Engine

**Affected files:**
- `src/engine/outcomeEngine.ts` (new) — `generateOutcome()` pure function returning `{ isWin, symbols: [n1, n2, n3] }`
- `src/engine/outcomeEngine.test.ts` (new) — unit tests
- `vitest.config.ts` or `vite.config.ts` (modify if needed) — test runner setup

**Goal:** Testable core logic isolated from UI. Win/loss decided before any animation.

**Done means:** Tests pass. Win path always returns three matching symbols 1–9. Loss path never returns three matching symbols. Statistical test over 1000+ iterations confirms ~25% win rate (±5% tolerance).

**Test it:**
1. Run unit test suite
2. Expected: all Outcome Engine tests pass

---

## Phase 2: Playable game loop (no animation)

**Affected files:**
- `src/components/SlotMachine.tsx` (new) — main game component
- `src/components/Reel.tsx` (new) — single reel display showing current symbol
- `src/App.tsx` — render SlotMachine inside wired-card frame
- `src/index.css` — reel and score layout

**Goal:** End-to-end game logic without animation. Player can spin, see result, track score. Validates Outcome Engine integration before adding animation complexity.

**Done means:** Click Spin → three reels update instantly to outcome → "Winner!" or "LOSER!" appears → wins/losses counter increments. Spin disabled briefly during update.

**Test it:**
1. Run dev server
2. Click Spin 10 times
3. Confirm result message matches reel symbols (all match = Winner, else Loser)
4. Confirm score counters increment correctly
5. Confirm Spin re-enables after each spin

---

## Phase 3: Staggered reel animation

**Affected files:**
- `src/components/Reel.tsx` — cycling animation while spinning; stop on target symbol
- `src/components/SlotMachine.tsx` — spin state machine (idle → spinning → stopping → result); stagger reel 1 → 2 → 3
- `src/hooks/useReelAnimation.ts` (new, optional) — animation timing logic if it keeps components clean

**Goal:** Classic slot machine feel — all reels spin together, stop independently left to right, building tension.

**Done means:** On Spin, all reels cycle rapidly. Reel 1 stops first (~0.5–1s), then reel 2, then reel 3. Result message and score update only after reel 3 stops. Spin button disabled entire duration.

**Test it:**
1. Run dev server
2. Click Spin; watch all three reels cycle
3. Confirm reel 1 stops before reel 2, reel 2 before reel 3
4. Confirm result message appears only after all three stopped
5. Confirm score updates after result message
6. Try clicking Spin rapidly — confirm no double-spin

---

## Phase 4: Dev helpers & verification

**Affected files:**
- `src/components/DevPanel.tsx` (new) — force win, force loss, bulk spin simulator; only rendered in dev
- `src/engine/outcomeEngine.ts` — accept optional override param for forced outcomes (dev only)
- `src/App.tsx` — conditionally render DevPanel

**Goal:** Fast manual QA and statistical verification of the 25% win rate without clicking hundreds of times.

**Done means:** Dev panel visible only in dev mode. Force-win produces matching triple + "Winner!" on next spin. Force-loss produces non-matching triple + "LOSER!". Bulk simulator logs win rate ≈ 25% over 1000 spins.

**Test it:**
1. Run dev server
2. Use force-win → spin → confirm Winner and matching reels
3. Use force-loss → spin → confirm Loser and non-matching reels
4. Run bulk simulator (1000 spins) → confirm logged win rate between 20–30%
5. Run production build → confirm DevPanel not visible
