/**
 * The featured lunar objects (OBJ-01…OBJ-04 — lunar scope per project brief).
 *
 * Rules observed here:
 *  - Every date, mass, distance and status claim traces to a NASA source
 *    listed on the record (`sources`), harvested from verified Apollo records.
 *  - Sub-metre offsets (LRRR, PSEP) are labelled `site-vicinity`
 *    and reference their parent lander — never an independent survey.
 *  - The 3D presentation of each object is an illustrative engineering
 *    reconstruction or official NASA 3D asset.
 *  - `sceneAnchor` values are reconstruction coordinates for the 3D scene
 *    layout only — they are never geographic coordinates.
 */

import { NASA_SOURCES } from './sources'
import {
  APOLLO11_MISSION,
  APOLLO15_MISSION,
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
  note: 'Built for this experience from NASA photographs and documentation. Proportioned and simplified — not an engineering replica.',
}

export const NASA_3D_PROVENANCE: AssetProvenance = {
  kind: 'nasa-3d-resources',
  label: 'NASA 3D Resources / Verified Model',
  note: 'Official polygonal model from NASA public domain repositories.',
}

const LEFT_ON_MOON: StatusMeta = {
  category: 'left-on-lunar-surface',
  label: 'Left on the lunar surface',
  scienceContinues: false,
  summary: 'Inert hardware, still at its landing site today.',
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
    provenance: NASA_3D_PROVENANCE,
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
    id: 'laser-ranging-retroreflector',
    catalog: 'OBJ-02',
    missionId: 'apollo-11',
    name: 'Lunar Laser Ranging Retroreflector',
    designation: 'NSSDCA/COSPAR 1969-059C-04 · EASEP experiment S-078',
    body: 'moon',
    status: STILL_OPERATIONAL_STATUS,
    coordinate: {
      ...APOLLO11_MISSION.siteCoordinate,
      precision: 'site-vicinity',
      dms: '0°40′26.69″N, 23°28′22.69″E (site-vicinity)',
      note: 'Deployed roughly 15 m from the Lunar Module during the Apollo 11 EVA. Coordinates reference the site datum.',
    },
    narrative: {
      story:
        'A panel of a hundred small quartz prisms sitting in the dust of Tranquility Base. It carries no batteries, no wires, no transmitters, and no moving parts. More than fifty years after Neil Armstrong set it down, scientists on Earth still fire pulses of laser light at it — and watch the photons bounce back.',
      mission:
        'Measure the precise distance between the Earth and the Moon by timing how long laser pulses take to travel the round trip; investigate changes in the lunar orbit and test gravitational physics.',
      engineering:
        'An array of 100 high-purity fused-silica corner-cube prisms mounted in an open aluminium tray. Each prism has three mutually perpendicular reflective faces that return light along the exact path from which it arrived, regardless of angle.',
      fate:
        'Fully operational. Because it requires no electrical power, the retroreflector has outlived every active instrument sent with it. Lasers at McDonald Observatory, the Côte d’Azur, and elsewhere continue to range against it today.',
      legacy:
        'Laser ranging proved that the Moon is spiralling away from Earth at roughly 3.8 centimetres per year, showed that the Moon has a fluid core, and provided one of the strictest tests of Einstein’s general theory of relativity ever conducted.',
    },
    provenance: RECONSTRUCTION_PROVENANCE,
    components: [
      {
        id: 'prism-array',
        label: '100 corner-cube prisms',
        description:
          '100 high-purity fused silica prisms that reflect incident laser pulses back toward their origin on Earth.',
        explodeOffset: [0, 0.5, 0],
      },
      {
        id: 'tray',
        label: 'Aluminium mounting tray',
        description:
          'Open aluminium frame angled toward Earth, resting on the lunar surface on a small support mast.',
        explodeOffset: [0, -0.3, 0],
      },
    ],
    sceneAnchor: [18, 0, -1190],
    localImage:
      '/assets/artifacts/apollo-11/retroreflector/6900957-easep-psep-and-lrrr-carry.jpg',
    nasaImageId: '6900957',
    nasaImageSource: 'https://images.nasa.gov/details/6900957',
    imageCredit: 'NASA / Marshall Space Flight Center',
    sources: [
      NASA_SOURCES.apollo11Lrrr,
      NASA_SOURCES.jplLaserRanging,
    ],
  },

  /* --------------------------------------------------------------- OBJ-03 */
  {
    id: 'passive-seismic-experiment',
    catalog: 'OBJ-03',
    missionId: 'apollo-11',
    name: 'Apollo 11 Passive Seismic Experiment',
    designation: 'EASEP package · experiment S-031',
    body: 'moon',
    status: {
      ...LEFT_ON_MOON,
      summary:
        'Terminated 27 August 1969 · the station remains at Tranquility Base.',
    },
    coordinate: {
      ...APOLLO11_MISSION.siteCoordinate,
      precision: 'site-vicinity',
      dms: '0°40′26.69″N, 23°28′22.69″E (site-vicinity)',
      note: 'Deployed ~17 m south of the Lunar Module descent stage. Coordinates reference the site datum.',
    },
    narrative: {
      story:
        'Before Apollo 11, nobody knew whether the Moon was seismically alive or dead. Buzz Aldrin carried this small station away from the Eagle and unfolded its solar panels. For three weeks, it gave humanity its first ears inside the Moon’s interior.',
      mission:
        'Detect natural moonquakes, meteoroid impacts, and the seismic signature of the ascent stage liftoff, to begin probing the internal structure and crust of the Moon.',
      engineering:
        'A compact, self-contained station with three long-period seismometers and one short-period vertical seismometer, powered by two unfolding solar panels with radioisotope thermal heaters to survive the extreme cold of the lunar night.',
      fate:
        'Transmitted data for 21 days through the first lunar day. After surviving the first night, it stopped responding to ground commands on 27 August 1969 and was terminated.',
      legacy:
        'The Apollo 11 station proved that the Moon is seismically active — recording roughly two dozen moonquakes and meteoroid hits in its brief life — and paved the way for the multi-year ALSEP seismic network placed by later Apollo crews.',
    },
    provenance: RECONSTRUCTION_PROVENANCE,
    components: [
      {
        id: 'seismometer-core',
        label: 'Sensor assembly',
        description:
          'Four seismometers measuring horizontal and vertical motions of the lunar surface.',
        explodeOffset: [0, 0.7, 0],
      },
      {
        id: 'thermal-shroud',
        label: 'Thermal blanket & shroud',
        description:
          'Multi-layer insulation protecting the electronics from the 250 °C temperature swing between lunar day and night.',
        explodeOffset: [0, 0.3, 0],
      },
      {
        id: 'solar-wings',
        label: 'Deployable solar arrays',
        description:
          'Two solar wings unfolded by the astronaut to provide daytime electrical power.',
        explodeOffset: [0.8, 0, 0],
      },
    ],
    sceneAnchor: [-16, 0, -1185],
    localImage:
      '/assets/artifacts/apollo-11/passive-seismic-experiment/as11-40-5951-psep-deployment.jpg',
    nasaImageId: 'AS11-40-5951',
    nasaImageSource: 'https://images.nasa.gov/details/as11-40-5951',
    imageCredit: 'NASA / 70 mm lunar surface camera',
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
      note: 'Parked ~90 m east of the Falcon LM on 2 August 1971. The coordinates shown reference the Apollo 15 landing-site datum.',
    },
    narrative: {
      story:
        'The first car on the Moon. With it, Apollo 15 stopped being a mission of footsteps and became a mission of distance — astronauts who once walked a few hundred metres now roved the mountains and rilles.',
      mission:
        'Carried folded aboard the Lunar Module Falcon and deployed on the first EVA, 31 July 1971, to extend the crew’s reach across the Hadley–Apennine landing area.',
      engineering:
        'A battery-powered, four-wheeled electric vehicle designed for lunar gravity, steered through both front and rear wheels, folded for flight and unfolded by hand on the surface.',
      fate:
        'Used across three EVAs (31 July – 2 August 1971), helping the crew traverse roughly 27.9 km. At the end of the final EVA it was parked about 90 m east of the Falcon and left there when the crew departed.',
      legacy:
        'The LRV redefined what a landing mission could do: farther travels, heavier sample loads, better geology. Every rover concept that followed inherited its equation of wheels, power and patience.',
    },
    provenance: RECONSTRUCTION_PROVENANCE,
    components: [
      {
        id: 'chassis',
        label: 'Chassis frame',
        description:
          'The folded-out aluminium lattice frame that carried crew, tools and sample bags.',
        explodeOffset: [0, 0.6, 0],
      },
      {
        id: 'wheels',
        label: 'Wire-mesh wheels',
        description:
          'Four flexible woven wire-mesh wheels designed for soft lunar regolith, steered at front and rear.',
        explodeOffset: [0, -0.5, 0],
      },
      {
        id: 'seats-console',
        label: 'Seats and control console',
        description:
          'Open cockpit controls for two suited crew members navigating by its dead-reckoning console.',
        explodeOffset: [0.7, 0.3, 0],
      },
      {
        id: 'antenna-tv',
        label: 'High-gain antenna & colour TV camera',
        description:
          'Kept Earth watching — the TV camera on the rover broadcast the lunar liftoff of the ascent stage.',
        explodeOffset: [-0.8, 0.4, 0],
      },
    ],
    sceneAnchor: [342, 0, -1400],
    localImage: undefined,
    sources: [NASA_SOURCES.apollo15LunarPage],
  },
]

export function getArtifact(id: string): FeaturedArtifact | undefined {
  return ARTIFACTS.find((a) => a.id === id)
}

export function getArtifactsByMission(missionId: string): FeaturedArtifact[] {
  return ARTIFACTS.filter((a) => a.missionId === missionId)
}
