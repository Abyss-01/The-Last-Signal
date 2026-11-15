/**
 * The seven featured objects (context.md §4 — exact scope, OBJ-01…OBJ-07).
 *
 * Rules observed here:
 *  - Every date, mass, distance and status claim traces to a NASA source
 *    listed on the record (`sources`), harvested from the team's verified
 *    Apollo 11 registry and the published mission pages.
 *  - Sub-metre offsets (LRRR, PSEP, Sojourner) are labelled `site-vicinity`
 *    and reference their parent lander — never an independent survey.
 *  - The 3D presentation of each object is an illustrative engineering
 *    reconstruction unless a NASA 3D Resources mesh is installed at
 *    `/assets/models/<id>.glb` (provenance says which).
 *  - `sceneAnchor` values are reconstruction coordinates for the 3D scene
 *    layout only — they are never geographic coordinates.
 */

import { NASA_SOURCES } from './sources'
import {
  APOLLO11_MISSION,
  APOLLO15_MISSION,
  MISSIONS,
  OPPORTUNITY_MISSION,
  PATHFINDER_MISSION,
  STILL_OPERATIONAL_STATUS,
} from './missions'
import type {
  AssetProvenance,
  FeaturedArtifact,
  StatusMeta,
} from './types'

export const RECONSTRUCTION_PROVENANCE: AssetProvenance = {
  kind: 'illustrative-reconstruction',
  label: 'Illustrative engineering reconstruction',
  note: 'Built for this experience from NASA photographs and documentation. Proportioned and simplified — not an engineering replica. NASA 3D Resources meshes are adopted automatically when placed at /assets/models/<id>.glb.',
}

const LEFT_ON_MOON: StatusMeta = {
  category: 'left-on-lunar-surface',
  label: 'Left on the lunar surface',
  scienceContinues: false,
  summary: 'Inert hardware, still at its landing site today.',
}

const LEFT_ON_MARS: StatusMeta = {
  category: 'left-on-martian-surface',
  label: 'Left on the Martian surface',
  scienceContinues: false,
  summary: 'Inactive hardware, still on Mars today.',
}

