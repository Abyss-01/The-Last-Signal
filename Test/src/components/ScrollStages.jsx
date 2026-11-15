import React from 'react';
import ScrambleText from './ScrambleText';
import ParticleFooter from './ParticleFooter';

export const SCROLL_CHAPTERS = [
  {
    id: 'intro',
    index: '00',
    tag: '00 — FLIGHT CONFIGURATION',
    title: 'Apollo Lunar Module Architecture',
    subtitle: 'Integrated Descent & Ascent Stage Assemblies',
    description: 'An interactive structural deconstruction of the Apollo Lunar Module. Scroll downward to separate and examine verified visible surface assemblies in 3D space.',
    actionHint: '↓ SCROLL TO DECONSTRUCT'
  },
  {
    id: 'stage-sep',
    index: '01',
    tag: '01 — STAGE SEPARATION',
    title: 'Ascent Stage Isolation',
    subtitle: 'Pressurized Crew Cabin & Inter-Stage Interface',
    description: 'The upper crew cabin elevates vertically along the +Y axis, isolating the ascent propulsion plane and pressurized bulkhead from the descent stage foundation.'
  },
  {
    id: 'gear-egress',
    index: '02',
    tag: '02 — SURFACE INTERFACE',
    title: 'Cantilever Struts & Egress Porch',
    subtitle: 'Primary Compression Gear & Forward EVA Portal',
    description: 'Four deployable landing gear assemblies shift downward and outward, while the forward extravehicular activity (EVA) hatch and work platform extend along the +Z axis.'
  },
  {
    id: 'rcs-avionics',
    index: '03',
    tag: '03 — ATTITUDE & TELEMETRY',
    title: 'Reaction Control Quads & Radar Dish',
    subtitle: 'Hypergolic RCS Clusters & Steerable Antenna Mast',
    description: 'Cruciform four-nozzle attitude control thruster clusters drift radially outward along quadrant vectors; the steerable S-band radar mast and docking ring lift upward.'
  },
  {
    id: 'full-exploded',
    index: '04',
    tag: '04 — DECONSTRUCTED ISOLATION',
    title: 'Full Exploded Inspection',
    subtitle: 'Complete Modular Surface Breakdown',
    description: 'Auxiliary spherical propellant and helium pressure vessels expand into radial symmetry. All 7 visible structural modules are separated for inspection. Hover your mouse over any floating component to inspect its exterior geometry.',
    actionHint: '↖ HOVER ANY COMPONENT TO REVEAL DETAILS'
  }
];

export default function ScrollStages({ activeChapterIndex, onJumpToChapter }) {
  return (
    <div className="scroll-story-container" aria-label="Interactive Exhibit Story Timeline">
      {SCROLL_CHAPTERS.map((chap, idx) => (
        <section
          key={chap.id}
          className={`scroll-story-section section-${idx} ${activeChapterIndex === idx ? 'active' : ''}`}
          id={`chapter-${chap.id}`}
        >
          <div className="story-card">
            <div className="story-meta-row">
              <span className="story-tag">
                {activeChapterIndex === idx ? (
                  <ScrambleText text={chap.tag} triggerKey={activeChapterIndex} duration={450} />
                ) : (
                  chap.tag
                )}
              </span>
              <span className="story-index">{chap.index} / 04</span>
            </div>

            <h2 className="story-title">
              {activeChapterIndex === idx ? (
                <ScrambleText text={chap.title} triggerKey={activeChapterIndex} duration={500} as="span" />
              ) : (
                chap.title
              )}
            </h2>
            <h3 className="story-subtitle">{chap.subtitle}</h3>
            <p className="story-description">{chap.description}</p>

            {chap.actionHint && (
              <div className="story-hint">
                <span className="hint-pulse" />
                <span>{chap.actionHint}</span>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* Exhibit Colophon & Technical Footer */}
      <footer className="exhibit-colophon-section" aria-label="Apollo Lunar Module Exhibit Colophon">
        <div className="colophon-card">
          <ParticleFooter />
          <div className="colophon-header">
            <span className="colophon-tag">EXHIBIT ARCHIVE // APOLLO LM-5</span>
            <h2 className="colophon-title">
              <ScrambleText text="Mission Engineering Archive" triggerKey={activeChapterIndex} duration={600} />
            </h2>
            <p className="colophon-subtitle">
              Curated spatial deconstruction of Grumman Aircraft Engineering Corp. Lunar Excursion Module architecture.
            </p>
          </div>

          <div className="colophon-stats-grid">
            <div className="colophon-stat-item">
              <span className="stat-label">TOTAL VEHICLE MASS</span>
              <span className="stat-value">15,103 kg</span>
              <span className="stat-note">Gross Lunar Liftoff / Landing</span>
            </div>
            <div className="colophon-stat-item">
              <span className="stat-label">DESCENT DELTA-V</span>
              <span className="stat-value">2,470 m/s</span>
              <span className="stat-note">Throttleable DPS Engine</span>
            </div>
            <div className="colophon-stat-item">
              <span className="stat-label">SURFACE STAY DURATION</span>
              <span className="stat-value">21.6 hours</span>
              <span className="stat-note">Tranquility Base (Apollo 11)</span>
            </div>
            <div className="colophon-stat-item">
              <span className="stat-label">CREW CAPACITY</span>
              <span className="stat-value">2 Astronauts</span>
              <span className="stat-note">Stand-up Egress Workstation</span>
            </div>
          </div>

          <div className="colophon-actions">
            <button
              className="btn-colophon-cta"
              onClick={() => onJumpToChapter(0)}
              aria-label="Return to assembled flight configuration"
            >
              ↑ RETURN TO FLIGHT CONFIGURATION
            </button>
            <div className="colophon-sources-note">
              Primary Sources: NASA SP-4029 // Apollo 11 Lunar Surface Journal (ALSJ) // Grumman LM News Reference
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
