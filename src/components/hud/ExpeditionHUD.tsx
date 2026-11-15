import { Link } from 'react-router-dom'
import { ArrowLeft, Volume2, VolumeX, Mic, MicOff, ChevronUp, ChevronDown } from 'lucide-react'

import type { TimelineAct } from '@/data/types'

/**
 * Minimalist editorial HUD: current era/year + act title, a chapter
 * scrubber for quick jumps, the synchronized captions bar, audio
 * controls (mute / volume / narration) and a return link to the
 * archival broadsheet.
 */

const controlStyle: React.CSSProperties = {
  background: 'rgba(12,11,10,0.72)',
  border: '1px solid rgba(232,200,106,0.35)',
  color: '#ece7d8',
  cursor: 'pointer',
  padding: 8,
  lineHeight: 0,
  backdropFilter: 'blur(4px)',
}

export function ExpeditionHUD({
  acts,
  actIndex,
  caption,
  muted,
  volume,
  narrationOn,
  onJump,
  onToggleMute,
  onVolumeChange,
  onToggleNarration,
  onInteract,
}: {
  acts: TimelineAct[]
  actIndex: number
  caption: string
  muted: boolean
  volume: number
  narrationOn: boolean
  onJump: (progress: number) => void
  onToggleMute: () => void
  onVolumeChange: (v: number) => void
  onToggleNarration: () => void
  onInteract: () => void
}) {
  const act = acts[Math.min(actIndex, acts.length - 1)]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
      {/* Top-left: era + act */}
      <div style={{ position: 'absolute', top: 24, left: 28 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.26em',
            color: 'rgba(236,231,216,0.55)',
          }}
        >
          EXPEDITION · {actIndex + 1}/{acts.length}
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.4rem',
            fontWeight: 700,
            color: '#f0e9d8',
            lineHeight: 1.05,
            marginTop: 4,
            textShadow: '0 2px 18px rgba(0,0,0,0.6)',
          }}
        >
          {act.year}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.2em',
            color: '#e8c86a',
            marginTop: 6,
            textTransform: 'uppercase',
          }}
        >
          {act.title}
        </div>
        <Link
          to="/"
          onClick={onInteract}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 14,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(236,231,216,0.75)',
            textDecoration: 'none',
            border: '1px solid rgba(236,231,216,0.25)',
            padding: '6px 10px',
            pointerEvents: 'auto',
            background: 'rgba(12,11,10,0.55)',
          }}
        >
          <ArrowLeft size={11} />
          Return to Archival Broadsheet
        </Link>
      </div>

      {/* Top-right: audio controls */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          aria-label={muted ? 'Unmute' : 'Mute'}
          onClick={() => {
            onInteract()
            onToggleMute()
          }}
          style={controlStyle}
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          aria-label="Volume"
          onChange={(event) => {
            onInteract()
            onVolumeChange(Number(event.target.value))
          }}
          style={{
            width: 90,
            accentColor: '#e8c86a',
            pointerEvents: 'auto',
          }}
        />
        <button
          type="button"
          aria-label={narrationOn ? 'Disable narration' : 'Enable narration'}
          onClick={() => {
            onInteract()
            onToggleNarration()
          }}
          style={{ ...controlStyle, opacity: narrationOn ? 1 : 0.55 }}
        >
          {narrationOn ? <Mic size={15} /> : <MicOff size={15} />}
        </button>
      </div>

      {/* Right: chapter scrubber */}
      <nav
        style={{
          position: 'absolute',
          right: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'grid',
          gap: 4,
          pointerEvents: 'auto',
        }}
        aria-label="Chapters"
      >
        {acts.map((a, i) => (
          <button
            key={a.id}
            type="button"
            onClick={() => {
              onInteract()
              onJump(a.range[0] + 0.005)
            }}
            title={a.title}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'flex-end',
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: i === actIndex ? '#e8c86a' : 'rgba(236,231,216,0.4)',
                opacity: i === actIndex ? 1 : 0,
                transition: 'opacity 0.3s',
                whiteSpace: 'nowrap',
              }}
            >
              {a.year}
            </span>
            <span
              style={{
                width: i === actIndex ? 26 : 12,
                height: 2,
                background: i === actIndex ? '#e8c86a' : 'rgba(236,231,216,0.35)',
                transition: 'all 0.3s',
              }}
            />
          </button>
        ))}
      </nav>

      {/* Bottom: captions bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 34,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 'min(720px, 86vw)',
          pointerEvents: 'none',
        }}
      >
        <div
          role="status"
          aria-live="polite"
          style={{
            background: 'rgba(12,11,10,0.78)',
            border: '1px solid rgba(236,231,216,0.2)',
            borderLeft: '3px solid #e8c86a',
            padding: '12px 18px',
            fontFamily: "'Newsreader', serif",
            fontSize: 14.5,
            lineHeight: 1.55,
            color: '#ece7d8',
            textAlign: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          {caption}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            marginTop: 10,
            opacity: 0.6,
          }}
        >
          <ChevronUp size={12} color="#ece7d8" />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8.5,
              letterSpacing: '0.3em',
              color: 'rgba(236,231,216,0.6)',
            }}
          >
            SCROLL
          </span>
          <ChevronDown size={12} color="#ece7d8" />
        </div>
      </div>
    </div>
  )
}
