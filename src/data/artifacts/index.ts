import type { Artifact, MissionProfile } from '@/types/artifact'

import { APOLLO11_ARTIFACTS, APOLLO11_MISSION } from './apollo-11'

/** Mission registry — add future expeditions here without restructuring. */
export const ALL_MISSIONS: MissionProfile[] = [APOLLO11_MISSION]

/** Flat artifact registry across all missions. */
export const ALL_ARTIFACTS: Artifact[] = [...APOLLO11_ARTIFACTS]

export { APOLLO11_ARTIFACTS, APOLLO11_MISSION }
