import { Link, NavLink, Outlet } from 'react-router-dom'
import { Moon, Satellite } from 'lucide-react'

import { EXPEDITIONS } from '@/data/expeditions'

const NAV_LINKS = [
  { to: '/', label: 'Archive' },
  { to: '/expeditions', label: 'Expeditions' },
]

/**
 * Application shell: fixed mission-control header, content outlet and a
 * telemetry-style status footer. Every routed view renders inside this frame.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-charcoal-700 bg-charcoal-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 text-lunar-100 transition-colors hover:text-cyan-signal"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center border border-charcoal-600 bg-charcoal-800">
              <Satellite className="h-4.5 w-4.5 text-cyan-signal" aria-hidden="true" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold tracking-wide">
                Abandoned but not Forgotten
              </span>
              <span className="data-label hidden text-lunar-400 sm:block">
                Space archaeology archive
              </span>
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="ml-auto flex shrink-0 items-center gap-1"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `data-label px-2 py-2 transition-colors sm:px-3 ${
                    isActive
                      ? 'text-cyan-signal'
                      : 'text-lunar-400 hover:text-lunar-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-charcoal-700 bg-charcoal-950/85">
        <div className="data-label mx-auto flex w-full max-w-7xl items-center gap-6 px-6 py-4 text-lunar-400">
          <span className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5" aria-hidden="true" />
            Archive console
          </span>
          <span className="hidden sm:inline">
            Expeditions registered: {EXPEDITIONS.length}
          </span>
          <span className="ml-auto hidden md:inline">
            Link status
            <span
              aria-hidden="true"
              className="ml-2 inline-block h-1.5 w-1.5 animate-signal-pulse rounded-full bg-amber-signal align-middle"
            />
            <span className="ml-1.5 text-amber-signal">Standby</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
