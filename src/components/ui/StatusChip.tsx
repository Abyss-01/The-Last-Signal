import type { ExpeditionStatus } from '@/data/expeditions'

/**
 * Small telemetry-style status chip. Colour is driven by the expedition
 * status so all views stay consistent.
 */

const STATUS_META: Record<ExpeditionStatus, { label: string; className: string }> = {
  'pending-survey': {
    label: 'Pending survey',
    className: 'border-lunar-600 text-lunar-400',
  },
  'in-preparation': {
    label: 'In preparation',
    className: 'border-amber-signal-dim text-amber-signal',
  },
  archived: {
    label: 'Archived',
    className: 'border-cyan-signal-dim text-cyan-signal',
  },
}

export function StatusChip({ status }: { status: ExpeditionStatus }) {
  const meta = STATUS_META[status]

  return (
    <span
      className={`data-label inline-flex items-center gap-2 border px-2.5 py-1 ${meta.className}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 animate-signal-pulse rounded-full bg-current"
      />
      {meta.label}
    </span>
  )
}
