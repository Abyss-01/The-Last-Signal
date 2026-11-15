import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

import type { FeaturedArtifact } from '@/data/types'
import { QUALITY } from '../QualityTier'

/**
 * Shared building blocks for the surface acts: deterministic procedural
 * terrain, interactive artifact markers and a scroll-range gate used to
 * reveal/hide zone content without per-frame React state.
 */

/* ------------------------------------------------------------------ */
/* Deterministic noise (no external deps — stable across reloads)      */
/* ------------------------------------------------------------------ */

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function smoothNoise(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash2(xi, yi)
  const b = hash2(xi + 1, yi)
  const c = hash2(xi, yi + 1)
  const d = hash2(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

function fbm(x: number, y: number, octaves = 4): number {
  let value = 0
  let amplitude = 0.5
  let frequency = 1
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency)
    amplitude *= 0.5
    frequency *= 2.07
  }
  return value
}

/* ------------------------------------------------------------------ */
/* Terrain                                                             */
/* ------------------------------------------------------------------ */

export interface TerrainOptions {
  /** Plane size in metres [width, depth]. */
  size: [number, number]
  /** Plane centre in world space. */
  center: [number, number]
  /** Base relief amplitude. */
  amplitude: number
  /** Fine-detail amplitude. */
  detailAmplitude: number
  /** Craters: [x, z, radius, depth]. */
  craters: [number, number, number, number][]
  /** Flattened sites: [x, z, radius] — artifacts stand at y = 0. */
  flatten: [number, number, number][]
  colorA: string
  colorB: string
  /** Optional ridge pattern along one axis (Martian dunes). */
  ridges?: number
}

function terrainHeight(x: number, z: number, o: TerrainOptions): number {
  let h =
    (fbm(x * 0.004 + 7.3, z * 0.004 + 2.1) - 0.5) * 2 * o.amplitude +
    (fbm(x * 0.02, z * 0.02, 3) - 0.5) * 2 * o.detailAmplitude

  if (o.ridges) {
    h += Math.sin(x * 0.012 + fbm(x * 0.003, z * 0.003) * 3) * o.ridges
  }

  for (const [cx, cz, radius, depth] of o.craters) {
    const r = Math.hypot(x - cx, z - cz)
    if (r < radius) {
      const t = r / radius
      const bowl = Math.cos(t * Math.PI) * 0.5 + 0.5
      h -= depth * bowl
      h += depth * 0.22 * Math.exp(-(((t - 1) * 4) ** 2))
    }
  }

  for (const [fx, fz, fr] of o.flatten) {
    const r = Math.hypot(x - fx, z - fz)
    if (r < fr) {
      const t = THREE.MathUtils.smoothstep(r / fr, 0.15, 1)
      h *= t
    }
  }

  return h
}

export function Terrain({ options }: { options: TerrainOptions }) {
  const geometry = useMemo(() => {
    const segments = QUALITY.terrainSegments
    const [w, d] = options.size
    const geo = new THREE.PlaneGeometry(w, d, segments, segments)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position as THREE.BufferAttribute
    const colors = new Float32Array(pos.count * 3)
    const colorA = new THREE.Color(options.colorA)
    const colorB = new THREE.Color(options.colorB)
    const c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + options.center[0]
      const z = pos.getZ(i) + options.center[1]
      const h = terrainHeight(x, z, options)
      pos.setY(i, h)
      const mix = THREE.MathUtils.clamp(
        fbm(x * 0.008 + 41.7, z * 0.008 + 13.9, 3),
        0,
        1,
      )
      c.copy(colorA).lerp(colorB, mix)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [options])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh
      geometry={geometry}
      position={[options.center[0], 0, options.center[1]]}
      receiveShadow
    >
      <meshStandardMaterial vertexColors roughness={1} metalness={0} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Scroll-range gate (rare setState only)                              */
/* ------------------------------------------------------------------ */

export function useInRange(
  progressRef: React.MutableRefObject<number>,
  start: number,
  end: number,
): boolean {
  const [inRange, setInRange] = useState(false)
  const stateRef = useRef(false)
  useFrame(() => {
    const p = progressRef.current
    const v = p >= start && p <= end
    if (v !== stateRef.current) {
      stateRef.current = v
      setInRange(v)
    }
  })
  return inRange
}

/* ------------------------------------------------------------------ */
/* Artifact marker — ground ring + editorial label button              */
/* ------------------------------------------------------------------ */

export function ArtifactMarker({
  artifact,
  progressRef,
  onSelect,
  range,
  lift = 2.4,
  radius = 2.6,
}: {
  artifact: FeaturedArtifact
  progressRef: React.MutableRefObject<number>
  onSelect: (artifact: FeaturedArtifact) => void
  /** Visible scroll range [start, end]. */
  range: [number, number]
  lift?: number
  radius?: number
}) {
  const inRange = useInRange(progressRef, range[0], range[1])
  const ringRef = useRef<THREE.Mesh>(null)
  const [x, y, z] = artifact.sceneAnchor

  useFrame(({ clock }) => {
    const ring = ringRef.current
    if (!ring || !inRange) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.06
    ring.scale.setScalar(pulse)
  })

  if (!inRange) return null

  return (
    <group>
      <mesh ref={ringRef} position={[x, 0.06, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius, radius + 0.28, 48]} />
        <meshBasicMaterial color="#e8c86a" transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
      <Html
        position={[x, y + lift, z]}
        center
        distanceFactor={30}
        zIndexRange={[20, 10]}
        style={{ pointerEvents: 'auto' }}
      >
        <button
          type="button"
          onClick={() => onSelect(artifact)}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            padding: '7px 12px',
            border: '1px solid rgba(232,200,106,0.65)',
            background: 'rgba(10,10,12,0.78)',
            color: '#f0e9d8',
            cursor: 'pointer',
            backdropFilter: 'blur(2px)',
          }}
        >
          {artifact.catalog} · {artifact.name.split('—')[0].trim()}
        </button>
      </Html>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Earth hanging in the black lunar sky                                */
/* ------------------------------------------------------------------ */

export function EarthInSky({
  position,
  scale = 18,
}: {
  position: [number, number, number]
  scale?: number
}) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 24]} />
      <meshStandardMaterial
        color="#5b8ec4"
        emissive="#274b78"
        emissiveIntensity={0.85}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  )
}
