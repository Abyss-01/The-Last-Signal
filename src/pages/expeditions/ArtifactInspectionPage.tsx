import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpenText,
  ExternalLink,
  FileSearch,
  Images,
  Quote,
  Scan,
  SignalHigh,
} from 'lucide-react'

import { ArtifactMetadata } from '@/components/artifacts/ArtifactMetadata'
import { ArtifactTimeline } from '@/components/artifacts/ArtifactTimeline'
import { HudPanel } from '@/components/ui/HudPanel'

import { getArtifactById } from '@/lib/artifact-utils'

/**
 * Artifact inspection — detailed view of a single registered artifact.
 *
 * The route accepts an :artifactId parameter and renders the matching record
 * from the verified registry. If no record exists for the requested ID, the
 * page reports that honestly — it never invents one.
 */
export function ArtifactInspectionPage() {
  const { artifactId } = useParams<{ artifactId: string }>()
  const artifact = artifactId
    ? getArtifactById('apollo-11', artifactId)
    : undefined

  if (!artifact) {
    return <UnknownArtifact artifactId={artifactId} />
  }

  const primary = artifact.media[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10"
    >
      <header className="flex flex-col gap-3 pt-6">
        <Link
          to="/expeditions/apollo-11"
          className="data-label inline-flex w-fit items-center gap-2 text-lunar-400 transition-colors hover:text-lunar-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Apollo 11 expedition
        </Link>
        <p className="data-label text-cyan-signal">Artifact inspection</p>
        <h1 className="text-3xl font-semibold text-lunar-50 sm:text-4xl">
          {artifact.displayName}
        </h1>
        <p className="data-label text-lunar-400">{artifact.officialName}</p>
      </header>

      {/* Primary imagery ------------------------------------------------ */}
      {primary ? (
        <HudPanel
          label="Primary artifact imagery"
          className="flex flex-col gap-3"
        >
          <div className="hairline overflow-hidden border bg-charcoal-950">
            <img
              src={primary.url}
              alt={primary.alt}
              className="max-h-[28rem] w-full object-contain"
            />
          </div>
          <p className="text-xs leading-relaxed text-lunar-400">
            {primary.alt}
          </p>
          <p className="data-label text-lunar-400">
            Credit: {primary.credit}
            {primary.nasaId ? ` · NASA ID ${primary.nasaId}` : ''}
          </p>
        </HudPanel>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-5">
        {/* Left: descriptive record ------------------------------------ */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <HudPanel className="flex flex-col gap-5">
            <SectionHeading icon={<Scan className="h-5 w-5 text-amber-signal" aria-hidden="true" />}>
              Purpose
            </SectionHeading>
            <p className="text-sm leading-relaxed text-lunar-300">
              {artifact.history.purpose}
            </p>

            <SectionHeading>
              Technical description
            </SectionHeading>
            <p className="text-sm leading-relaxed text-lunar-300">
              {artifact.history.technicalDescription}
            </p>

            <SectionHeading>
              Operational history
            </SectionHeading>
            <p className="text-sm leading-relaxed text-lunar-300">
              {artifact.history.operationalHistory}
            </p>
          </HudPanel>

          <HudPanel
            label="Historical timeline"
            className="flex flex-col gap-5"
          >
            <SectionHeading>
              Historical timeline
            </SectionHeading>
            <ArtifactTimeline artifact={artifact} />
          </HudPanel>

          <HudPanel className="flex flex-col gap-4">
            <SectionHeading>
              Final known disposition
            </SectionHeading>
            <p className="text-sm leading-relaxed text-lunar-300">
              {artifact.history.disposition}
            </p>
            {artifact.registryNote ? (
              <p className="hairline border-t pt-3 text-xs leading-relaxed text-amber-signal">
                Registry note: {artifact.registryNote}
              </p>
            ) : null}
          </HudPanel>
        </div>

        {/* Right: dossier + narrative + sources ------------------------ */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <HudPanel label="Record dossier" className="flex flex-col gap-4">
            <SectionHeading icon={<FileSearch className="h-5 w-5 text-cyan-signal" aria-hidden="true" />}>
              Record dossier
            </SectionHeading>
            <ArtifactMetadata artifact={artifact} />
          </HudPanel>

          {/* Interpretive storytelling — clearly separated from facts. */}
          <HudPanel
            label="Narrative interpretation"
            className="flex flex-col gap-4 border-amber-signal-dim"
          >
            <SectionHeading icon={<Quote className="h-5 w-5 text-amber-signal" aria-hidden="true" />}>
              Narrative — interpretation
            </SectionHeading>
            <p className="data-label text-amber-signal">
              Interpretive storytelling, not a documented source
            </p>
            <p className="text-sm leading-relaxed text-lunar-300">
              {artifact.narrative}
            </p>
          </HudPanel>

          {/* Source references ------------------------------------------ */}
          <HudPanel
            label="Source references"
            className="flex flex-col gap-4"
          >
            <SectionHeading icon={<BookOpenText className="h-5 w-5 text-cyan-signal" aria-hidden="true" />}>
              Source references
            </SectionHeading>
            <ol className="flex flex-col gap-4">
              {artifact.sources.map((source, index) => (
                <li key={source.id} className="hairline border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    <span className="data-label mt-0.5 border border-charcoal-600 px-1.5 py-0.5 text-lunar-400">
                      S{index + 1}
                    </span>
                    <div className="flex flex-col gap-1">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-start gap-1.5 text-sm font-medium leading-snug text-lunar-100 underline decoration-charcoal-500 underline-offset-2 transition-colors hover:text-cyan-signal"
                      >
                        {source.title}
                        <ExternalLink
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      </a>
                      <p className="text-xs text-lunar-400">{source.publisher}</p>
                      <p className="data-label text-lunar-500">{source.type}</p>
                      <ul className="mt-1 flex flex-col gap-1">
                        {source.supports.map((claim) => (
                          <li
                            key={claim}
                            className="flex gap-1.5 text-xs leading-relaxed text-lunar-400"
                          >
                            <span aria-hidden="true" className="text-cyan-signal-dim">
                              ▸
                            </span>
                            {claim}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </HudPanel>
        </div>
      </div>

      {/* Full media gallery -------------------------------------------- */}
      {artifact.media.length > 1 ? (
        <section
          aria-labelledby="media-gallery-heading"
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <Images className="h-5 w-5 text-amber-signal" aria-hidden="true" />
            <h2
              id="media-gallery-heading"
              className="text-base font-semibold text-lunar-100"
            >
              Media gallery — NASA imagery
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {artifact.media.map((asset) => (
              <figure
                key={asset.id}
                className="hud-panel flex flex-col gap-3 p-4"
              >
                <div className="hairline overflow-hidden border bg-charcoal-950">
                  <img
                    src={asset.url}
                    alt={asset.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
                <figcaption className="flex flex-col gap-1">
                  <span className="data-label text-lunar-400">
                    {asset.nasaId ? `NASA ID ${asset.nasaId}` : asset.kind}
                    {asset.kind === 'diagram' ? ' · diagram' : ''}
                  </span>
                  <span className="text-xs leading-relaxed text-lunar-400">
                    {asset.alt}
                  </span>
                  <span className="data-label text-lunar-500">
                    Credit: {asset.credit}
                  </span>
                  <a
                    href={asset.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="data-label inline-flex w-fit items-center gap-1.5 text-cyan-signal hover:text-cyan-signal-pale"
                  >
                    Source
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* Reserved 2.5D artifact viewport ------------------------------- */}
      <HudPanel
        label="Artifact viewport"
        className="hud-grid flex h-72 items-center justify-center"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <SignalHigh className="h-7 w-7 text-lunar-400" aria-hidden="true" />
          <p className="data-label text-lunar-400">Detail viewport reserved</p>
          <p className="max-w-md text-sm text-lunar-400">
            This panel will host the interactive 3D artifact viewer once the
            reconstruction milestone begins. Scene placement for this record:{' '}
            <span className="font-mono text-cyan-signal">
              {artifact.location.scenePlacement?.anchor ?? '—'}
            </span>
            .
          </p>
        </div>
      </HudPanel>
    </motion.div>
  )
}

function SectionHeading({
  children,
  icon,
}: {
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <h2 className="text-base font-semibold text-lunar-100">{children}</h2>
    </div>
  )
}

/** Honest empty state: the registry has no record for the requested ID. */
function UnknownArtifact({ artifactId }: { artifactId?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10"
    >
      <header className="flex flex-col gap-3 pt-6">
        <Link
          to="/expeditions/apollo-11"
          className="data-label inline-flex w-fit items-center gap-2 text-lunar-400 transition-colors hover:text-lunar-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Apollo 11 expedition
        </Link>
        <p className="data-label text-cyan-signal">Artifact inspection</p>
        <h1 className="text-3xl font-semibold text-lunar-50 sm:text-4xl">
          No record found
        </h1>
        <div className="data-value flex flex-wrap gap-x-6 gap-y-1 text-sm text-lunar-400">
          <span>
            Requested ID: <span className="text-cyan-signal">{artifactId ?? '—'}</span>
          </span>
          <span>Registry status: no record</span>
        </div>
      </header>

      <HudPanel className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <FileSearch className="h-5 w-5 text-amber-signal" aria-hidden="true" />
          <h2 className="text-base font-semibold text-lunar-100">
            Registry query returned empty
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-lunar-400">
          No artifact record is registered under this identifier for the
          Apollo 11 expedition. The archive does not fabricate records — only
          documented, source-verified artifacts appear in the registry. Return
          to the expedition page to browse the verified inventory.
        </p>
        <Link
          to="/expeditions/apollo-11"
          className="data-label inline-flex w-fit items-center gap-2 border border-charcoal-600 px-3 py-2 text-lunar-200 transition-colors hover:border-cyan-signal-dim hover:text-cyan-signal"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to artifact inventory
        </Link>
      </HudPanel>
    </motion.div>
  )
}
