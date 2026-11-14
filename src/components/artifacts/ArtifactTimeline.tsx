import type { Artifact, TimelineEvent } from '@/types/artifact'

import { resolveSources } from '@/lib/artifact-utils'

/**
 * Chronological event list for an artifact record. Each event cites the
 * record sources that support it — resolved by id and rendered as
 * [S#] reference chips matching the source list elsewhere on the page.
 */

export function ArtifactTimeline({ artifact }: { artifact: Artifact }) {
  return (
    <ol className="flex flex-col gap-5">
      {artifact.history.timeline.map((event, index) => (
        <TimelineRow
          key={`${event.date}-${event.title}`}
          event={event}
          index={index}
          artifact={artifact}
        />
      ))}
    </ol>
  )
}

function TimelineRow({
  event,
  index,
  artifact,
}: {
  event: TimelineEvent
  index: number
  artifact: Artifact
}) {
  const sources = resolveSources(artifact, event.sourceIds)
  // Source citation numbers are stable per record: position in the
  // artifact's sources array, rendered as [S1], [S2], ...
  const citationIds = new Map(
    artifact.sources.map((source, sourceIndex) => [source.id, sourceIndex + 1]),
  )

  return (
    <li className="hairline relative border-l pl-5">
      <span
        aria-hidden="true"
        className="absolute left-[-4.5px] top-1.5 h-2 w-2 border border-cyan-signal bg-charcoal-900"
      />
      <p className="data-label text-cyan-signal">{event.date}</p>
      <h4 className="mt-1 text-sm font-semibold text-lunar-100">
        {event.title}
      </h4>
      <p className="mt-1 text-sm leading-relaxed text-lunar-400">
        {event.description}
      </p>
      {sources.length > 0 ? (
        <p className="mt-2 flex flex-wrap items-center gap-1.5">
          {sources.map((source) => (
            <span
              key={source.id}
              className="data-label border border-charcoal-600 px-1.5 py-0.5 text-lunar-400"
            >
              S{citationIds.get(source.id)}
            </span>
          ))}
        </p>
      ) : null}
      <span className="sr-only">Timeline entry {index + 1}</span>
    </li>
  )
}
