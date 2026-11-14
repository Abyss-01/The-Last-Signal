/**
 * Artifact data model — Abandoned but not Forgotten.
 *
 * Designed to describe human-made objects left at (or recovered from)
 * extraterrestrial landing sites, for any mission and any celestial body.
 *
 * Core principles:
 *  - Historical facts and interpretive narrative are separate fields.
 *  - Geographic coordinates and 2.5D scene placement are separate concepts.
 *  - Position uncertainty is preserved explicitly, never invented away.
 *  - Every historical claim traces to a cited source.
 */

/** Celestial bodies covered by the archive. */
export type CelestialBody = 'moon' | 'mars'

/** High-level object classification. */
export type ArtifactCategory =
  | 'spacecraft'
  | 'experiment'
  | 'surface-equipment'
  | 'commemorative'

/**
 * How well the object's position is known. Drives disclaimers in the
 * interface and constraints for the 2.5D reconstruction.
 */
export type PositionAccuracy =
  /** The object defines the site reference point itself. */
  | 'documented-datum'
  /** Position documented relative to the datum (and/or documented feature coordinates). */
  | 'documented-relative'
  /** Approximate position derived for the reconstruction only. */
  | 'reconstructed'
  /** Not documented in the sources consulted. */
  | 'unknown'
  /** No surface position applies (e.g. object was recovered). */
  | 'not-applicable'

/** Precision level of documented geographic coordinates. */
export type CoordinatePrecision = 'site' | 'feature' | 'none'

export interface GeoCoordinates {
  /** Signed decimal degrees; positive = north. */
  latitude: number
  /** Signed decimal degrees; positive = east. */
  longitude: number
  /** How the coordinates were derived / which reference frame they use. */
  referenceFrame: string
}

/**
 * Anchor for the future 2.5D reconstruction.
 *
 * IMPORTANT: these are scene-design notes, never geographic coordinates.
 * They may only use documented relative positions or explicitly flag
 * reconstructed approximations.
 */
export interface ScenePlacement {
  /** Stable anchor name for the reconstruction (e.g. 'site-origin'). */
  anchor: string
  /** Placement note, including any accuracy caveat. */
  note: string
}

export interface LocationRecord {
  body: CelestialBody
  /** Human-readable landing-site designation. */
  site: string
  /** Documented geographic coordinates, when available. */
  coordinates?: GeoCoordinates
  coordinatePrecision: CoordinatePrecision
  /** Explains what the coordinates represent and their limitations. */
  coordinateNote?: string
  positionAccuracy: PositionAccuracy
  /** States what is — and is not — known about the position. */
  positionNote: string
  scenePlacement?: ScenePlacement
}

export type ArtifactOperationalStatus =
  | 'operational'
  | 'inactive'
  | 'unknown'
  | 'recovered'

export interface StatusRecord {
  /** Whether the object remains at the landing site. */
  surfaceRemains: boolean
  operational: ArtifactOperationalStatus
  /** Whether scientific observations of/with the object continue. */
  observationsContinue: boolean
  /** When/how the status was last verified, honestly scoped. */
  lastVerified?: string
  note?: string
}

export type SourceType =
  | 'nasa-archive'
  | 'nasa-mission-document'
  | 'nasa-technical-report'
  | 'nasa-research'
  | 'nasa-image-metadata'

export interface SourceRef {
  /** Unique within the artifact record. */
  id: string
  title: string
  publisher: string
  url: string
  type: SourceType
  /** The specific claims in this record that this source supports. */
  supports: string[]
}

export type MediaKind = 'photograph' | 'diagram' | 'illustration'

export interface MediaAsset {
  /** Unique within the artifact record. */
  id: string
  kind: MediaKind
  /** Local asset URL served from /public. */
  url: string
  /** NASA image identifier, when applicable. */
  nasaId?: string
  /** Canonical NASA source page/record for the image. */
  sourceUrl: string
  alt: string
  credit: string
}

export interface TimelineEvent {
  /** Documented date/time label (UTC when documented). */
  date: string
  title: string
  description: string
  /** IDs of entries in the parent artifact's `sources` array. */
  sourceIds: string[]
}

export interface Artifact {
  /** Unique, URL-safe artifact identifier within its mission. */
  id: string
  /** Mission identifier, matching the expedition registry. */
  missionId: string
  /** Name as documented by NASA/archive sources. */
  officialName: string
  /** Name shown in the interface. */
  displayName: string
  category: ArtifactCategory
  /** Short archival designation (e.g. NSSDCA experiment ID, ALSEP code). */
  designation?: string
  location: LocationRecord
  history: {
    /** Documented deployment/arrival date on the surface. */
    deploymentDate: string
    /** Documented scientific or engineering purpose. */
    purpose: string
    /** Documented technical description. */
    technicalDescription: string
    /** Documented operational history. */
    operationalHistory: string
    timeline: TimelineEvent[]
    /** Final known disposition, honestly scoped. */
    disposition: string
  }
  /**
   * Interpretive storytelling: why humanity brought it, what it accomplished,
   * what it tells us. Kept separate from documented facts above and presented
   * as interpretation in the interface.
   */
  narrative: string
  status: StatusRecord
  /** Optional registry-level note (e.g. why a recovered object is catalogued). */
  registryNote?: string
  media: MediaAsset[]
  sources: SourceRef[]
}

/** Mission-level record used by expedition pages. */
export interface MissionProfile {
  id: string
  designation: string
  body: CelestialBody
  site: string
  /** Documented landing date/time (UTC). */
  landingDate: string
  /** Documented surface-departure date/time (UTC). */
  liftoffDate: string
  /** Documented EVA milestones as free-form documented labels. */
  evaMilestones: string[]
  /** Documented mission facts worth surfacing (each traceable). */
  keyFacts: string[]
  /** Documented landing-site coordinates (the site datum). */
  siteCoordinates: GeoCoordinates
  experimentPackage: string
  summary: string
}
