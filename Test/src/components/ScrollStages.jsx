import React from 'react';

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
              <span className="story-tag">{chap.tag}</span>
              <span className="story-index">{chap.index} / 04</span>
            </div>

            <h2 className="story-title">{chap.title}</h2>
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
    </div>
  );
}
