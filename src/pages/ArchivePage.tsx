import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, X, MapPin, Fingerprint, Ruler } from 'lucide-react'

import { ARTIFACTS } from '@/data/artifacts'
import { MISSIONS, SATURN_V_STAGE_DISTINCTIONS } from '@/data/missions'
import { SOURCE_LEDGER } from '@/data/sources'
import type { ArtifactFilter, FeaturedArtifact } from '@/data/types'

/**
 * `/` — the 1969-inspired archival broadsheet. Paper, ink, hairline
 * rules: a front-page dispatch, the Saturn V stage ledger, the mission
 * chronology, the seven-object catalog with dossier drawer, and the
 * NASA primary-sources footer.
 */

export function ArchivePage() {
  const [filter, setFilter] = useState<ArtifactFilter>('all')
  const [dossierId, setDossierId] = useState<string | null>(null)

  const filtered = useMemo(
    () => ARTIFACTS.filter((a) => (filter === 'all' ? true : a.body === filter)),
    [filter],
  )
  const dossier = dossierId ? ARTIFACTS.find((a) => a.id === dossierId) ?? null : null

  return (
    <div className="ed-sheet" style={{ minHeight: '100vh' }}>
      {/* ---------------------------------------------------- Masthead */}
      <header style={{ padding: '26px 5vw 0' }}>
        <div
          className="ed-mono"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            paddingBottom: 10,
            borderBottom: '1px solid var(--ink-primary)',
          }}
        >
          <span>Quark Babies · NASA International Space Apps Challenge 2026</span>
          <span>Challenge: “Abandoned but not Forgotten”</span>
        </div>

        <h1
          className="ed-serif"
          style={{
            textAlign: 'center',
            fontSize: 'clamp(2.6rem, 7vw, 5.6rem)',
            fontWeight: 900,
            letterSpacing: '0.01em',
            margin: '30px 0 10px',
            lineHeight: 1,
          }}
        >
          Abandoned, Not Forgotten
        </h1>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2vw',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            borderTop: '1px solid var(--ink-primary)',
            borderBottom: '3px double var(--ink-primary)',
            padding: '10px 0',
          }}
        >
          <span className="ed-mono-sm" style={{ color: 'var(--ink-secondary)' }}>
            Vol. I — The Lunar &amp; Martian Editions
          </span>
          <span className="ed-mono-sm" style={{ color: 'var(--ochre)' }}>
            Four Missions · Seven Objects · One Archive
          </span>
          <span className="ed-mono-sm" style={{ color: 'var(--ink-secondary)' }}>
            Established Tranquility Base, 1969
          </span>
        </div>
      </header>

      {/* ------------------------------------------------ Thesis quote */}
      <section
        style={{
          padding: '44px 5vw 36px',
          textAlign: 'center',
          borderBottom: '1px solid var(--ink-primary)',
        }}
      >
        <blockquote
          className="ed-serif"
          style={{
            fontSize: 'clamp(1.3rem, 3.2vw, 2.1rem)',
            fontStyle: 'italic',
            fontWeight: 600,
            maxWidth: '46ch',
            margin: '0 auto',
            lineHeight: 1.35,
          }}
        >
          “We went to the Moon with machines we could not bring home — and to
          Mars with machines we never meant to return. This is the archive of
          what stayed.”
        </blockquote>
        <div className="ed-mono-sm" style={{ marginTop: 14, color: 'var(--ink-faint)' }}>
          — The Editors
        </div>
      </section>

      {/* ---------------------------------------------- Lead dispatch */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)',
          gap: 0,
          borderBottom: '1px solid var(--ink-primary)',
        }}
      >
        <article style={{ padding: '36px 3vw 40px 5vw', borderRight: '1px solid var(--rule)' }}>
          <div className="ed-mono" style={{ color: 'var(--ochre)' }}>
            Lead Dispatch
          </div>
          <h2
            className="ed-serif"
            style={{ fontSize: 'clamp(1.7rem, 3.6vw, 2.9rem)', fontWeight: 700, margin: '10px 0 16px', lineHeight: 1.12 }}
          >
            The Journey from Liftoff to Permanence
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 2.2vw' }}>
            <p className="ed-body ed-drop-cap" style={{ margin: 0 }}>
              On 16 July 1969, a Saturn V rose from Kennedy Space Center and began
              shedding its own body: the S-IC and S-II stages fell away into the
              Atlantic Ocean, and the S-IVB, having pushed Apollo 11 toward the
              Moon, drifted into orbit around the Sun. The rocket that carried the
              first explorers survives nowhere on Earth — and nowhere on the Moon.
            </p>
            <p className="ed-body" style={{ margin: 0 }}>
              What does remain is quieter and more permanent. Half of the Lunar
              Module Eagle still stands at Tranquility Base, with a laser mirror
              and a listening post nearby that kept working after the crew left.
              Two years later a rover was parked on the Moon with its batteries
              drained. Twenty-six years after that — a leap to a different
              mission, a different planet — a lander wrapped in airbags opened on
              Mars and gave a small rover its start, and a marathon rover later
              drove 45.16 kilometres before falling silent in a dust storm.
            </p>
          </div>
          <p className="ed-body" style={{ marginTop: 18, marginBottom: 0 }}>
            This archive documents all seven objects — where they are, what they
            did, and what they still teach us — sourced to NASA primary records.
            The full journey can be flown in three dimensions.
          </p>
          <Link
            to="/expedition"
            onClick={undefined}
            className="ed-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 26, textDecoration: 'none' }}
          >
            Begin the Expedition
            <ArrowRight size={14} />
          </Link>
        </article>

        {/* Saturn V stages sidebar */}
        <aside style={{ padding: '36px 5vw 40px 3vw', background: 'var(--paper-tinted)' }}>
          <div className="ed-mono" style={{ color: 'var(--ink-secondary)' }}>
            From the Launch Desk
          </div>
          <h3 className="ed-serif" style={{ fontSize: '1.35rem', fontWeight: 700, margin: '8px 0 6px' }}>
            What Happened to the Rocket?
          </h3>
          <hr className="ed-rule-thin" style={{ marginBottom: 14 }} />
          <p className="ed-body" style={{ fontSize: '0.92rem', margin: 0 }}>
            The Saturn V’s stages are launch hardware — discarded in flight — and
            are never counted among the surface artifacts of the Moon or Mars.
          </p>
          {SATURN_V_STAGE_DISTINCTIONS.map((stage) => (
            <div key={stage.stage} style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                <strong className="ed-serif" style={{ fontSize: '1rem' }}>{stage.stage}</strong>
                <span
                  className="ed-mono-sm"
                  style={{
                    color: '#fff',
                    background: 'var(--ochre)',
                    padding: '2px 6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Discarded in flight
                </span>
              </div>
              <p className="ed-body" style={{ fontSize: '0.85rem', margin: '4px 0 0' }}>
                {stage.fate}
              </p>
            </div>
          ))}
        </aside>
      </section>

      {/* -------------------------------------------- Chronology strip */}
      <section style={{ borderBottom: '1px solid var(--ink-primary)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          }}
        >
          {MISSIONS.map((mission, i) => (
            <div
              key={mission.id}
              style={{
                padding: '24px 2vw 26px',
                borderRight: i < MISSIONS.length - 1 ? '1px solid var(--rule)' : 0,
              }}
            >
              <div
                className="ed-serif"
                style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--ochre)' }}
              >
                {mission.era}
              </div>
              <div className="ed-mono" style={{ marginTop: 4 }}>{mission.name}</div>
              <hr className="ed-rule-thin" style={{ margin: '10px 0' }} />
              <p className="ed-body" style={{ fontSize: '0.85rem', margin: 0 }}>
                {mission.site}
              </p>
              <p
                className="ed-mono-sm"
                style={{ marginTop: 8, color: 'var(--science-green)' }}
              >
                {mission.keyDates[0]?.date}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- Catalog */}
      <section style={{ padding: '34px 5vw 44px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div className="ed-mono" style={{ color: 'var(--ochre)' }}>
              The Catalog of Left-Behind Machines
            </div>
            <h2 className="ed-serif" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, margin: '8px 0 0' }}>
              Seven Objects, Documented
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(
              [
                ['all', `All (${ARTIFACTS.length})`],
                ['moon', `Moon (${ARTIFACTS.filter((a) => a.body === 'moon').length})`],
                ['mars', `Mars (${ARTIFACTS.filter((a) => a.body === 'mars').length})`],
              ] as [ArtifactFilter, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`ed-filter${filter === value ? ' is-active' : ''}`}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <hr className="ed-rule" style={{ marginTop: 18 }} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: 22,
            marginTop: 24,
          }}
        >
          {filtered.map((artifact) => (
            <CatalogCard
              key={artifact.id}
              artifact={artifact}
              onOpenDossier={() => setDossierId(artifact.id)}
            />
          ))}
        </div>
      </section>

      {/* --------------------------------------------- Sources ledger */}
      <footer style={{ background: 'var(--paper-tinted)', borderTop: '3px double var(--ink-primary)', padding: '30px 5vw 40px' }}>
        <div className="ed-mono" style={{ color: 'var(--ink-secondary)' }}>
          NASA Primary Sources &amp; Asset Provenance Ledger
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '10px 3vw',
            marginTop: 14,
          }}
        >
          {SOURCE_LEDGER.map((source) => (
            <div key={source.id} className="ed-body" style={{ fontSize: '0.85rem' }}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--ink-primary)', textUnderlineOffset: 3 }}
              >
                {source.title}
              </a>
              <div className="ed-mono-sm" style={{ color: 'var(--ink-faint)', marginTop: 2 }}>
                {source.publisher}
              </div>
            </div>
          ))}
        </div>
        <hr className="ed-rule-thin" style={{ margin: '24px 0 14px' }} />
        <p className="ed-mono-sm" style={{ color: 'var(--ink-faint)', margin: 0 }}>
          3D presentations are illustrative engineering reconstructions built from NASA
          photography and documentation; NASA 3D Resources meshes are adopted automatically when
          installed. Archival imagery © NASA. Colophon: set in Playfair Display, Newsreader &amp;
          JetBrains Mono. Team Quark Babies — NASA Space Apps 2026.
        </p>
      </footer>

      {/* ---------------------------------------------- Dossier drawer */}
      {dossier && (
        <DossierDrawer artifact={dossier} onClose={() => setDossierId(null)} />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Catalog card                                                        */
/* ------------------------------------------------------------------ */

function CatalogCard({
  artifact,
  onOpenDossier,
}: {
  artifact: FeaturedArtifact
  onOpenDossier: () => void
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const mission = MISSIONS.find((m) => m.id === artifact.missionId)

  return (
    <article style={{ borderTop: '3px double var(--ink-primary)', paddingTop: 10 }}>
      <div className="ed-plate" style={{ aspectRatio: '4 / 3' }}>
        {artifact.localImage && !imageFailed ? (
          <img
            src={artifact.localImage}
            alt={artifact.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="ed-plate-fallback" style={{ width: '100%', height: '100%', padding: 10 }}>
            <span className="ed-mono-sm" style={{ color: 'var(--ink-secondary)' }}>
              Archival plate pending — {artifact.nasaImageId ? `NASA ID ${artifact.nasaImageId}` : 'NASA imagery reference on file'}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 }}>
        <span className="ed-mono" style={{ color: 'var(--ochre)' }}>{artifact.catalog}</span>
        <span
          className="ed-mono-sm"
          style={{
            color: artifact.status.scienceContinues ? '#fff' : 'var(--ink-secondary)',
            background: artifact.status.scienceContinues ? 'var(--science-green)' : 'transparent',
            border: artifact.status.scienceContinues ? 0 : '1px solid var(--rule-strong)',
            padding: '2px 6px',
            textAlign: 'right',
          }}
        >
          {artifact.status.label}
        </span>
      </div>

      <h3 className="ed-serif" style={{ fontSize: '1.18rem', fontWeight: 700, margin: '6px 0 2px', lineHeight: 1.2 }}>
        {artifact.name}
      </h3>
      <div className="ed-mono-sm" style={{ color: 'var(--ink-faint)' }}>
        {mission?.name} · {mission?.era}
      </div>

      <p
        className="ed-mono-sm"
        style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, color: 'var(--ink-secondary)' }}
      >
        <MapPin size={10} />
        {artifact.coordinate?.dms ?? 'Coordinates referenced to mission record'}
      </p>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button type="button" className="ed-btn-ghost is-active" onClick={onOpenDossier}>
          Read the Dossier
        </button>
        <Link
          to={`/expedition?focus=${artifact.id}`}
          className="ed-btn-ghost"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          Inspect in 3D
          <ArrowRight size={11} />
        </Link>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Dossier drawer                                                      */
/* ------------------------------------------------------------------ */

const DOSSIER_SECTIONS = [
  ['story', '1 · The Story'],
  ['mission', '2 · The Mission'],
  ['engineering', '3 · The Engineering'],
  ['fate', '4 · The Fate'],
  ['legacy', '5 · The Legacy'],
] as const

function DossierDrawer({
  artifact,
  onClose,
}: {
  artifact: FeaturedArtifact
  onClose: () => void
}) {
  const mission = MISSIONS.find((m) => m.id === artifact.missionId)

  return (
    <>
      <div
        className="ed-drawer-backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside className="ed-drawer" aria-label={`Dossier: ${artifact.name}`}>
        <div style={{ padding: '26px 30px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                className="ed-mono"
                style={{ color: 'var(--paper)', background: 'var(--ink-primary)', padding: '3px 8px', display: 'inline-block' }}
              >
                {artifact.catalog}
              </span>
              <h2 className="ed-serif" style={{ fontSize: '1.6rem', fontWeight: 700, margin: '12px 0 2px', lineHeight: 1.15 }}>
                {artifact.name}
              </h2>
              <div className="ed-mono-sm" style={{ color: 'var(--ink-faint)' }}>
                {artifact.designation} · {mission?.name} ({mission?.era})
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close dossier" style={{ background: 'transparent', border: '1px solid var(--rule-strong)', padding: 6, cursor: 'pointer', lineHeight: 0 }}>
              <X size={15} />
            </button>
          </div>

          <span
            className="ed-mono-sm"
            style={{
              display: 'inline-block',
              marginTop: 12,
              color: artifact.status.scienceContinues ? '#fff' : 'var(--ink-secondary)',
              background: artifact.status.scienceContinues ? 'var(--science-green)' : 'var(--paper-deep)',
              padding: '3px 8px',
            }}
          >
            {artifact.status.label} — {artifact.status.summary}
          </span>

          <hr className="ed-rule" style={{ margin: '18px 0' }} />

          {/* Coordinates */}
          <h3 className="ed-mono" style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--ochre)' }}>
            <MapPin size={11} /> Coordinates &amp; precision
          </h3>
          {artifact.coordinate ? (
            <>
              <p className="ed-body" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '6px 0' }}>
                {artifact.coordinate.dms}
              </p>
              <p className="ed-body" style={{ fontSize: '0.85rem', margin: '0 0 4px' }}>
                {artifact.coordinate.note}
              </p>
              <p className="ed-mono-sm" style={{ color: 'var(--ink-faint)' }}>
                Reference frame: {artifact.coordinate.referenceFrame}
              </p>
            </>
          ) : (
            <p className="ed-body" style={{ fontSize: '0.85rem' }}>{artifact.coordinateUncertainty}</p>
          )}

          <hr className="ed-rule-thin" style={{ margin: '14px 0' }} />

          {/* Provenance */}
          <h3 className="ed-mono" style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--ochre)' }}>
            <Fingerprint size={11} /> Asset provenance
          </h3>
          <p className="ed-body" style={{ fontSize: '0.85rem', margin: '6px 0 0' }}>
            <strong>{artifact.provenance.label}.</strong> {artifact.provenance.note}
          </p>

          <hr className="ed-rule-thin" style={{ margin: '14px 0' }} />

          {/* 5-part narrative */}
          {DOSSIER_SECTIONS.map(([key, label]) => (
            <section key={key} style={{ marginBottom: 14 }}>
              <h3 className="ed-mono" style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--science-green)' }}>
                <Ruler size={10} /> {label}
              </h3>
              <p className="ed-body" style={{ fontSize: '0.95rem', margin: '4px 0 0' }}>
                {artifact.narrative[key]}
              </p>
            </section>
          ))}

          <hr className="ed-rule" style={{ margin: '16px 0' }} />

          {/* Sources */}
          <h3 className="ed-mono" style={{ color: 'var(--ink-secondary)' }}>NASA primary sources</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
            {artifact.sources.map((source) => (
              <li key={source.id} className="ed-body" style={{ fontSize: '0.82rem', marginBottom: 6 }}>
                <a href={source.url} target="_blank" rel="noreferrer" style={{ color: 'var(--ink-primary)', textUnderlineOffset: 3 }}>
                  {source.title}
                </a>
                <span className="ed-mono-sm" style={{ color: 'var(--ink-faint)' }}> — {source.publisher}</span>
              </li>
            ))}
          </ul>

          <Link
            to={`/expedition?focus=${artifact.id}`}
            className="ed-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 22, textDecoration: 'none' }}
          >
            Inspect in 3D
            <ArrowRight size={14} />
          </Link>
        </div>
      </aside>
    </>
  )
}
