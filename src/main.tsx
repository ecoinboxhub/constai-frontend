import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Providers from './components/providers'
import App from './App'
import './index.css'
import { initErrorMonitor } from './lib/errorMonitor'

initErrorMonitor()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