export const ARTIFACTS: FeaturedArtifact[] = [
  /* --------------------------------------------------------------- OBJ-01 */
  {
    id: 'eagle-descent-stage',
    catalog: 'OBJ-01',
    missionId: 'apollo-11',
    name: 'Lunar Module Eagle Descent Stage',
    designation: 'NSSDCA/COSPAR 1969-059C (LM/EASEP)',
    body: 'moon',
    status: {
      ...LEFT_ON_MOON,
      summary:
        'Still standing at Tranquility Base — the site datum. Launch platform; dry mass 2,033 kg.',
      scienceContinues: true,
    },
    coordinate: APOLLO11_MISSION.siteCoordinate,
    narrative: {
      story:
        'Half of the spacecraft that carried the first humans to another world never came home. When Armstrong and Aldrin lifted off from the Moon, the lower half of the Lunar Module Eagle stayed behind — the legs, the tanks, the engine, and the launch pad for their journey back. It is still there.',
      mission:
        'The descent stage was the bottom stage of the two-stage Lunar Module: it carried the crew from lunar orbit to the surface, served as their base of operations for the 21-hour, 36-minute stay, and staged the ascent stage’s liftoff on 21 July 1969.',
      engineering:
        'An octagonal framework 4.2 m across and about 1.7 m thick, standing about 1.5 m above the surface on four landing legs with round footpads set 9.4 m apart on opposite legs. Its deep-throttling descent engine — maximum thrust about 45,000 N — burned for 756.3 seconds during the landing. Dry mass: 2,033 kg.',
      fate:
        'Left behind at the landing point on 20 July 1969. The ascent stage departed into lunar orbit; its ultimate fate is unknown. The descent stage remains, and Lunar Reconnaissance Orbiter imagery has re-documented the site since 2009.',
      legacy:
        'The descent stage anchors every measurement made at Tranquility Base: other objects are documented relative to it. It is also the first human structure on another world — the opening exhibit of lunar archaeology.',
    },
    provenance: RECONSTRUCTION_PROVENANCE,
    components: [
      {
        id: 'descent-engine',
        label: 'Descent propulsion system',
        description:
          'Deep-throttling engine that performed the 756.3-second powered descent and touchdown.',
        explodeOffset: [0, -1.4, 0],
      },
      {
        id: 'body-structure',
        label: 'Octagonal body structure',
        description:
          '4.2 m octagonal framework carrying propellant tanks, equipment bays and the mounting ring for the ascent stage.',
        explodeOffset: [0, 1.1, 0],
      },
      {
        id: 'landing-gear',
        label: 'Landing gear',
        description:
          'Four legs with footpads 9.4 m apart on opposite legs, holding the stage ~1.5 m above the surface.',
        explodeOffset: [0, -0.7, 0.9],
      },
      {
        id: 'stowage-bays',
        label: 'Equipment stowage bays',
        description:
          'Carried EASEP and surface equipment; Aldrin unloaded the experiments from here during the EVA.',
        explodeOffset: [1.1, 0.4, 0],
      },
    ],
    sceneAnchor: [0, 0, -1200],
    localImage:
      '/assets/artifacts/apollo-11/eagle-descent-stage/as11-40-5927-eagle-at-tranquility-base.jpg',
    nasaImageId: 'AS11-40-5927',
    nasaImageSource: 'https://images.nasa.gov/details/as11-40-5927',
    imageCredit: 'NASA / 70 mm lunar surface camera',
    sources: [
      NASA_SOURCES.apollo11LmEasep,
      NASA_SOURCES.lroImagery,
    ],
  },

  /* --------------------------------------------------------------- OBJ-02 */
  {
    id: 'apollo-11-lrrr',
    catalog: 'OBJ-02',
    missionId: 'apollo-11',
    name: 'Lunar Laser Ranging Retroreflector',
    designation: 'NSSDCA Experiment 1969-059C-04 / S078',
    body: 'moon',
    status: {
      ...STILL_OPERATIONAL_STATUS,
      summary:
        'Left on the lunar surface · still actively ranged by Earth observatories today.',
    },
    coordinate: {
      ...APOLLO11_MISSION.siteCoordinate,
      precision: 'site-vicinity',
      dms: '0°40′26.69″N, 23°28′22.69″E (site-vicinity)',
      note: 'Deployed ~16.8 m SW of the Eagle. The coordinates shown reference the Apollo 11 landing-site datum — the array itself has no independent metre-precise survey in the sources consulted.',
    },
    narrative: {
      story:
        'Of everything the first Moon visitors left behind, this is the object that never stopped working. It is a mirror — nothing more — and for over five decades observatories on Earth have bounced lasers off it every clear night.',
      mission:
        'Deployed ~16.8 m southwest of the Eagle during the 21 July 1969 EVA, so that lasers fired from Earth could be reflected straight back, allowing precise measurement of the Earth–Moon distance.',
      engineering:
        'A passive optical array of 100 fused-silica corner-cube prisms — each cut so that incoming light returns along its arrival direction. No power, no moving parts, nothing to fail. A folding support structure aims the array toward Earth; NSSDCA lists its mass as 77 kg.',
      fate:
        'Still on the surface at Tranquility Base, still in use. As of JPL’s 2019 report, observatories in New Mexico, France, Italy and Germany continue lunar laser ranging to the Apollo arrays.',
      legacy:
        'Five decades of ranging show the Moon receding from Earth at 3.8 cm per year and support evidence of a fluid lunar core. Measured to a few millimetres, it is the longest-running experiment ever placed on another world.',
    },
    provenance: RECONSTRUCTION_PROVENANCE,
    components: [
      {
        id: 'reflector-array',
        label: 'Reflector array',
        description:
          '100 fused-silica corner cubes in a square panel. Each cube returns light to its source — passive optics only.',
        explodeOffset: [0, 0.5, 0],
      },
      {
        id: 'support-structure',
        label: 'Folding support structure',
        description:
          'Carried folded to the surface and unfolded to aim and align the array toward Earth.',
        explodeOffset: [0, -0.4, -0.4],
      },
      {
        id: 'ground-feet',
        label: 'Ground alignment feet',
        description:
          'Set the array on the regolith and hold its Earthward tilt steady.',
        explodeOffset: [0, -0.8, 0.5],
      },
    ],
    sceneAnchor: [-11.9, 0, -1211.9],
    localImage: '/assets/artifacts/apollo-11/retroreflector/6900957-easep-psep-lrrr-carry.jpg',
    nasaImageId: '6900957',
    nasaImageSource: 'https://images.nasa.gov/details/6900957',
    imageCredit: 'NASA / Marshall Space Flight Center',
    sources: [
      NASA_SOURCES.apollo11Lrrr,
      NASA_SOURCES.jplLunarLaserRanging,
      NASA_SOURCES.apollo11LmEasep,
    ],
  },

  /* --------------------------------------------------------------- OBJ-03 */
  {
    id: 'apollo-11-pse',
    catalog: 'OBJ-03',
    missionId: 'apollo-11',
    name: 'Apollo 11 Passive Seismic Experiment',
    designation: 'EASEP central station (with lunar dust detector)',
    body: 'moon',
    status: {
      ...LEFT_ON_MOON,
      summary:
        'Left on the lunar surface · operated 21 Earth days until 27 August 1969.',
    },
    coordinate: {
      ...APOLLO11_MISSION.siteCoordinate,
      precision: 'site-vicinity',
      dms: '0°40′26.69″N, 23°28′22.69″E (site-vicinity)',
      note: 'Deployed ~16.8 m SSW of the Eagle. The coordinates shown reference the Apollo 11 landing-site datum — NSSDCA documents the deployment at 0.6735° N, 23.4730° E as a feature-level fix, not metre-precise.',
    },
    narrative: {
      story:
        'The first listening post on another world. Humanity wanted to know whether the Moon shakes, so the very first science package placed on the lunar surface carried an ear for moonquakes.',
      mission:
        'Part of the Early Apollo Scientific Experiments Package (EASEP) — not the later ALSEP — the PSE was deployed ~16.8 m SSW of the Eagle to measure seismic activity and the physical properties of the lunar crust and interior.',
      engineering:
        'A 48-kg solar-powered station: a square base carrying the seismometer and a lunar dust detector, an isotope heater, a cylindrical antenna mast aimed at Earth, and two solar panels canted east and west. Solar power meant it could only operate during lunar day.',
      fate:
        'Activated from Earth at 04:40:39 UT on 21 July 1969. Transmission was stopped near lunar sunset on 3 August 1969; reactivated for a second lunar day, it fell permanently silent on 27 August 1969 when it no longer accepted commands — after 21 Earth days. The hardware was left in place.',
      legacy:
        'It recorded the Moon’s response to the LM’s departure, the small trembling of an airless world, and proved that planetary seismology works — lessons that shaped every seismometer flown since.',
    },
    provenance: RECONSTRUCTION_PROVENANCE,
    components: [
      {
        id: 'central-station',
        label: 'Central station body',
        description:
          'Square 48-kg base carrying the seismometer, dust detector and isotope heater.',
        explodeOffset: [0, 0.6, 0],
      },
      {
        id: 'antenna-mast',
        label: 'Antenna mast',
        description:
          'Cylindrical mast with positioning mechanism, aimed toward Earth for uplink and telemetry.',
        explodeOffset: [0, 1.0, 0],
      },
      {
        id: 'solar-panels',
        label: 'Solar panels',
        description:
          'Two panels canted east and west — the experiment was solar-powered and worked only in lunar daylight.',
        explodeOffset: [-0.9, 0.3, 0],
      },
      {
        id: 'seismometer-unit',
        label: 'Seismometer sensor unit',
        description:
          'The sensitive detector that registered moonquakes and surface motion.',
        explodeOffset: [0.9, 0.3, 0],
      },
    ],
    sceneAnchor: [-6.4, 0, -1184.5],
    localImage:
      '/assets/artifacts/apollo-11/passive-seismic-experiment/as11-40-5951-pse-deployment.jpg',
    nasaImageId: 'AS11-40-5951',
    nasaImageSource: 'https://images.nasa.gov/details/as11-40-5951',
    imageCredit: 'NASA / Johnson Space Center',
    sources: [
      NASA_SOURCES.apollo11LmEasep,
      NASA_SOURCES.apollo11LunarPage,
    ],
  },

  /* --------------------------------------------------------------- OBJ-04 */
  {
    id: 'apollo-15-lrv',
    catalog: 'OBJ-04',
    missionId: 'apollo-15',
    name: 'Lunar Roving Vehicle (LRV-1)',
    designation: 'LRV-1',
    body: 'moon',
    status: {
      ...LEFT_ON_MOON,
      summary:
        'Left on the lunar surface at Hadley–Apennine · parked 2 August 1971.',
    },
    coordinate: {
      ...APOLLO15_MISSION.siteCoordinate,
      precision: 'site-vicinity',
      dms: '26°07′55.99″N, 3°38′01.90″E (site-vicinity)',
      note: 'Parked ~90 m east of the Falcon LM on 2 August 1971. The coordinates shown reference the Apollo 15 landing-site datum — the rover’s exact parking spot has no independent survey in the sources consulted.',
    },
    narrative: {
      story:
        'The first car on the Moon. With it, Apollo 15 stopped being a mission of footsteps and became a mission of distance — astronauts who once walked a few hundred metres now roved the mountains.',
      mission:
        'Carried folded aboard the Lunar Module Falcon and deployed on the first EVA, 31 July 1971, to extend the crew’s reach across the Hadley–Apennine landing area.',
      engineering:
        'A battery-powered, four-wheeled electric vehicle designed for lunar gravity, steered through both front and rear wheels, folded for flight and unfolded by hand on the surface.',
      fate:
        'Used across three EVAs (31 July – 2 August 1971), helping the crew traverse roughly 27.9 km. At the end of the final EVA it was parked about 90 m east of the Falcon and left there when the crew departed.',
      legacy:
        'The LRV redefined what a landing mission could do: farther travels, heavier sample loads, better geology. Every rover concept that followed — on the Moon or Mars — inherited its equation of wheels, power and patience.',
    },
    provenance: RECONSTRUCTION_PROVENANCE,
    components: [
      {
        id: 'chassis',
        label: 'Chassis frame',
        description:
          'The folded-out lattice frame that carried crew, tools and sample bags.',
        explodeOffset: [0, 0.6, 0],
      },
      {
        id: 'wheels',
        label: 'Wire-mesh wheels',
        description:
          'Four flexible wheels designed for lunar soil, steered at front and rear.',
        explodeOffset: [0, -0.5, 0],
      },
      {
        id: 'seats-console',
        label: 'Seats and control console',
        description:
          'Open cockpit controls for two suited crew members navigating by its console display.',
        explodeOffset: [0.7, 0.3, 0],
      },
      {
        id: 'antenna-tv',
        label: 'Antenna and TV camera',
        description:
          'Kept Earth watching — the TV camera on the rover broadcast the lunar liftoff of the ascent stage.',
        explodeOffset: [-0.8, 0.4, 0],
      },
    ],
    sceneAnchor: [342, 0, -1400],
    localImage: undefined,
    sources: [NASA_SOURCES.apollo15LunarPage],
  },

  /* --------------------------------------------------------------- OBJ-05 */
  {
    id: 'mars-pathfinder-lander',
    catalog: 'OBJ-05',
    missionId: 'mars-pathfinder',
    name: 'Mars Pathfinder Lander — Carl Sagan Memorial Station',
    designation: 'Carl Sagan Memorial Station',
    body: 'mars',
    status: {
      ...LEFT_ON_MARS,
      summary:
        'Left on the Martian surface · operated 83 sols until final contact, 27 September 1997.',
    },
    coordinate: PATHFINDER_MISSION.siteCoordinate,
    narrative: {
      story:
        'The spacecraft that reopened Mars. After two decades without a successful landing, a tetrahedron wrapped in airbags bounced across the Martian surface on 4 July 1997 — then opened like a flower and became a base station.',
      mission:
        'Demonstrate a new, low-cost way to reach the Martian surface: parachute, rockets and airbags instead of precision retro-propulsion — and carry the first rover to Mars.',
      engineering:
        'A tetrahedral station that arrived wrapped in airbags, opened its three petals, exposed its solar panels, cameras and meteorology instruments, and unfolded ramps for the rover to descend.',
      fate:
        'Operated 83 sols — far beyond its planned 7-sol primary mission — until final contact on 27 September 1997. Repeated attempts to reestablish contact failed. It remains at Ares Vallis.',
      legacy:
        'Proved that airbag landings and small rovers could work on Mars, opening the era of surface rovers. Its imaging and atmospheric data also documented a landing site shaped by ancient floods.',
    },
    provenance: RECONSTRUCTION_PROVENANCE,
    components: [
      {
        id: 'station-base',
        label: 'Tetrahedral station base',
        description:
          'The central station body — opened on the surface and renamed the Carl Sagan Memorial Station.',
        explodeOffset: [0, 0.5, 0],
      },
      {
        id: 'solar-panels',
        label: 'Solar array petals',
        description:
          'Petal-mounted solar panels powering the station and its relay link to Earth.',
        explodeOffset: [0, 0.9, 0],
      },
      {
        id: 'rover-ramp',
        label: 'Rover deployment ramp',
        description:
          'Unfolded ramps down which Sojourner rolled onto the surface on 6 July 1997.',
        explodeOffset: [1.0, 0, 0.4],
      },
      {
        id: 'imager',
        label: 'Stereo imager on mast',
        description:
          'Panoramic camera for imaging the landing site and atmosphere.',
        explodeOffset: [-0.8, 0.6, 0],
      },
    ],
    sceneAnchor: [600, 0, -2000],
    localImage: undefined,
    sources: [NASA_SOURCES.marsPathfinder],
  },

  /* --------------------------------------------------------------- OBJ-06 */
  {
    id: 'sojourner-rover',
    catalog: 'OBJ-06',
    missionId: 'mars-pathfinder',
    name: 'Sojourner Rover',
    designation: 'Sojourner',
    body: 'mars',
    status: {
      ...LEFT_ON_MARS,
      summary:
        'Left on the Martian surface near the Pathfinder lander · silent since 27 September 1997.',
    },
    coordinate: {
      ...PATHFINDER_MISSION.siteCoordinate,
      precision: 'site-vicinity',
      dms: '19°07′48″N, 33°13′12″W (site-vicinity)',
      note: 'Rolled off the lander ramps on 6 July 1997 and operated within ~12 m of the Pathfinder lander. Coordinates reference the parent lander — the rover’s final position has no independent survey in the sources consulted.',
    },
    narrative: {
      story:
        'The size of a microwave oven and the first of its kind: the first rover ever to drive on another planet. For 83 sols, a ten-kilogram robot explored Mars on wheels.',
      mission:
        'Demonstrate rover mobility and technology on Mars, and give the Pathfinder mission a mobile science platform.',
      engineering:
        'A 10.6-kg, six-wheeled rocker-bogie rover, solar-powered, with cameras and an alpha proton X-ray spectrometer (APXS) for close-up chemical analysis of rocks and soil.',
      fate:
        'Rolled down Pathfinder’s ramps on 6 July 1997, traversed more than 100 m across 83 sols while operating within ~12 m of the lander, and fell silent when the lander’s final contact ended on 27 September 1997.',
      legacy:
        'Sojourner made mobile robotic exploration of Mars real. Its rocker-bogie suspension and small-rover philosophy descend directly into every Mars rover that followed — including Opportunity.',
    },
    provenance: RECONSTRUCTION_PROVENANCE,
    components: [
      {
        id: 'rover-body',
        label: 'Electronics body',
        description:
          'The 10.6-kg rover body housing computers, radios and batteries.',
        explodeOffset: [0, 0.4, 0],
      },
      {
        id: 'rocker-bogie',
        label: 'Rocker-bogie wheels',
        description:
          'Six wheels on a rocker-bogie suspension that kept the rover stable over rocks.',
        explodeOffset: [0, -0.35, 0],
      },
      {
        id: 'camera-mast',
        label: 'Front cameras',
        description:
          'Cameras for hazard avoidance and imaging the terrain ahead.',
        explodeOffset: [0.6, 0.2, 0],
      },
      {
        id: 'apxs',
        label: 'APXS spectrometer',
        description:
          'Alpha proton X-ray spectrometer for close-up analysis of Martian rocks and soil.',
        explodeOffset: [-0.6, 0.1, 0.2],
      },
    ],
    sceneAnchor: [608, 0, -2004],
    localImage: undefined,
    sources: [NASA_SOURCES.marsPathfinder],
  },

  /* --------------------------------------------------------------- OBJ-07 */
  {
    id: 'opportunity-rover',
    catalog: 'OBJ-07',
    missionId: 'mer-opportunity',
    name: 'Opportunity Rover (MER-B)',
    designation: 'MER-B',
    body: 'mars',
    status: {
      ...LEFT_ON_MARS,
      summary:
        'Left on the Martian surface · drove 45.16 km over 5,352 sols; mission concluded 13 February 2019.',
    },
    coordinate: OPPORTUNITY_MISSION.siteCoordinate,
    narrative: {
      story:
        'Built for 90 sols, it drove on for nearly fifteen years. Opportunity is the marathon rover — the machine that turned a short scout mission into one of planetary exploration’s greatest stories.',
      mission:
        'Search for and characterize rocks and soils holding clues to past water activity on Mars, and assess whether past environments could have supported life.',
      engineering:
        'A six-wheeled, solar-powered rover with panoramic and navigation cameras, spectrometers and a rock abrasion tool — a rolling geologist with a drill and a lab bench.',
      fate:
        'Landed 25 January 2004 for a 90-sol prime mission, then drove 45.16 km over 5,352 sols to Perseverance Valley on the rim of Endeavour Crater. A global dust storm blocked its sunlight; last contact came 10 June 2018. NASA concluded the mission on 13 February 2019.',
      legacy:
        'Opportunity found strong evidence that Mars was once wet, and its longevity rewrote expectations for robotic missions. It stopped where the water story it chased had carved the valley — a fitting resting place for a machine that followed the water.',
    },
    provenance: RECONSTRUCTION_PROVENANCE,
    components: [
      {
        id: 'rover-body',
        label: 'Rover body / electronics',
        description:
          'Warm electronics box housing the rover’s computers, batteries and instruments.',
        explodeOffset: [0, 0.5, 0],
      },
      {
        id: 'solar-wings',
        label: 'Solar panel wings',
        description:
          'Pancake solar wings — a global dust storm eventually starved them of light.',
        explodeOffset: [0, 0.9, 0],
      },
      {
        id: 'camera-mast',
        label: 'Camera mast head',
        description:
          'Panoramic and navigation cameras — the rover’s eyes on the plains.',
        explodeOffset: [0.8, 0.5, 0],
      },
      {
        id: 'robotic-arm',
        label: 'Robotic arm (IDD)',
        description:
          'Instrument deployment device carrying spectrometers and a rock abrasion tool.',
        explodeOffset: [-0.8, 0, 0.3],
      },
    ],
    sceneAnchor: [700, 0, -2100],
    localImage: undefined,
    sources: [NASA_SOURCES.opportunityRover],
  },
]

/** Quick lookup by id. */
export const ARTIFACT_BY_ID = new Map(ARTIFACTS.map((a) => [a.id, a]))

const MISSIONS_MAP = new Map(MISSIONS.map((m) => [m.id, m]))

export function getArtifact(id: string): FeaturedArtifact | undefined {
  return ARTIFACT_BY_ID.get(id)
}

export function getMission(missionId: string) {
  return MISSIONS_MAP.get(missionId)
}

