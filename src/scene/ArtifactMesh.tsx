import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

import type { ExplodedComponent, FeaturedArtifact } from '@/data/types'

/**
 * Artifact presentation. A NASA 3D Resources mesh is used automatically
 * when one is installed at `/assets/models/<id>.glb` (probed once, HEAD
 * request); otherwise a detailed procedural engineering reconstruction is
 * rendered. In both cases each `ExplodedComponent` maps to a named child
 * group so the inspection overlay can explode / call out components
 * individually. Models are illustrative reconstructions by default —
 * never presented as exact engineering replicas.
 */

const tmpVector = new THREE.Vector3()

const materials = {
  gold: new THREE.MeshStandardMaterial({ color: '#b98a3c', metalness: 0.85, roughness: 0.38 }),
  grey: new THREE.MeshStandardMaterial({ color: '#9a9a9e', metalness: 0.4, roughness: 0.55 }),
  dark: new THREE.MeshStandardMaterial({ color: '#3f3f45', metalness: 0.45, roughness: 0.6 }),
  white: new THREE.MeshStandardMaterial({ color: '#d8d6d0', metalness: 0.1, roughness: 0.7 }),
  glassy: new THREE.MeshStandardMaterial({ color: '#8fb4c4', metalness: 0.2, roughness: 0.08 }),
  solar: new THREE.MeshStandardMaterial({ color: '#1d2a44', metalness: 0.5, roughness: 0.3 }),
  panel: new THREE.MeshStandardMaterial({ color: '#6d6a5e', metalness: 0.3, roughness: 0.6 }),
}

function Strut({
  from,
  to,
  radius,
  material,
}: {
  from: [number, number, number]
  to: [number, number, number]
  radius: number
  material: THREE.Material
}) {
  const { position, quaternion, length } = useMemo(() => {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    const dir = end.clone().sub(start)
    const length = dir.length()
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    )
    const position = start.clone().add(end).multiplyScalar(0.5)
    return { position, quaternion, length }
  }, [from, to])
  return (
    <mesh position={position} quaternion={quaternion} material={material} castShadow>
      <cylinderGeometry args={[radius, radius, length, 10]} />
    </mesh>
  )
}

function comp(components: ExplodedComponent[], id: string): ExplodedComponent {
  return (
    components.find((c) => c.id === id) ?? {
      id,
      label: id,
      description: '',
      explodeOffset: [0, 0, 0],
    }
  )
}

/* ------------------------------------------------------------------ */
/* ComponentGroup — one exploded-view part                             */
/* ------------------------------------------------------------------ */

