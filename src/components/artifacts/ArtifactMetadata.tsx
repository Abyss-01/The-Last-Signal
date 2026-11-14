import type { Artifact } from '@/types/artifact'

import { categoryLabel, formatCoordinates } from '@/lib/artifact-utils'

import { ArtifactStatus, PositionAccuracyBadge } from './ArtifactStatus'

/**
 * Structured dossier for an artifact: identity, documented location
 * (with precision and accuracy caveats) and current status. Every value
 * is rendered straight from the data record, including its caveats.
 */

export function ArtifactMetadata({ artifact }: { artifact: Artifact }) {
  const { location, status } = artifact

  return (
    <div className="flex flex-col gap-6">
      <MetadataBlock title="Identity">
        <Row label="Official name">{artifact.officialName}</Row>
        <Row label="Catalogue ID">{artifact.id}</Row>
        <Row label="Designation">{artifact.designation ?? '—'}</Row>
        <Row label="Category">{categoryLabel(artifact.category)}</Row>
        <Row label="Mission">{artifact.missionId}</Row>
      </MetadataBlock>

      <MetadataBlock title="Location">
        <Row label="Celestial body">{location.body}</Row>
        <Row label="Landing site">{location.site}</Row>
        {location.coordinates ? (
          <Row label="Coordinates (documented)">
            {formatCoordinates(location.coordinates)}
          </Row>
        ) : null}
        {location.coordinates ? (
          <Row label="Coordinate note">
            {location.coordinateNote ??
              location.coordinates.referenceFrame}
          </Row>
        ) : null}
        <Row label="Coordinate precision">
          {PRECISION_LABEL[location.coordinatePrecision]}
        </Row>
        <div className="flex flex-col gap-2">
          <span className="data-label">Position accuracy</span>
          <PositionAccuracyBadge accuracy={location.positionAccuracy} />
          <p className="text-xs leading-relaxed text-lunar-400">
            {location.positionNote}
          </p>
        </div>
        {location.scenePlacement ? (
          <div className="hairline flex flex-col gap-1 border-t pt-3">
            <span className="data-label">2.5D scene anchor</span>
            <span className="data-value font-mono text-xs text-cyan-signal">
              {location.scenePlacement.anchor}
            </span>
            <p className="text-xs leading-relaxed text-lunar-400">
              {location.scenePlacement.note}
            </p>
          </div>
        ) : null}
      </MetadataBlock>

      <MetadataBlock title="Status">
        <ArtifactStatus status={status} />
      </MetadataBlock>
    </div>
  )
}

const PRECISION_LABEL: Record<Artifact['location']['coordinatePrecision'], string> = {
  site: 'Site-level (landing-point datum)',
  feature: 'Feature-level (rounded, not metre-precise)',
  none: 'No documented coordinates',
}

function MetadataBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="data-label border-b border-charcoal-700 pb-2">
        {title}
      </h3>
      <dl className="flex flex-col gap-3">{children}</dl>
    </div>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="data-label">{label}</dt>
      <dd className="data-value text-sm leading-relaxed text-lunar-200">
        {children}
      </dd>
    </div>
  )
}
