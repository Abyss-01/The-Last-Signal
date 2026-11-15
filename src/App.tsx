import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { UnifiedExpedition } from '@/pages/UnifiedExpedition'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UnifiedExpedition />} />
        <Route path="/expedition" element={<UnifiedExpedition />} />
        <Route path="*" element={<UnifiedExpedition />} />
      </Routes>
    </BrowserRouter>
  )
}
