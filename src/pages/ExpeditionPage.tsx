import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { ARTIFACTS, getArtifact } from '@/data/artifacts'
import type { FeaturedArtifact } from '@/data/types'
import { soundEngine } from '@/audio/SoundEngine'
import type { SoundEnvironment } from '@/audio/SoundEngine'
import { ACTS, getAct, SCROLL_VH } from '@/scene/ScrollChoreography'
import { ExpeditionHUD } from '@/components/hud/ExpeditionHUD'
import { InspectionOverlay } from '@/components/inspection/InspectionOverlay'

gsap.registerPlugin(ScrollTrigger)

// The expedition scene is a heavy @react-three/fiber canvas. Lazy-load it so
// the vendor chunks land in a separate file that only downloads the first
// time /expedition is visited (placeholder while it loads).
const SceneCanvas = lazy(async () => {
  const { SceneCanvas: Canvas } = await import('@/scene/SceneCanvas')
  return { default: Canvas }
})

function CanvasLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 19,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050507',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.66rem',
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: '#e8c86a',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#e8c86a',
            animation: 'pulse 1.2s ease-in-out infinite',
          }}
        />
        Loading the archive
      </span>
      <style>{`
        @keyframes pulse { 50% { opacity: 0.25; } }
      `}</style>
    </div>
  )
}

const ENV_BY_ACT: Record<string, SoundEnvironment> = {
  'broadsheet-pad': 'earth',
  'saturn-v-launch': 'earth',
  'space-staging': 'cislunar',
  'cislunar-wormhole': 'transition',
  'lunar-module-breakdown': 'moon',
  'lunar-archaeology': 'moon',
  'earthrise-loop': 'cislunar',
}

/**
 * /expedition — one persistent canvas driven by a 900vh scroll container.
 * GSAP ScrollTrigger (scrub 1.2) writes normalized progress into a
 * mutable ref; no per-frame React state. HUD chapter state updates only
 * on act boundaries.
 */
export function ExpeditionPage() {
  const [searchParams] = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollProgressRef = useRef(0)
  const explodedRef = useRef(0)

  const [focusArtifact, setFocusArtifact] = useState<FeaturedArtifact | null>(null)
  const [activeComponent, setActiveComponent] = useState<string | null>(null)
  const [actIndex, setActIndex] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.6)
  const [narrationOn, setNarrationOn] = useState(false)
  const narrationRef = useRef(false)
  narrationRef.current = narrationOn

  /* Scroll → progress (scrubbed), into the ref only. */
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
        scrub: 1.2,
        onUpdate: () => {
          scrollProgressRef.current = proxy.p
        },
      },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  /* Act boundaries → HUD state + sound environment + narration. */
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
        if (narrationRef.current) soundEngine.narrate(act.caption)
      }
      // Launch rumble: only while the vehicle is inside the atmosphere.
      const inAtmosphere = p > 0.018 && p < 0.13
      soundEngine.setRumble(
        inAtmosphere ? Math.max(0, 1 - Math.abs(p - 0.05) / 0.09) * 0.9 : 0,
      )
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  /* Audio preferences. */
  useEffect(() => {
    soundEngine.setMuted(muted)
  }, [muted])
  useEffect(() => {
    soundEngine.setVolume(volume)
  }, [volume])
  useEffect(() => {
    if (!narrationOn) soundEngine.stopNarration()
  }, [narrationOn])

  /* Start the AudioContext on the first user gesture. */
  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'wheel']
    const start = () => soundEngine.start()
    events.forEach((e) => window.addEventListener(e, start, { once: true }))
    return () => events.forEach((e) => window.removeEventListener(e, start))
  }, [])

  /* ?focus=<artifactId> deep link. */
  useEffect(() => {
    const id = searchParams.get('focus')
    if (!id) return
    const artifact = getArtifact(id)
    if (!artifact) return
    // Jump to the act containing the object, then open the inspection.
    const act = getAct(
      artifact.sceneAnchor[2] < -1900 ? 0.82 : artifact.body === 'moon' && artifact.id !== 'apollo-15-lrv' ? 0.34 : 0.56,
    )
    const max = (containerRef.current?.offsetHeight ?? window.innerHeight) - window.innerHeight
    window.scrollTo({ top: (act.range[0] + 0.03) * max, behavior: 'instant' as ScrollBehavior })
    const timer = window.setTimeout(() => setFocusArtifact(artifact), 700)
    return () => window.clearTimeout(timer)
  }, [searchParams])

  const jumpTo = (progress: number) => {
    const container = containerRef.current
    if (!container) return
    const max = container.offsetHeight - window.innerHeight
    window.scrollTo({ top: progress * max, behavior: 'smooth' })
  }

  const act = ACTS[Math.min(actIndex, ACTS.length - 1)]

  return (
    <main>
      {/* Scroll track — the journey's real length. */}
      <div ref={containerRef} style={{ height: `${SCROLL_VH}vh` }} aria-hidden />

      {/* The persistent scene, lazy-loaded so the heavy 3D vendor chunk
          splits out and only downloads the first time /expedition is
          visited; a placeholder marks the gap. */}
      <Suspense fallback={<CanvasLoading />}>
        <SceneCanvas
          scrollProgressRef={scrollProgressRef}
          explodedRef={explodedRef}
          activeComponent={activeComponent}
          focusArtifact={focusArtifact}
          onSelectArtifact={(artifact) => {
            soundEngine.click()
            setActiveComponent(null)
            setFocusArtifact(artifact)
          }}
        />
      </Suspense>

      <ExpeditionHUD
        acts={ACTS}
        actIndex={actIndex}
        caption={act.caption}
        muted={muted}
        volume={volume}
        narrationOn={narrationOn}
        onJump={jumpTo}
        onToggleMute={() => setMuted((m) => !m)}
        onVolumeChange={setVolume}
        onToggleNarration={() => setNarrationOn((n) => !n)}
        onInteract={() => soundEngine.start()}
      />

      {focusArtifact && (
        <InspectionOverlay
          artifact={focusArtifact}
          explodedRef={explodedRef}
          activeComponent={activeComponent}
          onActiveComponent={setActiveComponent}
          onClose={() => {
            explodedRef.current = 0
            setActiveComponent(null)
            setFocusArtifact(null)
          }}
        />
      )}

      {/* Bottom-left: artifact index hint */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: 28,
          zIndex: 20,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.18em',
          color: 'rgba(236,231,216,0.4)',
          textTransform: 'uppercase',
        }}
      >
        {ARTIFACTS.length} OBJECTS · {ACTS.length} CHAPTERS · SELECT A MARKER TO INSPECT
      </div>
    </main>
  )
}
