import type {
  Artifact,
  GeoCoordinates,
  MissionProfile,
  PositionAccuracy,
  SourceRef,
} from '@/types/artifact'

import { ALL_ARTIFACTS, ALL_MISSIONS } from '@/data/artifacts'

/** All artifacts for a given mission. */
export function getMissionArtifacts(missionId: string): Artifact[] {
  return ALL_ARTIFACTS.filter((artifact) => artifact.missionId === missionId)
}

/** Artifacts that remain at the landing site. */
export function getSurfaceArtifacts(artifacts: Artifact[]): Artifact[] {
  return artifacts.filter((artifact) => artifact.status.surfaceRemains)
}

/** Artifacts documented as recovered/returned to Earth. */
export function getRecoveredArtifacts(artifacts: Artifact[]): Artifact[] {
  return artifacts.filter(
    (artifact) => !artifact.status.surfaceRemains || artifact.status.operational === 'recovered',
  )
}

/** Look up an artifact by mission and id. */
export function getArtifactById(missionId: string, artifactId: string): Artifact | undefined {
  return ALL_ARTIFACTS.find(
    (artifact) => artifact.missionId === missionId && artifact.id === artifactId,
  )
}

/** Look up a mission profile by id. */
export function getMissionProfile(missionId: string): MissionProfile | undefined {
  return ALL_MISSIONS.find((mission) => mission.id === missionId)
}

/** Resolve timeline event source ids to source records. */
export function resolveSources(
  artifact: Artifact,
  sourceIds: string[],
): SourceRef[] {
  return sourceIds
    .map((id) => artifact.sources.find((source) => source.id === id))
    .filter((source): source is SourceRef => source !== undefined)
}

/** Format documented coordinates as degrees with hemisphere labels. */
export function formatCoordinates(coordinates: GeoCoordinates): string {
  const lat = `${Math.abs(coordinates.latitude).toFixed(5)}° ${
    coordinates.latitude >= 0 ? 'N' : 'S'
  }`
  const lon = `${Math.abs(coordinates.longitude).toFixed(5)}° ${
    coordinates.longitude >= 0 ? 'E' : 'W'
  }`
  return `${lat}, ${lon}`
}

const POSITION_ACCURACY_LABELS: Record<PositionAccuracy, string> = {
  'documented-datum': 'Site datum — documented',
  'documented-relative': 'Documented relative position',
  reconstructed: 'Reconstructed (approximate)',
  unknown: 'Unknown — uncertainty preserved',
  'not-applicable': 'Not applicable (recovered)',
}

export function positionAccuracyLabel(accuracy: PositionAccuracy): string {
  return POSITION_ACCURACY_LABELS[accuracy]
}

/** Small classification label for display. */
export function categoryLabel(category: Artifact['category']): string {
  switch (category) {
    case 'spacecraft':
      return 'Spacecraft hardware'
    case 'experiment':
      return 'Scientific experiment'
    case 'surface-equipment':
      return 'Surface equipment'
    case 'commemorative':
      return 'Commemorative object'
  }
}
