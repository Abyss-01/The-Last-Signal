import { useMemo } from 'react'

import { ARTIFACTS } from '@/data/artifacts'
import { ArtifactMesh } from '../ArtifactMesh'
import { Terrain, ArtifactMarker } from './shared'

import type { FeaturedArtifact } from '@/data/types'

/**
 * Mars acts (progress 0.78 → 1.0): dusty ochre regolith at Ares Vallis
 * (OBJ-05 Pathfinder lander, OBJ-06 Sojourner) and Meridiani Planum
 * (OBJ-07 Opportunity), under salmon fog.
 */

const terrainOptions = {
  size: [1300, 640] as [number, number],
  center: [660, -2060] as [number, number],
  amplitude: 18,
  detailAmplitude: 5,
  ridges: 2.4,
  craters: [
    [560, -2130, 70, 7],
    [790, -2000, 110, 10],
    [500, -2010, 55, 5],
  ] as [number, number, number, number][],
  flatten: [
    [600, -2000, 20],
    [608, -2004, 10],
    [700, -2100, 26],
  ] as [number, number, number][],
  colorA: '#a05a34',
  colorB: '#78432a',
}

const MARKER_RADII: Record<string, number> = {
  'mars-pathfinder-lander': 4,
  'sojourner-rover': 2.4,
  'opportunity-rover': 3.4,
}

export function MarsSurfaceAct({
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
  const marsArtifacts = useMemo(
    () => ARTIFACTS.filter((a) => a.body === 'mars'),
    [],
  )
  const rocks = useMemo(() => {
    const list: { position: [number, number, number]; scale: number; rot: number }[] = []
    let seed = 17
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let i = 0; i < 26; i++) {
      const x = 480 + rand() * 380
      const z = -2150 + rand() * 260
      const nearSite = (Math.hypot(x - 600, z + 2000) < 26 ||
        Math.hypot(x - 700, z + 2100) < 30)
      if (nearSite) continue
      list.push({
        position: [x, 0.2 + rand() * 0.3, z],
        scale: 0.6 + rand() * 2.4,
        rot: rand() * Math.PI * 2,
      })
    }
    return list
  }, [])

  return (
    <group>
      <Terrain options={terrainOptions} />

      {/* Context rocks — unlabelled set dressing */}
      {rocks.map((rock, i) => (
        <mesh
          key={i}
          position={rock.position}
          rotation={[rock.rot * 0.3, rock.rot, rock.rot * 0.17]}
          scale={rock.scale}
          castShadow
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#5f3623" roughness={1} metalness={0} />
        </mesh>
      ))}

      {marsArtifacts.map((artifact) => (
        <ArtifactMesh
          key={artifact.id}
          artifact={artifact}
          explodedRef={explodedRef}
          activeComponent={activeComponent}
          onSelect={onSelect}
        />
      ))}

      {marsArtifacts.map((artifact) => (
        <ArtifactMarker
          key={`marker-${artifact.id}`}
          artifact={artifact}
          progressRef={progressRef}
          onSelect={onSelect}
          range={[0.78, 1.0]}
          radius={MARKER_RADII[artifact.id] ?? 2.6}
          lift={artifact.id === 'mars-pathfinder-lander' ? 3.6 : 2.4}
        />
      ))}
    </group>
  )
}
