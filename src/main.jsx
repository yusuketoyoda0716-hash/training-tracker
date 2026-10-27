import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// フォントはアプリに同梱する（外部サービスに依存しない）
import '@fontsource/klee-one/400.css'
import '@fontsource/klee-one/600.css'
import '@fontsource/zen-kaku-gothic-new/400.css'
import '@fontsource/zen-kaku-gothic-new/700.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
