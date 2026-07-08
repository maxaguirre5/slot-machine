import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'wired-elements/lib/wired-button.js'
import 'wired-elements/lib/wired-card.js'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
