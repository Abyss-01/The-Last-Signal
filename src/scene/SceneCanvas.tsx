import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

import { supportsWebGL } from './QualityTier'
import { skyState } from './ScrollChoreography'
import { CameraRig, OrbitGate } from './CameraRig'
import { SaturnVLaunch } from './SaturnVLaunch'
import { WormholeTransition } from './WormholeTransition'
import { LunarModuleBreakdown } from './LunarModuleBreakdown'
import { LunarSurfaceAct } from './acts/LunarSurfaceAct'

import type { FeaturedArtifact } from '@/data/types'

/**
 * The single persistent <Canvas> for the entire expedition experience.
 * Incorporates:
 *   1. Saturn V Launch stack on Pad 39A with F-1 plumes, billowing smoke
 *      screen-cover, and S-IC/S-II/S-IVB stage separation.
 *   2. Relativistic Wormhole / Crater Warp Tunnel approaching the Moon.
 *   3. Apollo Lunar Module Eagle with staged mechanical exploded-view breakdown.
 *   4. Lunar Surface Archaeology (Retroreflector, Seismic Experiment, LRV Rover).
 *   5. Earthrise and orbital return loop.
 */

export interface SceneCanvasProps {
  scrollProgressRef: React.MutableRefObject<number>
  explodedRef: React.MutableRefObject<number>
  activeComponent: string | null
  focusArtifact: FeaturedArtifact | null
  onSelectArtifact: (artifact: FeaturedArtifact) => void
}

function EarthriseModel({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const earthRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const p = progressRef.current
    if (earthRef.current) {
      // Visible from orbit & during loop return
      earthRef.current.visible = p > 0.82
      earthRef.current.rotation.y += 0.0012
    }
  })

  return (
    <group ref={earthRef} position={[0, 480, -450]}>
      {/* Earth Sphere */}
      <mesh>
        <sphereGeometry args={[110, 48, 48]} />
        <meshStandardMaterial
          color="#1e549f"
          roughness={0.7}
          metalness={0.1}
          emissive="#0b1b36"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Atmosphere Glow Ring */}
      <mesh scale={[1.04, 1.04, 1.04]}>
        <sphereGeometry args={[110, 32, 32]} />
        <meshBasicMaterial
          color="#65c2ff"
          transparent
          opacity={0.32}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
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
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.6rem, 4vw, 3rem)',
              margin: '0 0 10px',
              lineHeight: 1.1,
            }}
          >
            The WebGL View is Paused
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
            Your browser could not allocate a WebGL rendering context. The preserved
            broadsheet archive above keeps the lunar records readable.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
      }}
      camera={{ fov: 48, near: 0.1, far: 9000, position: [0, 14, 62] }}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
    >
      <SceneEnvironment progressRef={scrollProgressRef} />

      {/* Act 1 & 2: Saturn V Launch Stack on Pad 39A */}
      <SaturnVLaunch progressRef={scrollProgressRef} />

      {/* Act 4: Wormhole Warp Tunnel to the Moon */}
      <WormholeTransition progressRef={scrollProgressRef} range={[0.44, 0.58]} />

      {/* Act 5: Staged Mechanical Exploded-View of Apollo Lunar Module */}
      <LunarModuleBreakdown progressRef={scrollProgressRef} range={[0.56, 0.78]} />

      {/* Act 6: Lunar Surface Archaeology (Retroreflector, Seismic Experiment, Rover) */}
      <LunarSurfaceAct
        progressRef={scrollProgressRef}
        explodedRef={explodedRef}
        activeComponent={activeComponent}
        onSelect={onSelectArtifact}
      />

      {/* Act 7: High Orbit Earthrise for Loop */}
      <EarthriseModel progressRef={scrollProgressRef} />

      <CameraRig scrollProgressRef={scrollProgressRef} focusArtifact={focusArtifact} />
      <OrbitGate inspecting={focusArtifact !== null} />
    </Canvas>
  )
}

/* ------------------------------------------------------------------ */
/* Environment — fog, background, sun, starfield                      */
/* ------------------------------------------------------------------ */

function SceneEnvironment({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>
}) {
  const scene = useThree((state) => state.scene)
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const hemiRef = useRef<THREE.HemisphereLight>(null)

  const fog = useMemo(() => new THREE.FogExp2('#050507', 0.0004), [])
  const background = useMemo(() => new THREE.Color('#050507'), [])

  useEffect(() => {
    scene.fog = fog
    scene.background = background
    return () => {
      scene.fog = null
      scene.background = null
    }
  }, [scene, fog, background])

  // Cosmic Starfield
  const starsMesh = useMemo(() => {
    const count = 1800
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 2400 + Math.random() * 800
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({
      color: '#e5e9f5',
      size: 2.2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.85,
    })
    return new THREE.Points(geo, mat)
  }, [])

  useFrame(() => {
    const s = skyState(progressRef.current)
    fog.color.copy(s.fogColor)
    fog.density = s.fogDensity
    background.copy(s.fogColor)

    const sun = sunRef.current
    if (sun) {
      sun.color.copy(s.sunColor)
      sun.intensity = s.sunIntensity
    }
    const hemi = hemiRef.current
    if (hemi) {
      hemi.color.copy(s.ambientColor)
    }
  })

  return (
    <>
      <primitive object={starsMesh} />
      <directionalLight
        ref={sunRef}
        position={[260, 340, 180]}
        intensity={2.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={10}
        shadow-camera-far={2000}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <hemisphereLight ref={hemiRef} intensity={0.4} color="#5a7088" groundColor="#11141a" />
    </>
  )
}
