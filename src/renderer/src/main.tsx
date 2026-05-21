import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DiagnosticApp } from './diagnostic/DiagnosticApp'

const isDiagnostic = new URLSearchParams(window.location.search).has('diagnostic');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isDiagnostic ? <DiagnosticApp /> : <App />}
  </StrictMode>,
)
