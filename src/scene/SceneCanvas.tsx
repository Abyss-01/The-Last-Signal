import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

import { QUALITY, supportsWebGL } from './QualityTier'
import { skyState } from './ScrollChoreography'
import { CameraRig, OrbitGate } from './CameraRig'
import { EarthLaunchAct } from './acts/EarthLaunchAct'
import { LunarSurfaceAct } from './acts/LunarSurfaceAct'
import { TransitionAct } from './acts/TransitionAct'
import { MarsSurfaceAct } from './acts/MarsSurfaceAct'

import type { FeaturedArtifact } from '@/data/types'

/**
 * The single persistent <Canvas> for the whole /expedition route. It is
 * mounted once and never unmounted per act; scroll progress arrives
 * exclusively through the mutable ref. Sky, fog, starfield and the sun
 * light are animated per frame from the same progress value.
 */

export interface SceneCanvasProps {
  scrollProgressRef: React.MutableRefObject<number>
  explodedRef: React.MutableRefObject<number>
  activeComponent: string | null
  focusArtifact: FeaturedArtifact | null
  onSelectArtifact: (artifact: FeaturedArtifact) => void
}

export function SceneCanvas({
  scrollProgressRef,
  explodedRef,
  activeComponent,
  focusArtifact,
  onSelectArtifact,
}: SceneCanvasProps) {
  const webgl = supportsWebGL()
  if (!webgl) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#050507' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ece9e2',
            textAlign: 'center',
            padding: '4vw 6vw',
            fontFamily: 'var(--font-body)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#e8c86a',
              marginBottom: 14,
            }}
          >
            3D EXCURSION UNAVAILABLE
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'clamp(1.6rem, 4vw, 3rem)',
              margin: '0 0 10px',
              lineHeight: 1.1,
            }}
          >
            The view is paused
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              maxWidth: '34em',
              lineHeight: 1.6,
              marginBottom: 22,
              color: '#ece9e2',
            }}
          >
            Your browser could not allocate a WebGL rendering context, so the
            scene cannot be drawn here. The preserved 2-D archive view below keeps
            the seven-record journal readable.
          </p>
          <ul
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: '#ece9e2',
              margin: 0,
              paddingLeft: 20,
            }}
          >
            <li>Objects, their verified coordinates and status — documented artefacts of exploration, not models.</li>
            <li>The mission chronology, the Saturn V stage ledger, and the readings these machines left.</li>
            <li>Select a marker in the preserved index to open the inspection dossier for any object.</li>
          </ul>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.66rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              border: '1px solid var(--ochre)',
              color: '#9c4221',
              background: 'rgba(12,11,10,0.55)',
              padding: '0.7rem 1.3rem',
              cursor: 'pointer',
            }}
          >
            Scroll to the archive
          </button>
        </div>
      </div>
    )
  }

  return (
    <Canvas
      shadows
      dpr={QUALITY.dpr}
      gl={{
        antialias: QUALITY.antialias,
        powerPreference: 'high-performance',
      }}
      camera={{ fov: 55, near: 0.1, far: 9000, position: [0, 5, 62] }}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
    >
      <SceneEnvironment progressRef={scrollProgressRef} />
      <EarthLaunchAct progressRef={scrollProgressRef} />
      <LunarSurfaceAct
        progressRef={scrollProgressRef}
        explodedRef={explodedRef}
        activeComponent={activeComponent}
        onSelect={onSelectArtifact}
      />
      <TransitionAct progressRef={scrollProgressRef} />
      <MarsSurfaceAct
        progressRef={scrollProgressRef}
        explodedRef={explodedRef}
        activeComponent={activeComponent}
        onSelect={onSelectArtifact}
      />
      <CameraRig scrollProgressRef={scrollProgressRef} focusArtifact={focusArtifact} />
      <OrbitGate inspecting={focusArtifact !== null} />
    </Canvas>
  )
}

/* ------------------------------------------------------------------ */
/* Environment — fog, background, sun, stars                           */
/* ------------------------------------------------------------------ */

