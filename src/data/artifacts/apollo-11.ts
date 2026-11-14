import type { Artifact, MissionProfile, SourceRef } from '@/types/artifact'

/**
 * Apollo 11 — Tranquility Base artifact registry.
 *
 * SOURCING RULES OBSERVED HERE
 *  - Facts come from the NASA sources listed in each record; `supports`
 *    states which claims each source underwrites.
 *  - Apollo 11's surface experiments were the EASEP (Early Apollo Scientific
 *    Experiments Package) — NOT the later ALSEP configuration.
 *  - Positions: only documented coordinates/relative positions are used.
 *    Where a position is undocumented, the uncertainty is preserved.
 *  - The Solar Wind Composition experiment is catalogued as RECOVERED
 *    equipment (returned to Earth) — it is explicitly NOT part of the
 *    permanent surface-artifact catalogue.
 */

/* ------------------------------------------------------------------------- */
/* Mission profile                                                            */
/* ------------------------------------------------------------------------- */

export const APOLLO11_MISSION: MissionProfile = {
  id: 'apollo-11',
  designation: 'Apollo 11',
  body: 'moon',
  site: 'Tranquility Base, Mare Tranquillitatis (Sea of Tranquility)',
  landingDate: '20 July 1969, 20:17:40 UT',
  liftoffDate: '21 July 1969, 17:54:01 UT (after 21 h 36 min on the surface)',
  evaMilestones: [
    'Armstrong stepped onto the lunar surface at 02:56:15 UT, 21 July 1969',
    'EVA ended at 05:11:13 UT, 21 July 1969, when the LM hatch was closed',
  ],
  keyFacts: [
    'Landing-site coordinates 0.67416° N, 23.47314° E, derived from Lunar Reconnaissance Orbiter imagery (DE 421 mean Earth/polar rotation axis reference frame)',
    'The crew collected 21.55 kg of lunar rock and soil and traversed about 250 m in total, ranging up to about 100 m from the LM',
    'The surface experiments flown were the Early Apollo Scientific Experiments Package (EASEP), the forerunner of ALSEP',
  ],
  siteCoordinates: {
    latitude: 0.67416,
    longitude: 23.47314,
    referenceFrame:
      'DE 421 mean Earth/polar rotation axis reference frame; coordinates determined from Lunar Reconnaissance Orbiter imagery (NSSDCA)',
  },
  experimentPackage:
    'Early Apollo Scientific Experiments Package (EASEP) — solar-powered, lunar-day-only operation; comprised the Passive Seismic Experiment and the Lunar Ranging Retroreflector (which required no power), plus a lunar dust detector on the central station.',
  summary:
    'First crewed lunar landing. The Lunar Module "Eagle" touched down at 20:17:40 UT on 20 July 1969; its descent stage remains at Tranquility Base as the site datum, while the ascent stage departed into lunar orbit and its fate is unknown.',
}

/* ------------------------------------------------------------------------- */
/* Shared source base (claims are itemised per artifact below)                */
/* ------------------------------------------------------------------------- */

const S_LM_EASEP: Omit<SourceRef, 'id' | 'supports'> = {
  title: 'Apollo 11 Lunar Module / EASEP (NSSDCA/COSPAR ID 1969-059C)',
  publisher: 'NASA Space Science Data Coordinated Archive (NSSDCA), Goddard Space Flight Center',
  url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',
  type: 'nasa-archive',
}

const S_APOLLO11_PAGE: Omit<SourceRef, 'id' | 'supports'> = {
  title: 'Apollo 11 (NSSDCA Lunar Science archive page)',
  publisher: 'NASA Space Science Data Coordinated Archive (NSSDCA), Goddard Space Flight Center',
  url: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo11.html',
  type: 'nasa-archive',
}

const S_LRRR: Omit<SourceRef, 'id' | 'supports'> = {
  title: 'Laser Ranging Retroreflector (NSSDCA Experiment ID 1969-059C-04, S078)',
  publisher: 'NASA Space Science Data Coordinated Archive (NSSDCA), Goddard Space Flight Center',
  url: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-04',
  type: 'nasa-archive',
}

const S_JPL_LLR: Omit<SourceRef, 'id' | 'supports'> = {
  title: 'The Apollo Experiment That Keeps on Giving (JPL News, 24 July 2019)',
  publisher: 'NASA Jet Propulsion Laboratory, California Institute of Technology',
  url: 'https://www.jpl.nasa.gov/news/the-apollo-experiment-that-keeps-on-giving/',
  type: 'nasa-research',
}

const S_PLATOFF: Omit<SourceRef, 'id' | 'supports'> = {
  title:
    'Platoff, A. M., "Where No Flag Has Gone Before: Political and Technical Aspects of Placing a Flag on the Moon" (NASA Contractor Report 188251, August 1993)',
  publisher: 'NASA Technical Reports Server (NTRS), Lyndon B. Johnson Space Center',
  url: 'https://ntrs.nasa.gov/citations/19940008327',
  type: 'nasa-technical-report',
}

const S_IMG = (
  nasaId: string,
  title: string,
  center: string,
  url: string,
): Omit<SourceRef, 'id' | 'supports'> => ({
  title: `NASA image ${nasaId} — ${title} (${center} image metadata, NASA Image and Video Library)`,
  publisher: 'NASA',
  url,
  type: 'nasa-image-metadata',
})

const IMAGES_API = 'https://images.nasa.gov/details/'

/* ------------------------------------------------------------------------- */
/* Artifacts                                                                  */
/* ------------------------------------------------------------------------- */

