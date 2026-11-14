import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarClock,
  Compass,
  MapPinned,
  PackageOpen,
  Radio,
  RotateCcw,
} from 'lucide-react'

import { ArtifactCard } from '@/components/artifacts/ArtifactCard'
import { PositionAccuracyBadge } from '@/components/artifacts/ArtifactStatus'
import { HudPanel } from '@/components/ui/HudPanel'
import { StatusChip } from '@/components/ui/StatusChip'

import { APOLLO11_MISSION } from '@/data/artifacts'
import {
  getRecoveredArtifacts,
  getMissionArtifacts,
  getSurfaceArtifacts,
  formatCoordinates,
} from '@/lib/artifact-utils'

/**
 * Apollo 11 expedition workspace — mission identification, site information,
 * artifact inventory and mission dates, all rendered from the verified
 * registry data in `src/data/artifacts/apollo-11.ts`.
 *
 * The isometric 2.5D survey environment will mount in the reserved viewport.
 */
export function Apollo11ExpeditionPage() {
  const artifacts = getMissionArtifacts(APOLLO11_MISSION.id)
  const surfaceArtifacts = getSurfaceArtifacts(artifacts)
  const recoveredArtifacts = getRecoveredArtifacts(artifacts)
  const mission = APOLLO11_MISSION

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10"
    >
      <header className="flex flex-col gap-3 pt-6">
        <Link
          to="/expeditions"
          className="data-label inline-flex w-fit items-center gap-2 text-lunar-400 transition-colors hover:text-lunar-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          All expeditions
        </Link>
        <p className="data-label text-cyan-signal">Expedition module 01</p>
        <h1 className="text-3xl font-semibold text-lunar-50 sm:text-4xl">
          {mission.designation} — Tranquility Base
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status="in-preparation" />
          <span className="data-label text-lunar-400">
            {surfaceArtifacts.length} surface records ·{' '}
            {recoveredArtifacts.length}{' '}
            {recoveredArtifacts.length === 1 ? 'recovered record' : 'recovered records'}
          </span>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-lunar-300">
          {mission.summary}
        </p>
      </header>

      {/* Terrain viewport placeholder — the 3D environment mounts here later. */}
      <HudPanel
        label="Survey environment viewport"
        className="hud-grid flex h-96 items-center justify-center"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Compass className="h-8 w-8 text-lunar-400" aria-hidden="true" />
          <p className="data-label text-lunar-400">
            Survey viewport reserved
          </p>
          <p className="max-w-md text-sm text-lunar-400">
            The interactive terrain environment for this site is not yet
            deployed. Artifact records below carry the documented positions
            it will reconstruct.
          </p>
        </div>
      </HudPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mission identification ------------------------------------- */}
        <HudPanel className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-amber-signal" aria-hidden="true" />
            <h2 className="text-base font-semibold text-lunar-100">
              Mission identification
            </h2>
          </div>
          <dl className="flex flex-col gap-3 text-sm">
            <MetaRow label="Designation">{mission.designation}</MetaRow>
            <MetaRow label="Celestial body">{mission.body}</MetaRow>
            <MetaRow label="Landing">{mission.landingDate}</MetaRow>
            <MetaRow label="Liftoff">{mission.liftoffDate}</MetaRow>
            {mission.evaMilestones.map((milestone) => (
              <MetaRow key={milestone} label="EVA milestone">
                {milestone}
              </MetaRow>
            ))}
          </dl>
        </HudPanel>

        {/* Site information ------------------------------------------- */}
        <HudPanel className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <MapPinned className="h-5 w-5 text-amber-signal" aria-hidden="true" />
            <h2 className="text-base font-semibold text-lunar-100">
              Site information
            </h2>
          </div>
          <dl className="flex flex-col gap-3 text-sm">
            <MetaRow label="Site">{mission.site}</MetaRow>
            <MetaRow label="Coordinates (documented)">
              {formatCoordinates(mission.siteCoordinates)}
            </MetaRow>
            <MetaRow label="Coordinate note">
              {mission.siteCoordinates.referenceFrame}
            </MetaRow>
            <div className="hairline flex flex-col gap-2 border-t pt-3">
              <span className="data-label">Site accuracy</span>
              <PositionAccuracyBadge accuracy="documented-datum" />
            </div>
            <MetaRow label="Surface experiments">
              {mission.experimentPackage}
            </MetaRow>
          </dl>
          <ul className="hairline flex flex-col gap-2 border-t pt-3 text-xs leading-relaxed text-lunar-400">
            {mission.keyFacts.map((fact) => (
              <li key={fact} className="flex gap-2">
                <Radio className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-signal-dim" aria-hidden="true" />
                {fact}
              </li>
            ))}
          </ul>
        </HudPanel>
      </div>

      {/* Artifact inventory ------------------------------------------- */}
      <section aria-labelledby="artifact-inventory-heading" className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <PackageOpen className="h-5 w-5 text-amber-signal" aria-hidden="true" />
          <h2
            id="artifact-inventory-heading"
            className="text-base font-semibold text-lunar-100"
          >
            Artifact inventory — permanent surface records
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {surfaceArtifacts.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} />
          ))}
        </div>
      </section>

      {recoveredArtifacts.length > 0 ? (
        <section
          aria-labelledby="recovered-inventory-heading"
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-cyan-signal" aria-hidden="true" />
              <h2
                id="recovered-inventory-heading"
                className="text-base font-semibold text-lunar-100"
              >
                Recovered equipment — returned to Earth
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-lunar-400">
              Objects brought home by the crew are documented here to keep the
              distinction explicit. They are excluded from the permanent
              surface-artifact catalogue and from the site reconstruction.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recoveredArtifacts.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        </section>
      ) : null}
    </motion.div>
  )
}

function MetaRow({
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
