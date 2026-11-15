/**
 * Scroll choreography — the six timeline acts and the camera's route.
 *
 * Normalized progress (0 → 1) from the scroll container drives:
 *   0.00–0.16  Earth Launchpad & Saturn V ascent (S-IC/S-II separation)
 *   0.16–0.30  Cislunar transit
 *   0.30–0.52  Moon Act I — Apollo 11, Tranquility Base (OBJ-01…03)
 *   0.52–0.66  Moon Act II — Apollo 15, Hadley–Apennine (OBJ-04)
 *   0.66–0.78  Interplanetary time-skip 1971 → 1997
 *   0.78–1.00  Mars — Pathfinder/Sojourner (OBJ-05/06), Opportunity (OBJ-07)
 *
 * The camera follows a CatmullRomCurve3 position spline with a matching
 * look-at spline. Sky, fog and lighting states are evaluated per frame
 * from the same progress value.
 */

import * as THREE from 'three'
import type { TimelineAct } from '@/data/types'

/* ------------------------------------------------------------------ */
/* Acts                                                                */
/* ------------------------------------------------------------------ */

export const ACTS: TimelineAct[] = [
  {
    id: 'earth-launch',
    title: 'Earth — Pad 39A',
    year: '1969',
    range: [0, 0.16],
    caption:
      '16 July 1969 — a Saturn V lifts Apollo 11 from Kennedy Space Center. Its discarded stages fall away toward the ocean; none of them reach the Moon.',
  },
  {
    id: 'cislunar',
    title: 'Cislunar Transit',
    year: '1969',
    range: [0.16, 0.3],
    caption:
      'Three days across the void between Earth and Moon — with only the translunar stage pushing.',
  },
  {
    id: 'moon-apollo-11',
    title: 'Tranquility Base',
    year: '1969',
    range: [0.3, 0.52],
    caption:
      'The Eagle’s descent stage remains at the landing point. Around it: the laser reflector and the first listening post — left on purpose, working on purpose.',
  },
  {
    id: 'moon-apollo-15',
    title: 'Hadley–Apennine',
    year: '1971',
    range: [0.52, 0.66],
    caption:
      'Two years on, exploration had wheels. Apollo 15’s Lunar Roving Vehicle carried the crew ~27.9 km across three EVAs — then was parked, still, on the Moon.',
  },
  {
    id: 'time-skip',
    title: 'A New Era of Machines',
    year: '1971 → 1997',
    range: [0.66, 0.78],
    caption:
      'Twenty-six years pass. A different spacecraft, a different mission, a different planet — Apollo never went to Mars; robotic explorers did.',
  },
  {
    id: 'mars',
    title: 'Ares Vallis → Meridiani Planum',
    year: '1997 → 2019',
    range: [0.78, 1.0],
    caption:
      'Pathfinder opened Mars to rovers in 1997. Opportunity followed the water for 45.16 km and nearly fifteen years — and the machines we left behind still tell their story.',
  },
]

export function getAct(progress: number): TimelineAct {
  const act = ACTS.find((a) => progress >= a.range[0] && progress < a.range[1])
  return act ?? ACTS[ACTS.length - 1]
}

/* ------------------------------------------------------------------ */
/* Camera splines                                                      */
/* ------------------------------------------------------------------ */

interface CameraKey {
  /** Progress checkpoint. */
  p: number
  /** Camera position. */
  pos: [number, number, number]
  /** Look-at target. */
  look: [number, number, number]
}

/**
 * Waypoints (world metres). Zones: Earth pad at origin; Apollo 11 site at
 * (0,0,-1200); Apollo 15 site at (342,0,-1400); Pathfinder at (600,0,-2000);
 * Opportunity at (700,0,-2100).
 */
