import { useEffect, useRef, useState } from 'react'
import { X, Box, Crosshair, ScrollText } from 'lucide-react'

import type { FeaturedArtifact } from '@/data/types'

/**
 * Museum-style inspection overlay. Shown when an object is selected in
 * the 3D scene (or via `?focus=<artifactId>`). Presents the catalog
 * badge, verified coordinates with their honest precision note, asset
 * provenance, an Exploded View toggle with clickable component callouts,
 * and the fixed 5-part narrative hierarchy.
 */

const NARRATIVE_TABS = [
  { key: 'story', label: '1 · The Story' },
  { key: 'mission', label: '2 · The Mission' },
  { key: 'engineering', label: '3 · The Engineering' },
  { key: 'fate', label: '4 · The Fate' },
  { key: 'legacy', label: '5 · The Legacy' },
] as const

type NarrativeKey = (typeof NARRATIVE_TABS)[number]['key']

export function InspectionOverlay({
  artifact,
  explodedRef,
  activeComponent,
  onActiveComponent,
  onClose,
}: {
  artifact: FeaturedArtifact
  explodedRef: React.MutableRefObject<number>
  activeComponent: string | null
  onActiveComponent: (id: string | null) => void
  onClose: () => void
}) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const lastFocusRef = useRef<HTMLElement | null>(null)

  // The overlay behaves as a modal dialog: move focus to it on open,
  // restore focus to the triggering control on dismissal.
  useEffect(() => {
    lastFocusRef.current = document.activeElement as HTMLElement | null
    if (overlayRef.current) {
      overlayRef.current.setAttribute('tabIndex', '-1')
      overlayRef.current.focus()
    }
    return () => {
      if (lastFocusRef.current && typeof lastFocusRef.current.focus === 'function') {
        lastFocusRef.current.focus()
      }
    }
  }, [])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const [tab, setTab] = useState<NarrativeKey>('story')
  const [exploded, setExploded] = useState(false)

  const toggleExploded = () => {
    const next = !exploded
    setExploded(next)
    explodedRef.current = next ? 1 : 0
    if (!next) onActiveComponent(null)
  }

  return (
    <aside
      ref={overlayRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Inspection of ${artifact.name}`}
      aria-describedby="artifact-description"
      className="ed-inspect"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(480px, 94vw)',
        zIndex: 40,
        overflowY: 'auto',
        background: 'rgba(12,11,10,0.94)',
        borderLeft: '1px solid rgba(232,200,106,0.35)',
        color: '#ece7d8',
        padding: '26px 26px 40px',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.22em',
              color: '#e8c86a',
              border: '1px solid rgba(232,200,106,0.5)',
              display: 'inline-block',
              padding: '3px 8px',
            }}
          >
            {artifact.catalog} · {artifact.body === 'moon' ? 'LUNAR SURFACE' : 'MARTIAN SURFACE'}
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.55rem',
              lineHeight: 1.15,
              margin: '12px 0 4px',
              fontWeight: 700,
            }}
          >
            {artifact.name}
          </h2>
          {artifact.designation && (
            <p
              id="artifact-description"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.12em',
                color: '#9a937f',
                margin: 0,
              }}
            >
              {artifact.designation}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inspection"
          style={{
            background: 'transparent',
            border: '1px solid rgba(236,231,216,0.3)',
            color: '#ece7d8',
            padding: 6,
            cursor: 'pointer',
            lineHeight: 0,
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Status */}
      <div
        style={{
          marginTop: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: artifact.status.scienceContinues ? '#7fd6a2' : '#d99a72',
        }}
      >
        {artifact.status.label}
        <span style={{ color: '#9a937f' }}> — {artifact.status.summary}</span>
      </div>

      <hr style={{ border: 0, borderTop: '1px solid rgba(236,231,216,0.18)', margin: '18px 0' }} />

      {/* Coordinates */}
      <section>
        <SectionTitle icon={<Crosshair size={11} />}>Verified coordinates</SectionTitle>
        {artifact.coordinate ? (
          <>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                margin: '6px 0 6px',
                color: '#ece7d8',
              }}
            >
              {artifact.coordinate.dms}
            </p>
            <Note>
              {artifact.coordinate.precision === 'site-vicinity' ? 'Site-vicinity — ' : ''}
              {artifact.coordinate.note}
            </Note>
            <Note style={{ color: '#8a8272' }}>Reference: {artifact.coordinate.referenceFrame}</Note>
          </>
        ) : (
          <Note>{artifact.coordinateUncertainty}</Note>
        )}
      </section>

      <hr style={{ border: 0, borderTop: '1px solid rgba(236,231,216,0.18)', margin: '18px 0' }} />

      {/* Provenance */}
      <section>
        <SectionTitle icon={<ScrollText size={11} />}>Asset provenance</SectionTitle>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10.5,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#e8c86a',
            margin: '6px 0 6px',
          }}
        >
          {artifact.provenance.label}
        </p>
        <Note>{artifact.provenance.note}</Note>
      </section>

      <hr style={{ border: 0, borderTop: '1px solid rgba(236,231,216,0.18)', margin: '18px 0' }} />

      {/* Exploded view */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionTitle icon={<Box size={11} />}>Exploded view</SectionTitle>
          <button
            type="button"
            onClick={toggleExploded}
            className="ed-btn-ghost"
            style={{
              borderColor: exploded ? '#e8c86a' : 'rgba(236,231,216,0.3)',
              color: exploded ? '#e8c86a' : '#ece7d8',
              background: 'transparent',
              fontSize: 10,
              padding: '6px 10px',
            }}
          >
            {exploded ? 'Assembled' : 'Explode'}
          </button>
        </div>
        <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
          {artifact.components.map((component) => {
            const active = activeComponent === component.id
            return (
              <button
                key={component.id}
                type="button"
                onClick={() => onActiveComponent(active ? null : component.id)}
                style={{
                  textAlign: 'left',
                  background: active ? 'rgba(232,200,106,0.12)' : 'rgba(236,231,216,0.05)',
                  border: `1px solid ${active ? 'rgba(232,200,106,0.6)' : 'rgba(236,231,216,0.12)'}`,
                  color: '#ece7d8',
                  padding: '9px 11px',
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <div style={{ fontSize: 10.5, letterSpacing: '0.1em' }}>{component.label}</div>
                <div
                  style={{
                    fontFamily: "'Newsreader', serif",
                    fontSize: 12,
                    color: '#b3ac99',
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  {component.description}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <hr style={{ border: 0, borderTop: '1px solid rgba(236,231,216,0.18)', margin: '18px 0' }} />

      {/* 5-part narrative */}
      <section>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {NARRATIVE_TABS.map((n) => (
            <button
              key={n.key}
              type="button"
              onClick={() => setTab(n.key)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9.5,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '6px 8px',
                cursor: 'pointer',
                border: '1px solid rgba(236,231,216,0.2)',
                background: tab === n.key ? 'rgba(232,200,106,0.16)' : 'transparent',
                color: tab === n.key ? '#e8c86a' : '#b3ac99',
              }}
            >
              {n.label}
            </button>
          ))}
        </div>
        <p
          style={{
            fontFamily: "'Newsreader', serif",
            fontSize: 14.5,
            lineHeight: 1.7,
            marginTop: 14,
            color: '#e6e0d0',
          }}
        >
          {artifact.narrative[tab]}
        </p>
      </section>

      {/* Sources */}
      <hr style={{ border: 0, borderTop: '1px solid rgba(236,231,216,0.18)', margin: '18px 0' }} />
      <section>
        <SectionTitle icon={<ScrollText size={11} />}>
          NASA primary sources
        </SectionTitle>
        <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'grid', gap: 6 }}>
          {artifact.sources.map((source) => (
            <li key={source.id}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#b3ac99',
                  fontFamily: "'Newsreader', serif",
                  fontSize: 12.5,
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                {source.title} — {source.publisher}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#9a937f',
        margin: 0,
        fontWeight: 500,
      }}
    >
      {icon}
      {children}
    </h3>
  )
}

function Note({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <p
      style={{
        fontFamily: "'Newsreader', serif",
        fontSize: 12.5,
        lineHeight: 1.55,
        color: '#b3ac99',
        margin: '4px 0 0',
        ...style,
      }}
    >
      {children}
    </p>
  )
}
