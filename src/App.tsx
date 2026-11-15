import { useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'

import { ArchivePage } from '@/pages/ArchivePage'
import { ExpeditionPage } from '@/pages/ExpeditionPage'

/**
 * Routing: `/` — archival broadsheet (paper), `/expedition` — the 3D
 * journey (dark void). The body class swaps the document chrome per
 * route so the expedition canvas sits on true black.
 */

function BodyTheme() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.body.classList.toggle('ed-void-body', pathname.startsWith('/expedition'))
    return () => document.body.classList.remove('ed-void-body')
  }, [pathname])
  return null
}

function NotFound() {
  return (
    <div className="ed-sheet" style={{ minHeight: '70vh', padding: '18vh 6vw', textAlign: 'center' }}>
      <h1 className="ed-serif" style={{ fontSize: '3rem', fontWeight: 900 }}>
        Page Not Filed
      </h1>
      <p className="ed-body">This page is not part of the archive.</p>
      <Link to="/" className="ed-btn" style={{ display: 'inline-block', marginTop: 20, textDecoration: 'none' }}>
        Return to the Broadsheet
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <BodyTheme />
      <Routes>
        <Route path="/" element={<ArchivePage />} />
        <Route path="/expedition" element={<ExpeditionPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