function ComponentGroup({
  component,
  explodedRef,
  active,
  children,
}: {
  component: ExplodedComponent
  explodedRef: React.MutableRefObject<number>
  active?: boolean
  children: ReactNode
}) {
  const groupRef = useRef<THREE.Group>(null)
  const target = useMemo(() => new THREE.Vector3(...component.explodeOffset), [component])
  const [highlight, setHighlight] = useState<{
    geometry: THREE.BufferGeometry
    center: THREE.Vector3
  } | null>(null)

  // Explode offsets ease toward the ref-driven target — never React state.
  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    tmpVector.copy(target).multiplyScalar(explodedRef.current)
    group.position.lerp(tmpVector, 1 - Math.exp(-delta * 6))
  })

  // Callout highlight: a wireframe box measured around the component.
  useEffect(() => {
    const group = groupRef.current
    if (!group || !active) {
      setHighlight(null)
      return
    }
    const box = new THREE.Box3().setFromObject(group)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3()).sub(group.position)
    const geometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(size.x + 0.08, size.y + 0.08, size.z + 0.08),
    )
    setHighlight({ geometry, center })
    return () => {
      geometry.dispose()
    }
  }, [active])

  return (
    <group ref={groupRef} name={`component:${component.id}`}>
      {children}
      {highlight && (
        <lineSegments geometry={highlight.geometry} position={highlight.center}>
          <lineBasicMaterial color="#e8c86a" transparent opacity={0.85} />
        </lineSegments>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Procedural models — each returns named component groups             */
/* ------------------------------------------------------------------ */

function EagleDescentStageModel({
  explodedRef,
  components,
  activeComponent,
}: ModelProps) {
  const c = (id: string) => comp(components, id)
  return (
    <group>
      <ComponentGroup explodedRef={explodedRef} component={c('body-structure')} active={activeComponent === 'body-structure'}>
        <mesh position={[0, 1.7, 0]} material={materials.gold} castShadow receiveShadow>
          <cylinderGeometry args={[2.1, 2.1, 1.4, 8]} />
        </mesh>
        <mesh position={[0, 2.52, 0]} material={materials.dark} castShadow>
          <cylinderGeometry args={[2.14, 2.14, 0.26, 8]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh
            key={s}
            position={[s * 1.5, 1.95, s * 1.5]}
            rotation={[0, Math.PI / 4, 0]}
            material={materials.white}
            castShadow
          >
            <boxGeometry args={[1.1, 0.8, 1.1]} />
          </mesh>
        ))}
      </ComponentGroup>
      <ComponentGroup explodedRef={explodedRef} component={c('descent-engine')} active={activeComponent === 'descent-engine'}>
        <mesh position={[0, 0.52, 0]} material={materials.dark} castShadow>
          <cylinderGeometry args={[0.42, 0.8, 1.05, 20, 1, true]} />
        </mesh>
      </ComponentGroup>
      <ComponentGroup explodedRef={explodedRef} component={c('landing-gear')} active={activeComponent === 'landing-gear'}>
        {[
          [3.32, 3.32],
          [-3.32, 3.32],
          [3.32, -3.32],
          [-3.32, -3.32],
        ].map(([px, pz], i) => (
          <group key={i}>
            <Strut
              from={[px * 0.4, 1.1, pz * 0.4]}
              to={[px, 0.16, pz]}
              radius={0.09}
              material={materials.grey}
            />
            <mesh position={[px, 0.08, pz]} material={materials.dark} castShadow receiveShadow>
              <cylinderGeometry args={[0.95, 1.05, 0.16, 20]} />
            </mesh>
          </group>
        ))}
      </ComponentGroup>
      <ComponentGroup explodedRef={explodedRef} component={c('stowage-bays')} active={activeComponent === 'stowage-bays'}>
        <mesh position={[1.9, 1.6, 1.4]} material={materials.grey} castShadow>
          <boxGeometry args={[0.7, 0.5, 0.55]} />
        </mesh>
        <mesh position={[-1.9, 1.6, 1.4]} material={materials.grey} castShadow>
          <boxGeometry args={[0.7, 0.5, 0.55]} />
        </mesh>
      </ComponentGroup>
      {/* Ladder (context — not an exploded component) */}
      <Strut from={[-0.42, 0.3, 3.1]} to={[-0.42, 2.4, 2.0]} radius={0.035} material={materials.white} />
      <Strut from={[0.42, 0.3, 3.1]} to={[0.42, 2.4, 2.0]} radius={0.035} material={materials.white} />
    </group>
  )
}

function LRRRModel({
  explodedRef,
  components,
  activeComponent,
}: ModelProps) {
  const c = (id: string) => comp(components, id)
  const cubes = useMemo(() => {
    const list: [number, number][] = []
    for (let r = 0; r < 10; r++) {
      for (let q = 0; q < 10; q++) {
        list.push([(q - 4.5) * 0.042, (r - 4.5) * 0.042])
      }
    }
    return list
  }, [])
  return (
    <group>
      <ComponentGroup explodedRef={explodedRef} component={c('reflector-array')} active={activeComponent === 'reflector-array'}>
        <mesh position={[0, 0.62, 0]} rotation={[-0.35, 0, 0]} material={materials.dark} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.04]} />
        </mesh>
        {cubes.map(([x, y], i) => (
          <mesh
            key={i}
            position={[x, 0.62 + y * 0.935 + 0.02, 0.042 - y * 0.15]}
            rotation={[-0.35, 0, 0]}
            material={materials.glassy}
          >
            <boxGeometry args={[0.03, 0.03, 0.02]} />
          </mesh>
        ))}
      </ComponentGroup>
      <ComponentGroup explodedRef={explodedRef} component={c('support-structure')} active={activeComponent === 'support-structure'}>
        <mesh position={[0, 0.48, -0.1]} rotation={[-0.35, 0, 0]} material={materials.grey} castShadow>
          <boxGeometry args={[0.52, 0.52, 0.03]} />
        </mesh>
      </ComponentGroup>
      <ComponentGroup explodedRef={explodedRef} component={c('ground-feet')} active={activeComponent === 'ground-feet'}>
        {[
          [-0.24, 0.2],
          [0.24, 0.2],
          [-0.24, -0.2],
          [0.24, -0.2],
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.18, lz]} material={materials.grey} castShadow>
            <cylinderGeometry args={[0.016, 0.022, 0.36, 6]} />
          </mesh>
        ))}
      </ComponentGroup>
    </group>
  )
}

