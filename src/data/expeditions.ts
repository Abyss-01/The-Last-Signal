/**
 * Expedition registry.
 *
 * These entries describe the *application's* content modules, not historical
 * missions. No survey, mission, or artifact data has been fabricated here —
 * every record starts as `pending` until real, sourced data is ingested.
 */

export type ExpeditionStatus = 'pending-survey' | 'in-preparation' | 'archived'

export interface ExpeditionSummary {
  /** URL-safe identifier used for routing. */
  id: string
  /** Human-readable expedition designation. */
  name: string
  /** Landing/region designation as it will appear in the interface. */
  region: string
  status: ExpeditionStatus
  /** Short description of the *module's* build state, not of the mission. */
  description: string
  /** Route path for the expedition workspace. */
  path: string
}

export const EXPEDITIONS: ExpeditionSummary[] = [
  {
    id: 'apollo-11',
    name: 'Apollo 11',
    region: 'Tranquility Base',
    status: 'in-preparation',
    description:
      'First expedition module. Survey environment and artifact records are under construction.',
    path: '/expeditions/apollo-11',
  },
]

export function getExpeditionById(id: string): ExpeditionSummary | undefined {
  return EXPEDITIONS.find((expedition) => expedition.id === id)
}
