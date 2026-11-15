import { useMemo } from 'react'

import { ARTIFACTS } from '@/data/artifacts'
import { ArtifactMesh } from '../ArtifactMesh'
import { Terrain, ArtifactMarker, EarthInSky, useInRange } from './shared'

import type { FeaturedArtifact } from '@/data/types'

/**
 * Lunar Surface Act (progress 0.72 → 0.94): a single cratered regolith zone
 * holding Tranquility Base (OBJ-01…03, Apollo 11) and Hadley–Apennine
 * (OBJ-04, Apollo 15), with Earth hanging in the black sky.
 */

const terrainOptions = {
  size: [1700, 700] as [number, number],
  center: [150, -1275] as [number, number],
  amplitude: 26,
  detailAmplitude: 6,
  craters: [
    [-180, -1150, 90, 9],
    [380, -1330, 140, 14],
    [120, -1170, 55, 6],
    [-70, -1430, 120, 11],
    [520, -1260, 80, 8],
    [-260, -1300, 70, 7],
  ] as [number, number, number, number][],
  flatten: [
    [0, -1200, 26],
    [-11.9, -1211.9, 12],
    [-6.4, -1184.5, 12],
    [342, -1400, 30],
    [252, -1400, 22],
  ] as [number, number, number][],
  colorA: '#8f8f93',
  colorB: '#6b6b70',
}

const MARKER_RADII: Record<string, number> = {
  'eagle-descent-stage': 7.5,
  'laser-ranging-retroreflector': 2.5,
  'passive-seismic-experiment': 2.5,
  'apollo-15-lrv': 3.6,
}

export function LunarSurfaceAct({
  progressRef,
  explodedRef,
  activeComponent,
  onSelect,
}: {
  progressRef: React.MutableRefObject<number>
  explodedRef: React.MutableRefObject<number>
  activeComponent?: string | null
  onSelect: (artifact: FeaturedArtifact) => void
}) {
  const lunarArtifacts = useMemo(
    () => ARTIFACTS.filter((a) => a.body === 'moon'),
    [],
  )
  const actVisible = useInRange(progressRef, 0.54, 0.98)
  const earthVisible = useInRange(progressRef, 0.56, 0.98)

  if (!actVisible) return null

  return (
    <group>
      <Terrain options={terrainOptions} />

      {earthVisible && <EarthInSky position={[-420, 470, -1580]} scale={26} />}

      {/* Apollo 11 — Tranquility Base */}
      {lunarArtifacts.slice(0, 3).map((artifact) => {
        // Eagle Descent Stage is displayed by LunarModuleBreakdown during 0.56..0.76
        // Only render the static resting ArtifactMesh after breakdown completes (> 0.76)
        if (artifact.id === 'eagle-descent-stage' && progressRef.current <= 0.76) {
          return null
        }
        return (
          <ArtifactMesh
            key={artifact.id}
            artifact={artifact}
            explodedRef={explodedRef}
            activeComponent={activeComponent}
            onSelect={onSelect}
          />
        )
      })}
      {lunarArtifacts.slice(0, 3).map((artifact) => (
        <ArtifactMarker
          key={`marker-${artifact.id}`}
          artifact={artifact}
          progressRef={progressRef}
          onSelect={onSelect}
          range={[0.74, 0.92]}
          radius={MARKER_RADII[artifact.id] ?? 2.5}
          lift={artifact.id === 'eagle-descent-stage' ? 5.4 : 2.6}
        />
      ))}

      {/* Apollo 15 — Hadley–Apennine */}
      <FalconContext />
      {lunarArtifacts.slice(3).map((artifact) => (
        <ArtifactMesh
          key={artifact.id}
          artifact={artifact}
          explodedRef={explodedRef}
          activeComponent={activeComponent}
          onSelect={onSelect}
        />
      ))}
      {lunarArtifacts.slice(3).map((artifact) => (
        <ArtifactMarker
          key={`marker-${artifact.id}`}
          artifact={artifact}
          progressRef={progressRef}
          onSelect={onSelect}
          range={[0.78, 0.94]}
          radius={MARKER_RADII[artifact.id] ?? 3}
          lift={3.4}
        />
      ))}
    </group>
  )
}

function FalconContext() {
  return (
    <group position={[252, 0, -1400]}>
      <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.1, 2.1, 1.4, 8]} />
        <meshStandardMaterial color="#8a8a8e" metalness={0.4} roughness={0.6} />
      </mesh>
      {[
        [3.32, 3.32],
        [-3.32, 3.32],
        [3.32, -3.32],
        [-3.32, -3.32],
      ].map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.5, pz]}>
          <cylinderGeometry args={[0.06, 0.06, 1, 6]} />
          <meshStandardMaterial color="#77777b" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
