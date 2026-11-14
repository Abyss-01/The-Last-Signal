import type { StatusRecord } from '@/types/artifact'

import { positionAccuracyLabel } from '@/lib/artifact-utils'
import type { PositionAccuracy } from '@/types/artifact'

/**
 * Status readout for an artifact record: operational state, whether the
 * object remains at the landing site, and whether observations continue.
 * The copy always mirrors the data record — nothing is embellished here.
 */

const OPERATIONAL_META: Record<
  StatusRecord['operational'],
  { label: string; className: string }
> = {
  operational: {
    label: 'Operational — in scientific use',
    className: 'border-cyan-signal-dim text-cyan-signal',
  },
  inactive: {
    label: 'Inactive',
    className: 'border-lunar-600 text-lunar-400',
  },
  unknown: {
    label: 'Status unknown',
    className: 'border-amber-signal-dim text-amber-signal',
  },
  recovered: {
    label: 'Recovered — returned to Earth',
    className: 'border-amber-signal-dim text-amber-signal',
  },
}

export function ArtifactStatus({ status }: { status: StatusRecord }) {
  const meta = OPERATIONAL_META[status.operational]

  return (
    <div className="flex flex-col gap-3">
      <span
        className={`data-label inline-flex w-fit items-center gap-2 border px-2.5 py-1 ${meta.className}`}
      >
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 animate-signal-pulse rounded-full bg-current"
        />
        {meta.label}
      </span>
      <ul className="hairline flex flex-col gap-2 border-t pt-3 text-sm text-lunar-400">
        <li className="data-value flex items-center justify-between gap-3 text-sm">
          <span className="data-label">Remains at landing site</span>
          <span>{status.surfaceRemains ? 'Yes' : 'No'}</span>
        </li>
        <li className="data-value flex items-center justify-between gap-3 text-sm">
          <span className="data-label">Observations continue</span>
          <span>{status.observationsContinue ? 'Yes' : 'No'}</span>
        </li>
      </ul>
      {status.lastVerified ? (
        <p className="text-xs leading-relaxed text-lunar-400">
          <span className="data-label mr-2">Last verified</span>
          {status.lastVerified}
        </p>
      ) : null}
      {status.note ? (
        <p className="text-xs leading-relaxed text-amber-signal">
          {status.note}
        </p>
      ) : null}
    </div>
  )
}

/** Compact badge for the documented position-accuracy classification. */
export function PositionAccuracyBadge({
  accuracy,
}: {
  accuracy: PositionAccuracy
}) {
  const isDocumented =
    accuracy === 'documented-datum' || accuracy === 'documented-relative'

  return (
    <span
      className={`data-label inline-flex w-fit items-center gap-2 border px-2 py-0.5 ${
        isDocumented
          ? 'border-cyan-signal-dim text-cyan-signal'
          : 'border-amber-signal-dim text-amber-signal'
      }`}
    >
      {positionAccuracyLabel(accuracy)}
    </span>
  )
}
