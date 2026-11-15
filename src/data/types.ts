/**
 * Abandoned, Not Forgotten — data layer types (Quark Babies).
 *
 * Dedicated Lunar scope: Apollo missions, verified lunar artifacts,
 * coordinate uncertainty preserved, and launch hardware discarded in
 * flight never presented as a planetary-surface artifact.
 */

/** Celestial body a mission/artifact belongs to (for filters and zones). */
export type CelestialBody = 'moon'

/**
 * Object status per context.md §7. Not every object is "abandoned" in the
 * same sense — the category is always displayed alongside the object.
 */
export type ObjectStatusCategory =
  | 'left-on-lunar-surface'
  | 'discarded-in-flight'
  | 'returned-to-earth'
  | 'status-uncertain'

export interface StatusMeta {
  category: ObjectStatusCategory
  /** Human label, e.g. "Left on the lunar surface". */
  label: string
  /** Whether scientific use of/with the object continued. */
  scienceContinues: boolean
  /** Honest status summary. */
  summary: string
}

/**
 * A verified coordinate. Precision is explicit — sub-metre offsets from a
 * landing site are labelled `site-vicinity` and reference their parent
 * lander, never presented as an independent surveyed fix.
 */
export interface VerifiedCoordinate {
  /** Signed decimal degrees. */
  latitude: number
  /** Signed decimal degrees, east positive. */
  longitude: number
  /** DMS rendering of the same coordinates, for archival display. */
  dms: string
  /** Coordinate reference frame / derivation. */
  referenceFrame: string
  /** How precisely the coordinates locate this object. */
  precision: 'site' | 'site-vicinity'
  /** Required honest note about what the coordinates locate. */
  note: string
}

/** Provenance of the 3D/artistic asset shown for a featured object. */
export interface AssetProvenance {
  /** NASA 3D Resources mesh vs. our own reconstruction. */
  kind: 'illustrative-reconstruction' | 'nasa-3d-resources'
  /** Label shown in the interface. */
  label: string
  /** Honest note distinguishing the asset from an engineering replica. */
  note: string
}

/** One component of an object's exploded view. */
export interface ExplodedComponent {
  /** Stable id, matches a named child group inside ArtifactMesh. */
  id: string
  label: string
  /** Plain-language function of the component. */
  description: string
  /** Model-space offset (metres) applied when the exploded view opens. */
  explodeOffset: [number, number, number]
}

/** The fixed 5-part narrative hierarchy from context.md §10. */
export interface ObjectNarrative {
  /** What is this, and why should I care? */
  story: string
  /** Why did NASA send it? */
  mission: string
  /** What did it do and how did it work? */
  engineering: string
  /** What happened to it? */
  fate: string
  /** What did it teach us? */
  legacy: string
}

/** A NASA primary source (mission pages, NSSDCA records, JPL archives…). */
export interface PrimarySourceRecord {
  id: string
  title: string
  publisher: string
  url: string
}

/** A documented date worth surfacing on a mission or object. */
export interface KeyDate {
  label: string
  date: string
}

/** A mission in the expedition registry. */
export interface MissionRecord {
  id: 'apollo-11' | 'apollo-15'
  name: string
  era: string
  body: CelestialBody
  site: string
  siteCoordinate: VerifiedCoordinate
  keyDates: KeyDate[]
  summary: string
  sources: PrimarySourceRecord[]
}

/** One of the featured objects. */
export interface FeaturedArtifact {
  id: string
  /** Catalog badge, e.g. "OBJ-01". */
  catalog: string
  missionId: 'apollo-11' | 'apollo-15'
  name: string
  /** Official designation (e.g. NSSDCA ID). */
  designation: string
  body: CelestialBody
  status: StatusMeta
  coordinate: VerifiedCoordinate
  narrative: ObjectNarrative
  provenance: AssetProvenance
  /** Components exposed by the exploded-view animation. */
  components: ExplodedComponent[]
  /** World position (metres) in the Three.js expedition scene. */
  sceneAnchor: [number, number, number]
  /** Local image URL under public/assets/artifacts. */
  localImage?: string
  /** NASA image ID where available, e.g. "AS11-40-5927". */
  nasaImageId?: string
  /** NASA public page where the image was verified. */
  nasaImageSource?: string
  /** Archival caption / credit for the plate. */
  imageCredit?: string
  sources: PrimarySourceRecord[]
}

/** What happened to each Saturn V stage (vs. surface artifacts). */
export interface LaunchStageDistinction {
  stage: string
  role: string
  fate: string
  /** Status category — always 'discarded-in-flight' here. */
  status: StatusMeta
}

export type ArtifactFilter = 'all' | 'apollo-11' | 'apollo-15'

/** The choreographed acts of the expedition. */
export interface TimelineAct {
  id: string
  title: string
  year: string
  /** Normalized scroll progress window [start, end]. */
  range: [number, number]
  /** Caption shown in the HUD while the act is on screen. */
  caption: string
}
