import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { ArrowDown, RotateCcw, Layers } from 'lucide-react'

import { getArtifact } from '@/data/artifacts'
import type { FeaturedArtifact } from '@/data/types'
import { soundEngine } from '@/audio/SoundEngine'
import type { SoundEnvironment } from '@/audio/SoundEngine'
import { ACTS, getAct, SCROLL_VH } from '@/scene/ScrollChoreography'
import { ExpeditionHUD } from '@/components/hud/ExpeditionHUD'
import { InspectionOverlay } from '@/components/inspection/InspectionOverlay'

gsap.registerPlugin(ScrollTrigger)

const SceneCanvas = lazy(async () => {
  const { SceneCanvas: Canvas } = await import('@/scene/SceneCanvas')
  return { default: Canvas }
})

const ENV_BY_ACT: Record<string, SoundEnvironment> = {
  'broadsheet-pad': 'earth',
  'saturn-v-launch': 'earth',
  'space-staging': 'cislunar',
  'cislunar-wormhole': 'transition',
  'lunar-module-breakdown': 'moon',
  'lunar-archaeology': 'moon',
  'earthrise-loop': 'cislunar',
}

export function UnifiedExpedition() {
  const [searchParams] = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollProgressRef = useRef(0)
  const explodedRef = useRef(0)
  const lenisRef = useRef<Lenis | null>(null)

  const [progressState, setProgressState] = useState(0)
  const [focusArtifact, setFocusArtifact] = useState<FeaturedArtifact | null>(null)
  const [activeComponent, setActiveComponent] = useState<string | null>(null)
  const [actIndex, setActIndex] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.6)
  const [narrationOn, setNarrationOn] = useState(false)

  // 1. Lenis Smooth Scroll Engine
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    function update(time: number) {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])

  // 2. ScrollTrigger Synchronization across 1100vh
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const proxy = { p: 0 }
    const tween = gsap.to(proxy, {
      p: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.0,
        onUpdate: () => {
          scrollProgressRef.current = proxy.p
          setProgressState(proxy.p)

          // Update explodedRef for inspection consistency
          if (proxy.p >= 0.58 && proxy.p <= 0.76) {
            explodedRef.current = (proxy.p - 0.58) / 0.18
          } else {
            explodedRef.current = 0
          }
        },
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  // 3. Audio Environment & Narration Sync
  useEffect(() => {
    let raf = 0
    let currentAct = ''
    const tick = () => {
      const p = scrollProgressRef.current
      const act = getAct(p)
      if (act.id !== currentAct) {
        currentAct = act.id
        setActIndex(ACTS.indexOf(act))
        soundEngine.setEnvironment(ENV_BY_ACT[act.id] ?? 'cislunar')
        if (narrationOn) soundEngine.narrate(act.caption)
      }

      // Launch atmospheric rumble
      const inAtmosphere = p > 0.12 && p < 0.28
      soundEngine.setRumble(
        inAtmosphere ? Math.max(0, 1 - Math.abs(p - 0.20) / 0.08) * 0.95 : 0
      )

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [narrationOn])

  // Audio settings
  useEffect(() => {
    soundEngine.setMuted(muted)
  }, [muted])
  useEffect(() => {
    soundEngine.setVolume(volume)
  }, [volume])
  useEffect(() => {
    if (!narrationOn) soundEngine.stopNarration()
  }, [narrationOn])

  // Audio start on first gesture
  useEffect(() => {
    const startAudio = () => {
      soundEngine.start()
    }
    window.addEventListener('pointerdown', startAudio, { once: true })
    window.addEventListener('wheel', startAudio, { once: true })
    window.addEventListener('keydown', startAudio, { once: true })
    return () => {
      window.removeEventListener('pointerdown', startAudio)
      window.removeEventListener('wheel', startAudio)
      window.removeEventListener('keydown', startAudio)
    }
  }, [])

  // Handle URL focus parameter
  useEffect(() => {
    const focusId = searchParams.get('focus')
    if (focusId) {
      const found = getArtifact(focusId)
      if (found) setFocusArtifact(found)
    }
  }, [searchParams])

  // Infinite Loop scrollToTop handler
  const handleLoopBack = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 2.2 })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Calculate Newspaper Broadsheet Zoom / Fade Envelope
  const p = progressState
  const newspaperOpacity = Math.max(0, 1 - Math.pow(p / 0.10, 1.4))
  const newspaperTranslate = p * 120
  const photoScale = 1 + (p / 0.10) * 4.6
  const photoOpacity = Math.max(0, 1 - (p - 0.075) / 0.035)

  const isBroadsheetInteractive = p < 0.075
  const isHUDVisible = p >= 0.09
  const isBreakdownActive = p >= 0.56 && p <= 0.78
  const isLoopCardVisible = p >= 0.91

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        height: `${SCROLL_VH}vh`,
        background: '#050507',
        color: '#ece9e2',
      }}
    >
      {/* ------------------------------------------------ Fixed 3D Canvas */}
      <Suspense fallback={null}>
        <SceneCanvas
          scrollProgressRef={scrollProgressRef}
          explodedRef={explodedRef}
          activeComponent={activeComponent}
          focusArtifact={focusArtifact}
          onSelectArtifact={(art) => setFocusArtifact(art)}
        />
      </Suspense>

      {/* ----------------------------------- Broadsheet Newspaper Hero Layer */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10,
          pointerEvents: isBroadsheetInteractive ? 'auto' : 'none',
          opacity: newspaperOpacity,
          visibility: newspaperOpacity > 0.001 ? 'visible' : 'hidden',
          willChange: newspaperOpacity > 0.001 ? 'opacity, transform' : 'auto',
          transform: `translateY(-${newspaperTranslate}px)`,
          transition: 'opacity 0.15s ease-out',
          background: 'var(--paper)',
          color: 'var(--ink-primary)',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Newspaper Masthead */}
        <header style={{ padding: '20px 4vw 0' }}>
          <div
            className="ed-mono"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              paddingBottom: 8,
              borderBottom: '1px solid var(--ink-primary)',
            }}
          >
            <span>Quark Babies · NASA International Space Apps Challenge 2026</span>
            <span>Challenge: “Abandoned but not Forgotten”</span>
          </div>

          <h1
            className="ed-serif"
            style={{
              textAlign: 'center',
              fontSize: 'clamp(2.2rem, 6vw, 4.8rem)',
              fontWeight: 900,
              letterSpacing: '0.01em',
              margin: '18px 0 8px',
              lineHeight: 1,
            }}
          >
            Abandoned, Not Forgotten
          </h1>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2vw',
              alignItems: 'baseline',
              borderTop: '1px solid var(--ink-primary)',
              borderBottom: '3px double var(--ink-primary)',
              padding: '6px 0',
            }}
          >
            <span className="ed-mono-sm" style={{ color: 'var(--ink-secondary)' }}>
              Vol. I — The Lunar Edition
            </span>
            <span className="ed-mono-sm" style={{ color: 'var(--ochre)' }}>
              Two Historic Apollo Missions · Four Lunar Artifacts · One Unified Archive
            </span>
            <span className="ed-mono-sm" style={{ color: 'var(--ink-secondary)' }}>
              Tranquility Base &amp; Hadley–Apennine
            </span>
          </div>
        </header>

        {/* Lead Newspaper Story with Hero Rocket Photo */}
        <main
          style={{
            flex: 1,
            padding: '24px 5vw',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 1fr)',
            gap: '3vw',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Headlines & Editorial Dispatch */}
          <div>
            <div className="ed-mono" style={{ color: 'var(--ochre)' }}>
              Special Launch Dispatch · 16 July 1969
            </div>
            <h2
              className="ed-serif"
              style={{
                fontSize: 'clamp(1.6rem, 3.2vw, 2.8rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                margin: '10px 0 16px',
              }}
            >
              Humanity Reaches for Tranquility Base
            </h2>
            <p className="ed-body ed-drop-cap" style={{ fontSize: '1rem', margin: 0 }}>
              At Launch Complex 39A, the 363-foot Saturn V rocket stands fueled and pressurized.
              Three astronauts — Armstrong, Aldrin, and Collins — prepare to bridge 240,000 miles
              of cosmic void. What they will leave behind in the lunar dust will outlast empires.
            </p>
            <p className="ed-body" style={{ fontSize: '0.92rem', marginTop: 14 }}>
              Scroll down to initiate the mission — zoom into Pad 39A and witness the launch into deep space.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 22,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--ochre)',
                padding: '8px 16px',
                border: '1px solid var(--ochre)',
                background: 'rgba(156, 66, 33, 0.08)',
              }}
            >
              <ArrowDown size={14} className="animate-bounce" />
              Scroll to Enter 3D Expedition
            </div>
          </div>

          {/* Right Column: The Framed Photo that Zooms into the 3D Rocket */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                border: '3px solid var(--ink-primary)',
                padding: 10,
                background: '#dfd7c6',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                transform: `scale(${photoScale})`,
                opacity: photoOpacity,
                transformOrigin: 'center center',
                transition: 'transform 0.05s linear, opacity 0.05s linear',
              }}
            >
              <img
                src="/assets/hero/saturn-v-pad.png"
                alt="Saturn V on Pad 39A"
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: 440,
                  height: 'auto',
                  filter: 'contrast(1.08) sepia(0.12)',
                }}
              />
              <div
                className="ed-mono-sm"
                style={{
                  marginTop: 6,
                  textAlign: 'center',
                  color: 'var(--ink-secondary)',
                  letterSpacing: '0.14em',
                }}
              >
                PLATE I · Saturn V SA-506 on Launch Complex 39A
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ------------------------------------ Telemetry HUD Overlay */}
      {isHUDVisible && (
        <ExpeditionHUD
          acts={ACTS}
          actIndex={actIndex}
          caption={getAct(progressState).caption}
          muted={muted}
          volume={volume}
          narrationOn={narrationOn}
          onJump={(targetProgress) => {
            if (lenisRef.current) {
              const maxScroll = containerRef.current
                ? containerRef.current.scrollHeight - window.innerHeight
                : 10000
              lenisRef.current.scrollTo(targetProgress * maxScroll, { duration: 1.5 })
            }
          }}
          onToggleMute={() => setMuted((m) => !m)}
          onVolumeChange={(v) => setVolume(v)}
          onToggleNarration={() => setNarrationOn((n) => !n)}
          onInteract={() => soundEngine.start()}
        />
      )}

      {/* ------------------- Staged Breakdown HUD Controls (Act 5) */}
      {isBreakdownActive && (
        <div
          style={{
            position: 'fixed',
            bottom: 36,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            background: 'rgba(5, 7, 12, 0.88)',
            border: '1px solid rgba(232, 200, 106, 0.45)',
            boxShadow: '0 0 32px rgba(0, 0, 0, 0.8)',
            borderRadius: 8,
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Layers size={18} color="#e8c86a" />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#e8c86a',
                }}
              >
                STAGED BREAKDOWN MODE
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                Scroll to separate or reassemble the Lunar Module
              </div>
            </div>
          </div>

          <div
            style={{
              width: 140,
              height: 4,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.round(((p - 0.58) / 0.18) * 100)}%`,
                height: '100%',
                background: '#e8c86a',
              }}
            />
          </div>
        </div>
      )}

      {/* ------------------ Earthrise Legacy & Infinite Loop Finale */}
      {isLoopCardVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '12vh',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            maxWidth: 620,
            width: '90vw',
            textAlign: 'center',
            background: 'rgba(5, 7, 12, 0.92)',
            border: '1px solid rgba(232, 200, 106, 0.5)',
            boxShadow: '0 0 48px rgba(0, 0, 0, 0.9)',
            borderRadius: 8,
            padding: '32px 36px',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#e8c86a',
              marginBottom: 12,
            }}
          >
            THE CONTINUOUS LOOP OF EXPLORATION
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)',
              fontWeight: 700,
              margin: '0 0 14px',
              lineHeight: 1.25,
              color: '#fff',
            }}
          >
            “Every mission leaves something behind. But not everything left behind is forgotten.”
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.98rem',
              lineHeight: 1.6,
              color: '#c9c5be',
              marginBottom: 24,
            }}
          >
            From the launch pad at Cape Canaveral to the quiet sea of Mare Tranquillitatis and the
            mountains of Hadley–Apennine, human exploration leaves physical footprints across time.
          </p>

          <button
            type="button"
            onClick={handleLoopBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              background: '#9c4221',
              color: '#fff',
              border: 0,
              padding: '12px 28px',
              borderRadius: 4,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(156, 66, 33, 0.4)',
              transition: 'background 0.2s ease',
            }}
          >
            <RotateCcw size={15} />
            Return to Morning of 16 July 1969
          </button>
        </div>
      )}

      {/* -------------------- Inspection Overlay for Selected Artifact */}
      {focusArtifact && (
        <InspectionOverlay
          artifact={focusArtifact}
          explodedRef={explodedRef}
          activeComponent={activeComponent}
          onActiveComponent={(comp) => setActiveComponent(comp)}
          onClose={() => setFocusArtifact(null)}
        />
      )}
    </div>
  )
}
