import { Link } from 'react-router-dom'
import { ArrowUpRight, Image } from 'lucide-react'

import type { Artifact } from '@/types/artifact'

import { artifactHref } from '@/app/routes'
import { categoryLabel } from '@/lib/artifact-utils'

import { PositionAccuracyBadge } from './ArtifactStatus'

/**
 * Registry card for a single artifact. Links to the inspection route for the
 * artifact's mission. Shows only what the record itself supports — the
 * primary photograph, identity, category, status and position accuracy.
 */

interface ArtifactCardProps {
  artifact: Artifact
}

export function ArtifactCard({ artifact }: ArtifactCardProps) {
  const primary = artifact.media[0]
  const href = artifactHref(artifact.missionId, artifact.id)

  return (
    <Link
      to={href}
      className="hud-panel group flex flex-col transition-colors hover:border-cyan-signal-dim focus-visible:border-cyan-signal focus-visible:outline-none"
      aria-label={`Open artifact record: ${artifact.displayName}`}
    >
      <div className="hairline relative mb-4 aspect-[4/3] overflow-hidden border bg-charcoal-950">
        {primary ? (
          <img
            src={primary.url}
            alt={primary.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="hud-grid flex h-full items-center justify-center">
            <Image className="h-6 w-6 text-lunar-500" aria-hidden="true" />
          </div>
        )}
        <span
          aria-hidden="true"
          className="data-label absolute right-2 top-2 border border-charcoal-600 bg-charcoal-950/80 px-2 py-0.5 text-lunar-400"
        >
          {categoryLabel(artifact.category)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-snug text-lunar-100 group-hover:text-lunar-50">
            {artifact.displayName}
          </h3>
          <ArrowUpRight
            className="mt-1 h-4 w-4 shrink-0 text-lunar-500 transition-colors group-hover:text-cyan-signal"
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PositionAccuracyBadge accuracy={artifact.location.positionAccuracy} />
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-lunar-400">
          {artifact.history.disposition}
        </p>
      </div>
    </Link>
  )
}