export const APOLLO11_ARTIFACTS: Artifact[] = [
  /* ------------------------------------------------------------- LM stage */
  {
    id: 'eagle-descent-stage',
    missionId: 'apollo-11',
    officialName: 'Lunar Module "Eagle" — descent stage',
    displayName: 'Eagle Descent Stage',
    category: 'spacecraft',
    designation: 'NSSDCA/COSPAR 1969-059C (LM/EASEP)',
    location: {
      body: 'moon',
      site: 'Tranquility Base, Mare Tranquillitatis',
      coordinates: {
        latitude: 0.67416,
        longitude: 23.47314,
        referenceFrame:
          'DE 421 mean Earth/polar rotation axis reference frame; coordinates determined from Lunar Reconnaissance Orbiter imagery (NSSDCA)',
      },
      coordinatePrecision: 'site',
      coordinateNote:
        'Site-level coordinates of the Apollo 11 landing point as documented by NSSDCA. They locate the landing site datum, not each individual object.',
      positionAccuracy: 'documented-datum',
      positionNote:
        'The descent stage remained standing at the landing point and serves as the datum to which other surface objects are documented relative to.',
      scenePlacement: {
        anchor: 'site-origin',
        note:
          'Reconstruction origin for the Tranquility Base environment. Scene placement uses local reconstruction coordinates only and is never derived from geographic coordinates.',
      },
    },
    history: {
      deploymentDate: '20 July 1969, 20:17:40 UT (lunar landing)',
      purpose:
        'The descent stage was the lower stage of the two-stage Apollo Lunar Module: it carried Commander Armstrong and LM pilot Aldrin from lunar orbit to the surface, supported surface operations as the crew base of operations, and served as the launch platform for the ascent stage.',
      technicalDescription:
        'Octagonal prism 4.2 m across and 1.7 m thick, with four landing legs with round footpads holding the stage 1.5 m above the surface (footpads 9.4 m apart on opposite legs). Descent engine: deep-throttling ablative rocket, maximum thrust about 45,000 N. Dry mass 2034 kg including stowed surface equipment; 8248 kg of propellant onboard initially (NSSDCA).',
      operationalHistory:
        'The descent stage fired for 756.3 s from 20:05 UT on 20 July 1969 for the powered descent, touching down at 20:17:40 UT in Mare Tranquillitatis. It functioned as the platform for the 21 h 36 min surface stay, during which the crew deployed EASEP, photographed the site and collected 21.55 kg of samples. At 17:54:01 UT on 21 July the ascent stage lifted off from the descent stage to rendezvous with the orbiting Command Module.',
      timeline: [
        {
          date: '16 July 1969',
          title: 'Launch',
          description:
            'Apollo 11 launched from Kennedy Space Center on a Saturn V. The LM spacecraft mass was 15,103 kg including both stages and propellants.',
          sourceIds: ['nssdca-lm-easep'],
        },
        {
          date: '20 July 1969, 20:17:40 UT',
          title: 'Landing at Tranquility Base',
          description:
            'The Eagle landed at 0.67416° N, 23.47314° E (LRO-derived coordinates), after a 756.3 s powered descent.',
          sourceIds: ['nssdca-lm-easep'],
        },
        {
          date: '21 July 1969, 02:39–05:11 UT',
          title: 'Single surface EVA',
          description:
            'Armstrong and Aldrin deployed EASEP and other instruments, unveiled the descent-stage plaque, raised the U.S. flag and collected 21.55 kg of lunar rock and soil.',
          sourceIds: ['nssdca-lm-easep'],
        },
        {
          date: '21 July 1969, 17:54:01 UT',
          title: 'Ascent stage liftoff',
          description:
            'The ascent stage launched from the descent stage, which was left behind on the Moon.',
          sourceIds: ['nssdca-lm-easep'],
        },
        {
          date: '22 July 1969, 00:01:01 UT',
          title: 'Ascent stage jettisoned into lunar orbit',
          description:
            'After docking with the Command Module, the LM ascent stage was jettisoned into lunar orbit. Its fate is not known; NSSDCA states it is assumed to have crashed into the lunar surface within the following 1 to 4 months.',
          sourceIds: ['nssdca-lm-easep'],
        },
        {
          date: '29 September 2009',
          title: 'Site documented from lunar orbit',
          description:
            'NASA\'s Lunar Reconnaissance Orbiter imaged the landing site, resolving the descent stage and experiment positions (image PIA12909, NASA/GSFC/Arizona State University).',
          sourceIds: ['img-pia12909'],
        },
      ],
      disposition:
        'Remains at Tranquility Base. The descent stage was left behind on the Moon and the landing site is periodically re-documented by orbital imaging; the ascent stage\'s ultimate fate is unknown (assumed surface impact within 1–4 months of jettison, per NSSDCA).',
    },
    narrative:
      'Humanity\'s first landing on another world ended — deliberately — with half of the spacecraft staying behind. The Eagle\'s descent stage was never meant to come home: it was the landing legs, the fuel tanks and the launch pad for the trip back. Its presence at Tranquility Base is why the site exists at all, and it anchors every other object in this registry. For future lunar archaeology, it is the first habitat of off-world human presence: a piece of engineered shelter, abandoned intact, on the airless plain where the first footsteps were taken.',
    status: {
      surfaceRemains: true,
      operational: 'inactive',
      observationsContinue: true,
      lastVerified:
        'The landing site is periodically re-imaged by NASA\'s Lunar Reconnaissance Orbiter; this record references LRO image PIA12909 (NASA/GSFC/Arizona State University, 29 September 2009).',
      note: 'Inert structure. No surface telemetry exists; "observations continue" refers to orbital imaging of the site.',
    },
    registryNote:
      'The ascent stage is NOT catalogued as a surface artifact: it was jettisoned in lunar orbit and its fate is unknown.',
    media: [
      {
        id: 'photo-eagle-surface',
        kind: 'photograph',
        url: '/assets/artifacts/apollo-11/eagle-descent-stage/as11-40-5927-eagle-at-tranquility-base.jpg',
        nasaId: 'AS11-40-5927',
        sourceUrl: IMAGES_API + 'as11-40-5927',
        alt: 'Astronaut Buzz Aldrin unloads the scientific experiments package from the stowage area of the Lunar Module "Eagle" at Tranquility Base; the solar wind experiment and the lunar surface TV camera stand beyond the LM\'s right leg.',
        credit: 'NASA / photographed by Neil A. Armstrong, 70 mm lunar surface camera',
      },
      {
        id: 'photo-lro-site',
        kind: 'photograph',
        url: '/assets/artifacts/apollo-11/eagle-descent-stage/PIA12909-lro-apollo-11-site.jpg',
        nasaId: 'PIA12909',
        sourceUrl: IMAGES_API + 'PIA12909',
        alt: 'Lunar Reconnaissance Orbiter image of the Apollo 11 landing site, annotated to show the Eagle descent stage and the LRRR/PSE experiment position, with the craters Little West and West and a 200-metre scale bar.',
        credit: 'NASA/GSFC/Arizona State University',
      },
      {
        id: 'diagram-lm',
        kind: 'diagram',
        url: '/assets/artifacts/apollo-11/diagrams/apollo-lm-diagram.gif',
        sourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',
        alt: 'Cutaway diagram of the Apollo Lunar Module showing the ascent and descent stages, landing legs, descent engine skirt and crew compartment.',
        credit: 'NASA History Office (via NSSDCA)',
      },
    ],
    sources: [
      {
        ...S_LM_EASEP,
        id: 'nssdca-lm-easep',
        supports: [
          'Landing date/time and landing-site coordinates (LRO-derived)',
          'Descent-stage dimensions, masses and engine description',
          'Powered-descent and surface-stay timeline',
          'Ascent-stage jettison and assumed fate',
          '21.55 kg of samples collected; ~250 m total traverse',
        ],
      },
      {
        ...S_IMG(
          'AS11-40-5927',
          'View of the Lunar Module Eagle on the Moon',
          'Johnson Space Center',
          'https://images.nasa.gov/details/as11-40-5927',
        ),
        id: 'img-as11-40-5927',
        supports: ['Surface photograph of the Eagle at Tranquility Base with EASEP stowage open'],
      },
      {
        ...S_IMG(
          'PIA12909',
          'Apollo 11: Second Look (Lunar Reconnaissance Orbiter)',
          'JPL / GSFC / Arizona State University',
          'https://images.nasa.gov/details/PIA12909',
        ),
        id: 'img-pia12909',
        supports: [
          'Descent stage remains at the site and is resolvable in LRO imagery',
          'Relative positions of the descent stage and the LRRR/PSE experiment cluster',
        ],
      },
    ],
  },

  /* --------------------------------------------------------------- LRRR */
  {
    id: 'laser-ranging-retroreflector',
    missionId: 'apollo-11',
    officialName: 'Laser Ranging Retroreflector (S078)',
    displayName: 'Laser Ranging Retroreflector',
    category: 'experiment',
    designation: 'NSSDCA Experiment 1969-059C-04 / S078',
    location: {
      body: 'moon',
      site: 'Tranquility Base, Mare Tranquillitatis',
      coordinatePrecision: 'none',
      positionAccuracy: 'documented-relative',
      positionNote:
        'NSSDCA documents that the LRRR was deployed about 5 m NNW of the EASEP central station. Absolute coordinates for the array itself are not stated in the sources consulted; the EASEP station coordinates (0.6735° N, 23.4730° E) are the documented reference.',
      scenePlacement: {
        anchor: 'easep-station-nnw-5m',
        note:
          'Reconstructed placement 5 m NNW of the EASEP central station anchor, following the documented relative distance and direction. Scene values are reconstruction coordinates, not geographic coordinates.',
      },
    },
    history: {
      deploymentDate: '21 July 1969 (deployed during the surface EVA)',
      purpose:
        'To reflect laser ranging pulses from Earth back to their point of origin, enabling precise measurement of the Earth–Moon distance, the motion of the Moon\'s centre of mass, lunar radius, and Earth geophysical information (NSSDCA).',
      technicalDescription:
        'A retroreflector array with a folding support structure for aiming and aligning the array toward Earth, built of cubes of fused silica (NSSDCA). The Apollo 11 array contains 100 quartz glass prisms ("corner cubes") and requires no power (JPL). NSSDCA lists the experiment mass as 77 kg.',
      operationalHistory:
        'Deployed by the crew about 5 m NNW of the EASEP central station during the 21 July 1969 EVA. Because the array is passive, it began working as soon as Earth-based observatories could target it — JPL describes the Apollo 11 deployment as the beginning of lunar laser ranging. Ranging continues to this day: as of JPL\'s 2019 anniversary article, telescopes at observatories in New Mexico, France, Italy and Germany fire lasers at the Apollo reflectors, measuring the Earth–Moon distance to within a few millimetres, with JPL analysing the results.',
      timeline: [
        {
          date: '21 July 1969',
          title: 'Deployment during EVA',
          description:
            'Deployed about 5 m NNW of the EASEP central station; considered part of EASEP though not attached to it and requiring no power.',
          sourceIds: ['nssdca-lm-easep'],
        },
        {
          date: 'From 1969',
          title: 'Lunar laser ranging begins',
          description:
            'Earth-based lasers began ranging to the array, measuring the Earth–Moon distance and the Moon\'s motion.',
          sourceIds: ['nssdca-lrrr', 'jpl-llr'],
        },
        {
          date: '24 July 2019',
          title: 'Ranging still active after 50 years',
          description:
            'JPL reports continuing lunar laser ranging from observatories in New Mexico, France, Italy and Germany, with distance measured to a few millimetres.',
          sourceIds: ['jpl-llr'],
        },
      ],
      disposition:
        'Remains on the lunar surface at Tranquility Base and is still in scientific use: the array is passive, requires no power, and lunar laser ranging to it (and the later Apollo arrays) continues.',
    },
    narrative:
      'Of everything the first Moon visitors left behind, this is the object that never stopped working. It was carried to the surface folded like a piece of luggage, unfolded toward Earth, and left — a passive mirror with no electronics, no power, no moving parts to fail. For more than five decades, observatories on Earth have bounced lasers off it to trace the Moon\'s orbit to the millimetre, measure the Moon\'s slow drift away from Earth, and even reveal that the lunar core is fluid. It is the closest thing humanity has to a permanently staffed lunar observatory: an instrument that asks nothing of the Moon, and answers every clear night it is asked.',
    status: {
      surfaceRemains: true,
      operational: 'operational',
      observationsContinue: true,
      lastVerified:
        'JPL news article (24 July 2019) reports continuing lunar laser ranging to the Apollo reflectors and ongoing JPL analysis of the results.',
      note: 'Passive array — "operational" describes continued scientific use, not onboard telemetry.',
    },
    media: [
      {
        id: 'photo-easep-carry',
        kind: 'photograph',
        url: '/assets/artifacts/apollo-11/retroreflector/6900957-easep-psep-lrrr-carry.jpg',
        nasaId: '6900957',
        sourceUrl: IMAGES_API + '6900957',
        alt: 'Astronaut Buzz Aldrin carries the two EASEP components across the lunar surface: the Passive Seismic Experiment Package in his left hand and the Laser Ranging Retroreflector in his right.',
        credit: 'NASA / Marshall Space Flight Center',
      },
    ],
    sources: [
      {
        ...S_LRRR,
        id: 'nssdca-lrrr',
        supports: [
          'Experiment purpose (Earth–Moon distance, centre-of-mass motion, lunar radius, geophysics)',
          'Fused-silica corner-cube construction and folding support structure',
          'Principal investigator: Dr. Carroll O. Alley (University of Maryland)',
          'Mass listed as 77 kg (NSSDCA facts in brief)',
        ],
      },
      {
        ...S_LM_EASEP,
        id: 'nssdca-lm-easep',
        supports: [
          'LRRR considered part of EASEP though not attached and requiring no power',
          'Deployed about 5 m NNW of the EASEP central station',
        ],
      },
      {
        ...S_JPL_LLR,
        id: 'jpl-llr',
        supports: [
          'Apollo 11 array contains 100 quartz glass corner cubes and requires no power',
          'Lunar laser ranging continues from observatories in New Mexico, France, Italy and Germany',
          'Earth–Moon distance measured to a few millimetres; JPL analyses results',
          'Ranging findings: Moon receding 3.8 cm/yr; evidence for a fluid lunar core',
        ],
      },
      {
        ...S_IMG(
          '6900957',
          'Aldrin carrying the PSEP and LRRR (EASEP components)',
          'Marshall Space Flight Center',
          'https://images.nasa.gov/details/6900957',
        ),
        id: 'img-6900957',
        supports: ['Both EASEP packages (PSEP left, LRRR right) photographed during deployment'],
      },
    ],
  },

  /* ---------------------------------------------------------------- PSE */
  {
    id: 'passive-seismic-experiment',
    missionId: 'apollo-11',
    officialName: 'Passive Seismic Experiment (EASEP)',
    displayName: 'Passive Seismic Experiment',
    category: 'experiment',
    designation: 'EASEP central station (with lunar dust detector)',
    location: {
      body: 'moon',
      site: 'Tranquility Base, Mare Tranquillitatis',
      coordinates: {
        latitude: 0.6735,
        longitude: 23.473,
        referenceFrame:
          'Coordinates as documented by NSSDCA for the EASEP deployment position',
      },
      coordinatePrecision: 'feature',
      coordinateNote:
        'NSSDCA documents the EASEP deployment position at 0.6735° N, 23.4730° E — approximately 17 m south of the LM. Coordinates are rounded to four decimal places and should be treated as feature-level, not metre-precise.',
      positionAccuracy: 'documented-relative',
      positionNote:
        'Deployed approximately 17 m south of the Lunar Module (documented). The Passive Seismic Experiment sits on the EASEP central station base.',
      scenePlacement: {
        anchor: 'lm-south-17m',
        note:
          'Reconstructed placement ~17 m south of the site origin, per the documented relative distance. Scene values are reconstruction coordinates.',
      },
    },
    history: {
      deploymentDate:
        '21 July 1969 (deployed during the EVA); turned on by ground command at 04:40:39 UT on 21 July 1969',
      purpose:
        'Designed to measure seismic activity and the physical properties of the lunar crust and interior (NSSDCA).',
      technicalDescription:
        'The EASEP had a total mass of 48 kg: a square base carrying the seismometer and a lunar dust detector, an isotope heater, a cylindrical antenna mast with positioning mechanism, and two canted solar panels facing east and west. It received uplink commands at 2119 MHz and transmitted telemetry at 2276.5 MHz. Because it was solar-powered, it could operate only during the lunar day (NSSDCA).',
      operationalHistory:
        'Deployed ~17 m south of the LM during the EVA and activated by ground command at 04:40:39 UT on 21 July 1969 while the astronauts were still on the surface. About 5 hours before local lunar sunset (10:58:46 UT on 3 August 1969), transmission was stopped by ground command as power began to drop as predicted. Operating temperatures exceeded the planned maximum by 30 °C, yet the EASEP functioned normally. It was turned on again for the next lunar day, but on 27 August 1969 — near noon of that second lunar day — it no longer accepted commands from Earth stations, and the experiment was terminated (NSSDCA).',
      timeline: [
        {
          date: '21 July 1969, 04:40:39 UT',
          title: 'Activated by ground command',
          description:
            'The EASEP was turned on from Earth while the astronauts were still on the surface.',
          sourceIds: ['nssdca-lm-easep'],
        },
        {
          date: '3 August 1969',
          title: 'Transmission stopped for lunar night',
          description:
            'About 5 hours before local lunar sunset, transmission was stopped by ground command as solar power began to drop, as predicted.',
          sourceIds: ['nssdca-lm-easep'],
        },
        {
          date: 'August 1969 (second lunar day)',
          title: 'Reactivated for a second lunar day',
          description:
            'The instrument was turned on again on the next lunar day despite operating temperatures that had exceeded the planned maximum by 30 °C.',
          sourceIds: ['nssdca-lm-easep'],
        },
        {
          date: '27 August 1969',
          title: 'Experiment terminated',
          description:
            'Near noon of the second lunar day, the EASEP no longer accepted commands from Earth stations and the experiment was terminated.',
          sourceIds: ['nssdca-lm-easep'],
        },
      ],
      disposition:
        'Remains on the lunar surface at the EASEP deployment position, ~17 m south of the descent stage. It ceased operating on 27 August 1969; the hardware itself was left in place.',
    },
    narrative:
      'The first listening post on another world. Humanity wanted to know whether the Moon shakes — and whether its interior is layered like Earth\'s — so the very first science package placed on the lunar surface carried an ear for moonquakes. It worked through its first two-week lunar day, survived the deep cold of lunar night by being switched off, woke again for a second day, and then fell permanently silent when it could no longer hear Earth. It still stands 17 metres south of the Eagle\'s legs, the quiet beginning of planetary seismology — an experiment that taught future missions how to listen longer.',
    status: {
      surfaceRemains: true,
      operational: 'inactive',
      observationsContinue: false,
      lastVerified:
        'Operational history per NSSDCA (Apollo 11 LM/EASEP record): transmission stopped 3 August 1969; command acceptance ended 27 August 1969.',
      note: 'The cause of the loss of command acceptance is not stated in the sources consulted and is not asserted here.',
    },
    media: [
      {
        id: 'photo-pse-deployment',
        kind: 'photograph',
        url: '/assets/artifacts/apollo-11/passive-seismic-experiment/as11-40-5951-pse-deployment.jpg',
        nasaId: 'AS11-40-5951',
        sourceUrl: IMAGES_API + 'as11-40-5951',
        alt: 'Astronaut Buzz Aldrin deploys the Passive Seismic Experiment Package on the lunar surface near Tranquility Base, with the Laser Ranging Retroreflector visible to the left.',
        credit: 'NASA / Johnson Space Center',
      },
      {
        id: 'photo-easep-carry-pse',
        kind: 'photograph',
        url: '/assets/artifacts/apollo-11/retroreflector/6900957-easep-psep-lrrr-carry.jpg',
        nasaId: '6900957',
        sourceUrl: IMAGES_API + '6900957',
        alt: 'Astronaut Buzz Aldrin carries the two EASEP components — the Passive Seismic Experiment Package and the Laser Ranging Retroreflector — across the lunar surface.',
        credit: 'NASA / Marshall Space Flight Center',
      },
    ],
    sources: [
      {
        ...S_LM_EASEP,
        id: 'nssdca-lm-easep',
        supports: [
          'PSE purpose (seismic activity, lunar crust and interior properties)',
          'EASEP 48 kg central station description (solar panels, antenna, isotope heater, dust detector)',
          'Deployment ~17 m south of the LM at 0.6735° N, 23.4730° E',
          'Activation 04:40:39 UT 21 July 1969; transmission stop ~3 August 1969',
          '30 °C over-temperature tolerance; reactivation; command acceptance ended 27 August 1969',
          'Solar-powered, lunar-day-only operation',
        ],
      },
      {
        ...S_IMG(
          'AS11-40-5951',
          'Aldrin deploys the Passive Seismic Experiment Package',
          'Johnson Space Center',
          'https://images.nasa.gov/details/as11-40-5951',
        ),
        id: 'img-as11-40-5951',
        supports: ['Deployment of the PSE photographed on the lunar surface'],
      },
      {
        ...S_IMG(
          '6900957',
          'Aldrin carrying the PSEP and LRRR (EASEP components)',
          'Marshall Space Flight Center',
          'https://images.nasa.gov/details/6900957',
        ),
        id: 'img-6900957-pse',
        supports: ['PSE carried to the deployment site together with the LRRR'],
      },
    ],
  },

  /* ------------------------------------------------------------ U.S. flag */
  {
    id: 'us-flag',
    missionId: 'apollo-11',
    officialName: 'Lunar Flag Assembly (United States flag)',
    displayName: 'U.S. Flag',
    category: 'commemorative',
    designation: 'Lunar Flag Assembly (per NASA CR-188251)',
    location: {
      body: 'moon',
      site: 'Tranquility Base, Mare Tranquillitatis',
      coordinatePrecision: 'none',
      positionAccuracy: 'unknown',
      positionNote:
        'The flag was deployed near the LM during the EVA, but a precise documented distance or direction from the LM is not stated in the sources consulted. The position is preserved as unknown rather than assigned arbitrary coordinates.',
      scenePlacement: {
        anchor: 'near-lm-reconstructed',
        note:
          'Any scene placement is an explicitly reconstructed approximation pending a documented position. Flagged as reconstructed in the reconstruction milestone.',
      },
    },
    history: {
      deploymentDate: '21 July 1969 (during the surface EVA)',
      purpose:
        'Commemorative: the first flag raised on the Moon, deployed during the first lunar-surface EVA (NSSDCA mission narrative; NASA CR-188251 documents the flag assembly\'s design and political background).',
      technicalDescription:
        'Per NASA CR-188251: the flagpole was built of aluminum tubing about an inch in diameter, electrolytically anodized to a gold colour, with a telescoping crossbar giving the flag a horizontal "ripple" appearance in the airless environment. The astronauts could drive the lower portion of the pole only about 6 to 9 inches into the lunar surface; a red ring 18 inches above the pole\'s base helped judge penetration depth.',
      operationalHistory:
        'The flag was set up during the EVA, and the crew spoke with President Nixon by radiotelephone beside it (NSSDCA). NASA CR-188251 records that the pole was difficult to drive into the dense subsoil and that "it is uncertain if the flag remained standing or was blown over by the engine blast when the ascent module took off" — no film footage of the Apollo 11 liftoff exists to confirm either way. The NSSDCA Apollo 11 page states the flag "was actually knocked over when the LM took off from the Moon 21 hours after landing". Both statements are preserved here rather than resolved into a single claim.',
      timeline: [
        {
          date: '21 July 1969',
          title: 'Deployed during EVA',
          description:
            'Flag raised near the LM; the pole penetrated only about 6–9 inches into the surface.',
          sourceIds: ['nssdca-apollo11', 'ntrs-platoff'],
        },
        {
          date: '21 July 1969, 17:54:01 UT',
          title: 'Ascent — final disposition uncertain',
          description:
            'NASA CR-188251: "It is uncertain if the flag remained standing or was blown over by the engine blast when the ascent module took off." NSSDCA states the flag was knocked over at liftoff. No film of the Apollo 11 liftoff exists to confirm either statement.',
          sourceIds: ['ntrs-platoff', 'nssdca-apollo11'],
        },
      ],
      disposition:
        'Remains on the lunar surface at Tranquility Base. Whether it still stands is uncertain: NSSDCA states it was knocked over by the LM liftoff, while NASA CR-188251 records the standing/blown-over question as uncertain.',
    },
    narrative:
      'A flag bought off the shelf for five dollars and fifty cents, modified by spacecraft-shop hands, and planted — with difficulty — in the dense lunar soil. It was not an official national act but a technical improvisation with a political heart, and it became the single most recognisable object from the mission. Its exact fate is a small, honest mystery: no camera watched the ascent, so whether it still stands at Tranquility Base is something no one on Earth can say. In the archaeology of space, even uncertainty is part of the record.',
    status: {
      surfaceRemains: true,
      operational: 'inactive',
      observationsContinue: false,
      lastVerified:
        'Disposition documented as uncertain in NASA CR-188251 (1993); NSSDCA page states the flag was knocked over at liftoff.',
      note: 'Standing state not resolvable from the sources consulted; both statements preserved.',
    },
    media: [
      {
        id: 'photo-flag',
        kind: 'photograph',
        url: '/assets/artifacts/apollo-11/us-flag/as11-40-5875-flag-and-aldrin.jpg',
        nasaId: 'AS11-40-5875',
        sourceUrl: IMAGES_API + 'as11-40-5875',
        alt: 'Astronaut Edwin E. Aldrin Jr. poses beside the deployed United States flag during the Apollo 11 EVA; the Lunar Module leg is at left and astronaut footprints cross the lunar soil.',
        credit: 'NASA / photographed by Neil A. Armstrong, 70 mm lunar surface camera',
      },
    ],
    sources: [
      {
        ...S_APOLLO11_PAGE,
        id: 'nssdca-apollo11',
        supports: [
          'Flag deployed during the EVA; Nixon radiotelephone call',
          'NSSDCA statement that the flag was knocked over when the LM took off 21 hours after landing',
        ],
      },
      {
        ...S_PLATOFF,
        id: 'ntrs-platoff',
        supports: [
          'Lunar Flag Assembly design (aluminum pole, gold anodizing, telescoping crossbar, ripple effect)',
          'Pole penetration limited to about 6–9 inches; red depth-judging ring 18 inches from base',
          '"It is uncertain if the flag remained standing or was blown over by the engine blast when the ascent module took off"; no film of the Apollo 11 liftoff exists',
        ],
      },
      {
        ...S_IMG(
          'AS11-40-5875',
          'Aldrin poses for photograph beside deployed U.S. flag',
          'Johnson Space Center',
          'https://images.nasa.gov/details/as11-40-5875',
        ),
        id: 'img-as11-40-5875',
        supports: ['Flag standing and deployed during the EVA (pre-ascent state)'],
      },
    ],
  },

  /* --------------------------------------------------------------- plaque */
  {
    id: 'lunar-plaque',
    missionId: 'apollo-11',
    officialName: 'Lunar Module commemorative plaque',
    displayName: 'Commemorative Plaque',
    category: 'commemorative',
    location: {
      body: 'moon',
      site: 'Tranquility Base, Mare Tranquillitatis',
      coordinatePrecision: 'none',
      positionAccuracy: 'documented-relative',
      positionNote:
        'Attached to the ladder on the landing-gear strut of the descent stage (NASA image metadata; NSSDCA). Its position is therefore fixed relative to the site datum (the descent stage).',
      scenePlacement: {
        anchor: 'site-origin-ladder-strut',
        note:
          'Part of the descent-stage model at the site origin; modelled on the forward ladder strut.',
      },
    },
    history: {
      deploymentDate: 'Attached to the LM before flight; unveiled on the surface on 21 July 1969',
      purpose:
        'Commemorative message from the people of Earth, carried on the descent stage of the first crewed lunar landing module (NSSDCA).',
      technicalDescription:
        'Per NASA JSC image metadata (S69-39334): a stainless-steel plaque measuring nine by seven and five-eighths inches, one-sixteenth inch thick, attached to the ladder on the landing-gear strut of the LM descent stage and covered by a thin protective stainless-steel sheet during flight, removed on the surface.',
      operationalHistory:
        'The crew unveiled the plaque mounted on the strut behind the ladder and read the inscription aloud at the start of the EVA (NSSDCA). Inscription: "Here men from the planet Earth first set foot on the Moon, July 1969 A.D. We came in peace for all mankind."',
      timeline: [
        {
          date: 'Pre-flight (1969)',
          title: 'Manufactured and installed',
          description:
            'Stainless steel, 9 × 7⅝ × 1/16 inches, fitted to the descent-stage ladder strut and covered by a protective sheet.',
          sourceIds: ['img-s69-39334'],
        },
        {
          date: '21 July 1969',
          title: 'Unveiled at the start of the EVA',
          description:
            'The astronauts unveiled the plaque behind the ladder and read the inscription aloud.',
          sourceIds: ['nssdca-lm-easep'],
        },
      ],
      disposition:
        'Remains attached to the descent stage at Tranquility Base, which itself remains at the landing site.',
    },
    narrative:
      'A piece of polished steel carrying a sentence written for every human being who would ever live: that visitors from Earth arrived in peace. It was read aloud once, on airless ground, to an audience of two and an antenna pointed homeward — and it has hung on the descent stage ever since, unchanged, addressed to a future that is still arriving. Of all the objects at Tranquility Base, it is the one whose primary function is not science or survival, but testimony.',
    status: {
      surfaceRemains: true,
      operational: 'inactive',
      observationsContinue: false,
      lastVerified:
        'Presence at the site follows from the documented fate of the descent stage (NSSDCA); no dedicated post-mission imaging of the plaque is cited in the sources consulted.',
    },
    media: [
      {
        id: 'photo-plaque-surface',
        kind: 'photograph',
        url: '/assets/artifacts/apollo-11/lunar-plaque/as11-40-5899-plaque-closeup.jpg',
        nasaId: 'AS11-40-5899',
        sourceUrl: IMAGES_API + 'as11-40-5899',
        alt: 'Close-up of the commemorative plaque attached to the ladder strut of the Apollo 11 Lunar Module descent stage, photographed on the lunar surface with its protective cover removed.',
        credit: 'NASA / Johnson Space Center',
      },
      {
        id: 'photo-plaque-replica',
        kind: 'photograph',
        url: '/assets/artifacts/apollo-11/diagrams/S69-39334-plaque-replica.jpg',
        nasaId: 'S69-39334',
        sourceUrl: IMAGES_API + 'S69-39334',
        alt: 'Pre-flight photograph of a replica of the Apollo 11 commemorative plaque, showing the inscription and signatures.',
        credit: 'NASA / Johnson Space Center',
      },
    ],
    sources: [
      {
        ...S_LM_EASEP,
        id: 'nssdca-lm-easep',
        supports: [
          'Plaque mounted on a strut behind the ladder; unveiled and read aloud at the start of the EVA',
          'Inscription text: "Here men from the planet Earth first set foot on the Moon, July 1969 A.D. We came in peace for all mankind."',
        ],
      },
      {
        ...S_IMG(
          'AS11-40-5899',
          'View of plaque Apollo 11 astronauts left on moon',
          'Johnson Space Center',
          'https://images.nasa.gov/details/as11-40-5899',
        ),
        id: 'img-as11-40-5899',
        supports: [
          'Plaque photographed on the surface, attached to the ladder strut of the descent stage',
        ],
      },
      {
        ...S_IMG(
          'S69-39334',
          'Replica of the plaque left on the Moon',
          'Johnson Space Center',
          'https://images.nasa.gov/details/S69-39334',
        ),
        id: 'img-s69-39334',
        supports: [
          'Plaque material and dimensions: stainless steel, 9 × 7⅝ × 1/16 inches; protective cover removed on the surface',
        ],
      },
    ],
  },

  /* ------------------------------------------------- SWC (recovered) */
  {
    id: 'solar-wind-composition',
    missionId: 'apollo-11',
    officialName: 'Solar Wind Composition Experiment (SWC)',
    displayName: 'Solar Wind Composition',
    category: 'experiment',
    designation: 'EASEP component',
    location: {
      body: 'moon',
      site: 'Tranquility Base, Mare Tranquillitatis (deployment site only)',
      coordinatePrecision: 'none',
      positionAccuracy: 'not-applicable',
      positionNote:
        'The SWC was deployed on the surface, then packed into the sample return container and brought back to Earth — no surface position applies. NSSDCA describes it qualitatively as standing "beyond the [LM\'s] right leg" in the pre-EVA configuration; no metre-level position is documented.',
      scenePlacement: {
        anchor: 'near-lm-reconstructed',
        note:
          'A future scene placement would represent the deployment location only, qualitatively documented as near the LM. Explicitly reconstructed, not documented to the metre.',
      },
    },
    history: {
      deploymentDate: '21 July 1969 (deployed during the EVA)',
      purpose:
        'Collected material from the solar wind for laboratory analysis of its composition; a component of the Early Apollo Scientific Experiments Package (EASEP) per NASA image metadata.',
      technicalDescription:
        'Deployed as a free-standing experiment near the LM (visible in NASA photographs beside the flag and beyond the LM\'s right leg). Detailed instrument specifications are not stated in the sources consulted for this record and are not asserted here.',
      operationalHistory:
        'Deployed during the EVA. The NSSDCA mission record states the astronauts packed the solar wind experiment — along with the lunar samples and core tubes — into the sample boxes, i.e. it was collected rather than left behind. JSC image metadata (S69-45002) confirms the first Apollo 11 sample return container "also contained the Solar Wind Composition experiment" when it was opened at the Lunar Receiving Laboratory, Building 37, Manned Spacecraft Center, at 3:55 p.m. CDT on 26 July 1969.',
      timeline: [
        {
          date: '21 July 1969',
          title: 'Deployed during EVA',
          description:
            'Aldrin deployed the SWC near the LM; photographed standing beside it with the LM in the background.',
          sourceIds: ['img-as11-40-5873', 'img-6901252'],
        },
        {
          date: '21 July 1969 (end of EVA)',
          title: 'Collected with the samples',
          description:
            'NSSDCA: the solar wind experiment was packed into the sample boxes along with the lunar samples and core tubes.',
          sourceIds: ['nssdca-lm-easep'],
        },
        {
          date: '26 July 1969, 3:55 p.m. CDT',
          title: 'Returned to Earth',
          description:
            'The first Apollo 11 sample return container — which also contained the SWC — was opened at the Lunar Receiving Laboratory, Building 37, MSC.',
          sourceIds: ['img-s69-45002'],
        },
      ],
      disposition:
        'RECOVERED. Returned to Earth inside the first Apollo 11 sample return container and opened at the Lunar Receiving Laboratory on 26 July 1969. It is explicitly NOT part of the permanent surface-artifact catalogue.',
    },
    narrative:
      'This is the registry\'s test of honesty: the one experiment that came home. It stood for a few hours in the sunlight next to the flag, gathered what the Sun continuously breathes into space, and then went back inside the spacecraft with the rocks — the only EASEP-class experiment of Apollo 11 documented as returned to Earth. It belongs in this archive not as an abandoned artifact, but as the boundary marker: proof that this catalogue distinguishes between what humanity left behind and what it brought home.',
    status: {
      surfaceRemains: false,
      operational: 'recovered',
      observationsContinue: false,
      lastVerified:
        'Recovery documented in the NSSDCA Apollo 11 LM/EASEP record and NASA JSC image metadata S69-45002.',
    },
    registryNote:
      'Included as documented RECOVERED equipment to demonstrate the distinction between returned hardware and permanently abandoned artifacts. Excluded from the permanent surface catalogue and from any site reconstruction.',
    media: [
      {
        id: 'photo-swc-deployed',
        kind: 'photograph',
        url: '/assets/artifacts/apollo-11/solar-wind-composition/as11-40-5873-swc-deployed.jpg',
        nasaId: 'AS11-40-5873',
        sourceUrl: IMAGES_API + 'as11-40-5873',
        alt: 'Astronaut Buzz Aldrin stands beside the deployed Solar Wind Composition experiment during the Apollo 11 EVA, with the Lunar Module in the right background.',
        credit: 'NASA / photographed by Neil A. Armstrong, 70 mm lunar surface camera',
      },
      {
        id: 'photo-swc-recovery',
        kind: 'photograph',
        url: '/assets/artifacts/apollo-11/solar-wind-composition/S69-45002-sample-box-with-swc.jpg',
        nasaId: 'S69-45002',
        sourceUrl: IMAGES_API + 'S69-45002',
        alt: 'Close-up of lunar rocks in the first Apollo 11 sample return container, opened at the Lunar Receiving Laboratory on 26 July 1969; the container also held the Solar Wind Composition experiment.',
        credit: 'NASA / Johnson Space Center',
      },
      {
        id: 'photo-swc-flag',
        kind: 'photograph',
        url: '/assets/artifacts/apollo-11/solar-wind-composition/6901252-swc-near-flag.jpg',
        nasaId: '6901252',
        sourceUrl: IMAGES_API + '6901252',
        alt: 'Armstrong removes scientific equipment from the LM storage bay; the U.S. flag is at left with the deployed Solar Wind Composition experiment beside it.',
        credit: 'NASA / Marshall Space Flight Center',
      },
    ],
    sources: [
      {
        ...S_LM_EASEP,
        id: 'nssdca-lm-easep',
        supports: [
          'The solar wind experiment was packed into the sample boxes with the lunar samples and core tubes (collected, not left behind)',
          'Qualitative relative position "beyond the [LM\'s] right leg" (NSSDCA image description for AS11-40-5927)',
        ],
      },
      {
        ...S_IMG(
          'S69-45002',
          'First Apollo 11 sample return container (also contained the SWC)',
          'Johnson Space Center',
          'https://images.nasa.gov/details/S69-45002',
        ),
        id: 'img-s69-45002',
        supports: [
          'The sample return container also contained the Solar Wind Composition experiment',
          'Container opened at the Lunar Receiving Laboratory, Building 37, MSC, 3:55 p.m. CDT, 26 July 1969',
        ],
      },
      {
        ...S_IMG(
          'AS11-40-5873',
          'Aldrin stands beside the deployed SWC experiment',
          'Johnson Space Center',
          'https://images.nasa.gov/details/as11-40-5873',
        ),
        id: 'img-as11-40-5873',
        supports: ['SWC deployed on the surface during the EVA'],
      },
      {
        ...S_IMG(
          '6901252',
          'SWC near the U.S. flag as Armstrong unloads the LM',
          'Marshall Space Flight Center',
          'https://images.nasa.gov/details/6901252',
        ),
        id: 'img-6901252',
        supports: ['SWC position near the U.S. flag, close to the LM'],
      },
    ],
  },
]