/** Zone focus points the sun tracks, keyed by progress windows. */
const ZONE_FOCUS: { p: number; focus: [number, number, number] }[] = [
  { p: 0, focus: [0, 60, 0] },
  { p: 0.16, focus: [0, 60, 0] },
  { p: 0.3, focus: [0, 30, -1150] },
  { p: 0.52, focus: [0, 0, -1200] },
  { p: 0.66, focus: [342, 0, -1400] },
  { p: 0.78, focus: [500, 0, -1900] },
  { p: 1.0, focus: [660, 0, -2060] },
]

function zoneFocus(progress: number, out: THREE.Vector3): THREE.Vector3 {
  let i = 0
  while (i < ZONE_FOCUS.length - 2 && progress > ZONE_FOCUS[i + 1].p) i++
  const a = ZONE_FOCUS[i]
  const b = ZONE_FOCUS[i + 1]
  const t = THREE.MathUtils.clamp(
    (progress - a.p) / Math.max(1e-6, b.p - a.p),
    0,
    1,
  )
  const av = new THREE.Vector3(...a.focus)
  const bv = new THREE.Vector3(...b.focus)
  return out.copy(av.lerp(bv, t))
}

function SceneEnvironment({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>
}) {
  const scene = useThree((state) => state.scene)
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const hemiRef = useRef<THREE.HemisphereLight>(null)
  const starsRef = useRef<THREE.Points>(null!)
  const focusVec = useMemo(() => new THREE.Vector3(), [])

  const fog = useMemo(() => new THREE.FogExp2('#050507', 0), [])
  const background = useMemo(() => new THREE.Color('#050507'), [])

  useEffect(() => {
    scene.fog = fog
    scene.background = background
    return () => {
      scene.fog = null
      scene.background = null
    }
  }, [scene, fog, background])

  useFrame(() => {
    const s = skyState(progressRef.current)
    fog.color.copy(s.fogColor)
    fog.density = s.fogDensity
    background.copy(s.fogColor)

    const sun = sunRef.current
    if (sun) {
      sun.color.copy(s.lightColor)
      sun.intensity = s.lightIntensity
      zoneFocus(progressRef.current, focusVec)
      sun.position.set(focusVec.x + 260, focusVec.y + 340, focusVec.z + 180)
      sun.target.position.copy(focusVec)
      sun.target.updateMatrixWorld()
    }
    const hemi = hemiRef.current
    if (hemi) {
      hemi.intensity = s.ambientIntensity
      hemi.color.copy(s.fogColor)
    }
    const stars = starsRef.current
    if (stars) {
      ;(stars.material as THREE.PointsMaterial).opacity = s.starOpacity
      stars.visible = s.starOpacity > 0.02
    }
  })

  return (
    <>
      <ambientLight intensity={0.06} />
      <hemisphereLight ref={hemiRef} groundColor="#26221c" intensity={0.2} />
      <directionalLight
        ref={sunRef}
        castShadow
        position={[260, 340, 180]}
        intensity={2.4}
        shadow-mapSize={[QUALITY.shadowMapSize, QUALITY.shadowMapSize]}
        shadow-camera-near={1}
        shadow-camera-far={1400}
        shadow-camera-left={-160}
        shadow-camera-right={160}
        shadow-camera-top={160}
        shadow-camera-bottom={-160}
        shadow-bias={-0.0004}
      />
      <Starfield opacityRef={starsRef} />
    </>
  )
}

function Starfield({ opacityRef }: { opacityRef: React.MutableRefObject<THREE.Points> }) {
  const geometry = useMemo(() => {
    const count = QUALITY.starCount
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    let seed = 7
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let i = 0; i < count; i++) {
      // Shell around the whole route corridor.
      const theta = rand() * Math.PI * 2
      const phi = Math.acos(2 * rand() - 1)
      const r = 3800 + rand() * 800
      positions[i * 3] = 300 + r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi)
      positions[i * 3 + 2] = -1050 + r * Math.sin(phi) * Math.sin(theta)
      const shade = 0.7 + rand() * 0.3
      const warm = rand() < 0.18
      colors[i * 3] = shade
      colors[i * 3 + 1] = shade * (warm ? 0.9 : 0.96)
      colors[i * 3 + 2] = shade * (warm ? 0.75 : 1)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <points ref={opacityRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={1.7}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={0}
        depthWrite={false}
      />
    </points>
  )
}