function PSEModel({
  explodedRef,
  components,
  activeComponent,
}: ModelProps) {
  const c = (id: string) => comp(components, id)
  return (
    <group>
      <ComponentGroup explodedRef={explodedRef} component={c('central-station')} active={activeComponent === 'central-station'}>
        <mesh position={[0, 0.36, 0]} material={materials.grey} castShadow receiveShadow>
          <boxGeometry args={[0.86, 0.12, 0.86]} />
        </mesh>
        <mesh position={[0, 0.68, 0]} material={materials.white} castShadow>
          <boxGeometry args={[0.55, 0.5, 0.55]} />
        </mesh>
      </ComponentGroup>
      <ComponentGroup explodedRef={explodedRef} component={c('antenna-mast')} active={activeComponent === 'antenna-mast'}>
        <mesh position={[0, 1.35, 0]} material={materials.grey} castShadow>
          <cylinderGeometry args={[0.02, 0.028, 0.9, 8]} />
        </mesh>
        <mesh position={[0, 1.85, 0]} material={materials.grey} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.03, 18]} />
        </mesh>
      </ComponentGroup>
      <ComponentGroup explodedRef={explodedRef} component={c('solar-panels')} active={activeComponent === 'solar-panels'}>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.72, 0.92, 0]} rotation={[0, 0, s * -0.42]}>
            <mesh material={materials.solar} castShadow>
              <boxGeometry args={[0.72, 0.02, 0.46]} />
            </mesh>
          </group>
        ))}
      </ComponentGroup>
      <ComponentGroup explodedRef={explodedRef} component={c('seismometer-unit')} active={activeComponent === 'seismometer-unit'}>
        <mesh position={[0.05, 1.02, -0.02]} material={materials.gold} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 0.2, 16]} />
        </mesh>
      </ComponentGroup>
    </group>
  )
}

function LRVModel({
  explodedRef,
  components,
  activeComponent,
}: ModelProps) {
  const c = (id: string) => comp(components, id)
  const wheelPositions: [number, number, number][] = [
    [-1.15, 0.36, 1.05],
    [1.15, 0.36, 1.05],
    [-1.15, 0.36, -1.05],
    [1.15, 0.36, -1.05],
  ]
  return (
    <group>
      <ComponentGroup explodedRef={explodedRef} component={c('chassis')} active={activeComponent === 'chassis'}>
        <mesh position={[0, 0.62, 0]} material={materials.grey} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.14, 2.2]} />
        </mesh>
        <mesh position={[0, 0.76, 0]} material={materials.dark} castShadow>
          <boxGeometry args={[2.1, 0.1, 1.8]} />
        </mesh>
      </ComponentGroup>
      <ComponentGroup explodedRef={explodedRef} component={c('wheels')} active={activeComponent === 'wheels'}>
        {wheelPositions.map(([x, y, z], i) => (
          <mesh
            key={i}
            position={[x, y, z]}
            rotation={[0, 0, Math.PI / 2]}
            material={materials.dark}
            castShadow
          >
            <cylinderGeometry args={[0.36, 0.36, 0.22, 16]} />
          </mesh>
        ))}
      </ComponentGroup>
      <ComponentGroup explodedRef={explodedRef} component={c('seats-console')} active={activeComponent === 'seats-console'}>
        {[-0.35, 0.35].map((z, i) => (
          <mesh key={i} position={[0, 0.95, z]} material={materials.panel} castShadow>
            <boxGeometry args={[0.5, 0.06, 0.4]} />
          </mesh>
        ))}
        <mesh position={[0.5, 0.85, 0]} material={materials.dark} castShadow>
          <boxGeometry args={[0.26, 0.3, 0.5]} />
        </mesh>
      </ComponentGroup>
      <ComponentGroup explodedRef={explodedRef} component={c('antenna-tv')} active={activeComponent === 'antenna-tv'}>
        <mesh position={[-1.0, 1.5, 0]} material={materials.white} castShadow>
          <sphereGeometry args={[0.22, 16, 12]} />
        </mesh>
        <Strut from={[-1.0, 0.7, 0]} to={[-1.0, 1.4, 0]} radius={0.02} material={materials.grey} />
      </ComponentGroup>
    </group>
  )
}