const CAMERA_KEYS: CameraKey[] = [
  // Act 0 — launch
  { p: 0.0, pos: [0, 5, 62], look: [0, 14, 0] },
  { p: 0.05, pos: [18, 24, 58], look: [0, 42, 0] },
  { p: 0.1, pos: [26, 90, 46], look: [0, 140, -20] },
  { p: 0.16, pos: [18, 190, 10], look: [0, 300, -140] },
  // Act 1 — cislunar
  { p: 0.2, pos: [0, 170, -160], look: [0, 120, -420] },
  { p: 0.24, pos: [0, 130, -420], look: [0, 80, -900] },
  { p: 0.3, pos: [0, 70, -800], look: [0, 30, -1180] },
  // Act 2 — Apollo 11
  { p: 0.34, pos: [0, 26, -1080], look: [0, 6, -1200] },
  { p: 0.38, pos: [16, 7, -1168], look: [0, 2.5, -1200] },
  { p: 0.42, pos: [-14, 3.2, -1216], look: [-11.9, 0.8, -1211.9] }, // LRRR framing
  { p: 0.46, pos: [-6.4, 2.8, -1196], look: [-6.4, 0.8, -1184.5] }, // PSE framing
  { p: 0.52, pos: [12, 3.5, -1186], look: [0, 2.5, -1200] }, // Eagle framing
  // Act 3 — Apollo 15
  { p: 0.56, pos: [120, 40, -1300], look: [260, 2, -1400] },
  { p: 0.6, pos: [250, 14, -1372], look: [330, 1.6, -1400] },
  { p: 0.63, pos: [330, 3.2, -1378], look: [342, 1.6, -1400] }, // LRV framing
  { p: 0.66, pos: [348, 2.4, -1382], look: [342, 1.4, -1400] },
  // Act 4 — time-skip
  { p: 0.7, pos: [360, 60, -1480], look: [420, 60, -1700] },
  { p: 0.74, pos: [430, 130, -1720], look: [560, 60, -1950] },
  { p: 0.78, pos: [490, 90, -1860], look: [600, 20, -1990] },
  // Act 5 — Mars
  { p: 0.82, pos: [566, 14, -1946], look: [600, 1.6, -2000] }, // approach
  { p: 0.85, pos: [610, 3.2, -1990], look: [608, 0.8, -2004] }, // Sojourner close
  { p: 0.88, pos: [596, 2.8, -1984], look: [600, 1.4, -2000] },
  { p: 0.92, pos: [668, 22, -2040], look: [700, 1.6, -2100] }, // Opportunity wide
  { p: 0.96, pos: [692, 3, -2086], look: [700, 1.2, -2100] }, // Opportunity close
  { p: 1.0, pos: [656, 26, -2046], look: [680, 4, -2070] }, // legacy pull-back
]

const POSITION_POINTS = CAMERA_KEYS.map((k) => new THREE.Vector3(...k.pos))
const LOOK_POINTS = CAMERA_KEYS.map((k) => new THREE.Vector3(...k.look))

export const cameraCurve = new THREE.CatmullRomCurve3(
  POSITION_POINTS,
  false,
  'catmullrom',
  0.35,
)
export const lookCurve = new THREE.CatmullRomCurve3(
  LOOK_POINTS,
  false,
  'catmullrom',
  0.35,
)

/** Map normalized progress to curve parameter (keys are non-uniform). */
export function curveParameter(progress: number): number {
  for (let i = 0; i < CAMERA_KEYS.length - 1; i++) {
    const a = CAMERA_KEYS[i]
    const b = CAMERA_KEYS[i + 1]
    if (progress >= a.p && progress <= b.p) {
      const t = (progress - a.p) / (b.p - a.p)
      return (i + t) / (CAMERA_KEYS.length - 1)
    }
  }
  return progress
}

/* ------------------------------------------------------------------ */
/* Atmosphere / lighting states per progress                           */
/* ------------------------------------------------------------------ */

interface SkyState {
  fogColor: THREE.Color
  fogDensity: number
  lightColor: THREE.Color
  lightIntensity: number
  ambientIntensity: number
  starOpacity: number
}

interface SkyKey {
  p: number
  sky: SkyState
}

