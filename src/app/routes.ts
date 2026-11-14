/**
 * Central route path registry.
 *
 * Pages import paths from here so navigation targets stay consistent with
 * the router configuration without creating circular imports.
 */

export const ROUTES = {
  archive: '/',
  expeditions: '/expeditions',
  apollo11: '/expeditions/apollo-11',
  /** Expedition workspace base path for a mission id. */
  expedition: (missionId: string) => `/expeditions/${missionId}`,
  /** Router path pattern for the artifact inspection route (Apollo 11). */
  artifactPattern: '/expeditions/apollo-11/artifacts/:artifactId',
} as const

/** Build a concrete link to an artifact record within a mission. */
export function artifactHref(missionId: string, artifactId: string): string {
  return `/expeditions/${missionId}/artifacts/${artifactId}`
}