interface ModelProps {
  explodedRef: React.MutableRefObject<number>
  components: ExplodedComponent[]
  activeComponent?: string | null
}

/* ------------------------------------------------------------------ */
/* GLB probe + fallback                                                */
/* ------------------------------------------------------------------ */

const glbProbeCache = new Map<string, Promise<boolean>>()

function probeGlb(id: string): Promise<boolean> {
  let cached = glbProbeCache.get(id)
  if (!cached) {
    cached = fetch(`/assets/models/${id}.glb`, { method: 'HEAD' })
      .then((res) => res.ok)
      .catch(() => false)
    glbProbeCache.set(id, cached)
  }
  return cached
}

function GltfArtifact({ url }: { url: string }) {
  const gltf = useGLTF(url)
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])
  return <primitive object={scene} />
}

class ArtifactBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  override render() {
    return this.state.failed ? null : this.props.children
  }
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function ArtifactMesh({
  artifact,
  explodedRef,
  activeComponent,
  onSelect,
}: {
  artifact: FeaturedArtifact
  /** Mutable 0→1 explode amount, read per frame (never React state). */
  explodedRef: React.MutableRefObject<number>
  /** Id of the currently called-out component, if any. */
  activeComponent?: string | null
  onSelect?: (artifact: FeaturedArtifact) => void
}) {
  const [hasGlb, setHasGlb] = useState(false)
  useEffect(() => {
    let active = true
    probeGlb(artifact.id).then((ok) => {
      if (active) setHasGlb(ok)
    })
    return () => {
      active = false
    }
  }, [artifact.id])

  return (
    <group
      name={`artifact:${artifact.id}`}
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.(artifact)
      }}
    >
      {hasGlb ? (
        <ArtifactBoundary>
          <Suspense fallback={null}>
            <GltfArtifact url={`/assets/models/${artifact.id}.glb`} />
          </Suspense>
        </ArtifactBoundary>
      ) : (
        <ProceduralArtifact
          artifact={artifact}
          explodedRef={explodedRef}
          activeComponent={activeComponent}
        />
      )}
    </group>
  )
}

function ProceduralArtifact({
  artifact,
  explodedRef,
  activeComponent,
}: {
  artifact: FeaturedArtifact
  explodedRef: React.MutableRefObject<number>
  activeComponent?: string | null
}) {
  const modelProps: ModelProps = {
    explodedRef,
    components: artifact.components,
    activeComponent,
  }
  switch (artifact.id) {
    case 'eagle-descent-stage':
      return <EagleDescentStageModel {...modelProps} />
    case 'laser-ranging-retroreflector':
    case 'apollo-11-lrrr':
      return <LRRRModel {...modelProps} />
    case 'passive-seismic-experiment':
    case 'apollo-11-pse':
      return <PSEModel {...modelProps} />
    case 'apollo-15-lrv':
    case 'lunar-roving-vehicle':
      return <LRVModel {...modelProps} />
    default:
      return null
  }
}