const LERP_KEYS: SkyKey[] = [
  {
    p: 0.0,
    sky: {
      fogColor: new THREE.Color('#5f87b8'),
      fogDensity: 0.0026,
      lightColor: new THREE.Color('#fff2dd'),
      lightIntensity: 2.4,
      ambientIntensity: 0.55,
      starOpacity: 0,
    },
  },
  {
    p: 0.1,
    sky: {
      fogColor: new THREE.Color('#12203a'),
      fogDensity: 0.0016,
      lightColor: new THREE.Color('#fff2dd'),
      lightIntensity: 2.6,
      ambientIntensity: 0.22,
      starOpacity: 0.5,
    },
  },
  {
    p: 0.24,
    sky: {
      fogColor: new THREE.Color('#050507'),
      fogDensity: 0,
      lightColor: new THREE.Color('#fff6e6'),
      lightIntensity: 2.8,
      ambientIntensity: 0.1,
      starOpacity: 1,
    },
  },
  {
    p: 0.36,
    sky: {
      fogColor: new THREE.Color('#0a0a0e'),
      fogDensity: 0.0004,
      lightColor: new THREE.Color('#fff4e0'),
      lightIntensity: 3.0,
      ambientIntensity: 0.12,
      starOpacity: 1,
    },
  },
  {
    p: 0.62,
    sky: {
      fogColor: new THREE.Color('#0a0a0e'),
      fogDensity: 0.0004,
      lightColor: new THREE.Color('#fff4e0'),
      lightIntensity: 3.0,
      ambientIntensity: 0.12,
      starOpacity: 1,
    },
  },
  {
    p: 0.74,
    sky: {
      fogColor: new THREE.Color('#3d1d10'),
      fogDensity: 0.0009,
      lightColor: new THREE.Color('#ffd9b0'),
      lightIntensity: 2.4,
      ambientIntensity: 0.2,
      starOpacity: 0.7,
    },
  },
  {
    p: 0.82,
    sky: {
      fogColor: new THREE.Color('#8a4a2c'),
      fogDensity: 0.0032,
      lightColor: new THREE.Color('#ffd9b0'),
      lightIntensity: 2.2,
      ambientIntensity: 0.4,
      starOpacity: 0.25,
    },
  },
  {
    p: 1.0,
    sky: {
      fogColor: new THREE.Color('#9c5a38'),
      fogDensity: 0.0038,
      lightColor: new THREE.Color('#ffd9b0'),
      lightIntensity: 2.1,
      ambientIntensity: 0.42,
      starOpacity: 0.2,
    },
  },
]

/** Interpolated sky/lighting state for a normalized progress value. */
export function skyState(progress: number): SkyState {
  const keys = LERP_KEYS
  let i = 0
  while (i < keys.length - 2 && progress > keys[i + 1].p) i++
  const a = keys[i]
  const b = keys[i + 1]
  const t = THREE.MathUtils.clamp(
    (progress - a.p) / Math.max(1e-6, b.p - a.p),
    0,
    1,
  )
  const eased = t * t * (3 - 2 * t)
  return {
    fogColor: a.sky.fogColor.clone().lerp(b.sky.fogColor, eased),
    fogDensity: THREE.MathUtils.lerp(a.sky.fogDensity, b.sky.fogDensity, eased),
    lightColor: a.sky.lightColor.clone().lerp(b.sky.lightColor, eased),
    lightIntensity: THREE.MathUtils.lerp(
      a.sky.lightIntensity,
      b.sky.lightIntensity,
      eased,
    ),
    ambientIntensity: THREE.MathUtils.lerp(
      a.sky.ambientIntensity,
      b.sky.ambientIntensity,
      eased,
    ),
    starOpacity: THREE.MathUtils.lerp(
      a.sky.starOpacity,
      b.sky.starOpacity,
      eased,
    ),
  }
}

/* ------------------------------------------------------------------ */
/* Scroll container helpers                                            */
/* ------------------------------------------------------------------ */

/** Total scroll height for the journey (vh units). */
export const SCROLL_VH = 900

export function progressFromScroll(scrollTop: number, scrollHeight: number): number {
  const max = Math.max(1, scrollHeight - window.innerHeight)
  return THREE.MathUtils.clamp(scrollTop / max, 0, 1)
}
