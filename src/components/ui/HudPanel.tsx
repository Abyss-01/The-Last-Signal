import type { ReactNode } from 'react'

/**
 * Mission-control panel with corner brackets. The base surface comes from the
 * `hud-panel` utility in the design system; this component adds the HUD
 * corner accents and consistent padding.
 */

interface HudPanelProps {
  children: ReactNode
  className?: string
  /** Accessible label when the panel represents a distinct console section. */
  label?: string
}

export function HudPanel({ children, className = '', label }: HudPanelProps) {
  return (
    <section aria-label={label} className={`hud-panel p-6 ${className}`}>
      <Corner position="top-left" />
      <Corner position="top-right" />
      <Corner position="bottom-left" />
      <Corner position="bottom-right" />
      {children}
    </section>
  )
}

type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const CORNER_CLASSES: Record<CornerPosition, string> = {
  'top-left': 'top-0 left-0 border-t border-l',
  'top-right': 'top-0 right-0 border-t border-r',
  'bottom-left': 'bottom-0 left-0 border-b border-l',
  'bottom-right': 'bottom-0 right-0 border-b border-r',
}

function Corner({ position }: { position: CornerPosition }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-2.5 w-2.5 border-cyan-signal ${CORNER_CLASSES[position]}`}
    />
  )
}
