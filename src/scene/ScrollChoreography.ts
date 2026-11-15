/**
 * Scroll choreography — the unified lunar timeline acts, camera spline waypoints,
 * lighting states, and infinite loop parameters.
 *
 * Progress mapping (0.00 → 1.00):
 *   0.00–0.12  Newspaper Broadsheet & Pad 39A Zoom
 *   0.12–0.28  Saturn V Launch & Atmospheric Ascent
 *   0.28–0.44  Earth Orbit, S-IC/S-II Stage Separation & TLI
 *   0.44–0.58  Cislunar Transit & Lunar Crater Wormhole Warp Tunnel
 *   0.58–0.76  Apollo Lunar Module Eagle — Staged Mechanical Exploded View (from Test)
 *   0.76–0.90  Lunar Archaeology: Tranquility Base (LRRR, PSE) & Apollo 15 LRV
 *   0.90–1.00  Cosmic Earthrise Legacy & Return Loop to Morning of July 16, 1969
 */

import * as THREE from 'three'
import type { TimelineAct } from '@/data/types'

export const SCROLL_VH = 1100

export const ACTS: TimelineAct[] = [
  {
    id: 'broadsheet-pad',
    title: 'Earth — Pad 39A',
    year: '16 July 1969',
    range: [0, 0.12],
    caption:
      'A quiet morning at the Cape. A 363-foot Saturn V stands fueled on Pad 39A, ready to carry humanity to the Moon.',
  },
  {
    id: 'saturn-v-launch',
    title: 'Liftoff & Ascent',
    year: 'T-00:00 to T+02:42',
    range: [0.12, 0.28],
    caption:
      'Five F-1 engines generate 7.5 million pounds of thrust. Apollo 11 punches through the atmosphere into the Atlantic sky.',
  },
  {
    id: 'space-staging',
    title: 'Orbital Staging & TLI',
    year: '1969',
    range: [0.28, 0.44],
    caption:
      'In the silence of orbit, discarded rocket stages fall away toward the ocean. The S-IVB ignites for Translunar Injection.',
  },
  {
    id: 'cislunar-wormhole',
    title: 'The Lunar Descent',
    year: '20 July 1969',
    range: [0.44, 0.58],
    caption:
      'Three days across the void. The camera plunges into the lunar horizon through a relativistic warp tunnel toward the Sea of Tranquility.',
  },
  {
    id: 'lunar-module-breakdown',
    title: 'Eagle: Mechanical Breakdown',
    year: 'Tranquility Base',
    range: [0.58, 0.76],
    caption:
      'The Apollo Lunar Module in stark lunar sunlight — its 7 staged assemblies separate along mechanical axes to reveal the vehicle that landed on another world.',
  },
  {
    id: 'lunar-archaeology',
    title: 'Artifacts on the Moon',
    year: '1969 & 1971',
    range: [0.76, 0.90],
    caption:
      'The Laser Retroreflector still returning beams today; the first seismic ear; and Apollo 15’s parked rover — permanent archaeology on the Moon.',
  },
  {
    id: 'earthrise-loop',
    title: 'Earthrise & Cosmic Legacy',
    year: '1969 → Today',
    range: [0.90, 1.0],
    caption:
      '“Every mission leaves something behind. But not everything left behind is forgotten.” The continuous journey returns to Earth.',
  },
]

export function getAct(progress: number): TimelineAct {
  const act = ACTS.find((a) => progress >= a.range[0] && progress < a.range[1])
  return act ?? ACTS[ACTS.length - 1]
}

/* ------------------------------------------------------------------ */
/* Smooth Continuous Camera Spline Waypoints                          */
/* ------------------------------------------------------------------ */

interface CameraKey {
  p: number
  pos: [number, number, number]
  look: [number, number, number]
}

// Continuous, smooth trajectory with NO sudden 180° camera flips or coordinate snapping
const CAMERA_KEYS: CameraKey[] = [
  // Act 1: Pad 39A (matches newspaper photo framing)
  { p: 0.00, pos: [0, 14, 62], look: [0, 24, 0] },
  { p: 0.08, pos: [0, 18, 52], look: [0, 36, 0] },

  // Act 2: Liftoff & Atmospheric Ascent
  { p: 0.14, pos: [10, 18, 46], look: [0, 34, 0] },
  { p: 0.20, pos: [16, 58, 42], look: [0, 72, 0] },
  { p: 0.26, pos: [22, 130, 48], look: [0, 150, 0] },

  // Act 3: Space staging & Earth Curvature (smoothly pitching toward Moon in -Z)
  { p: 0.32, pos: [32, 240, 52], look: [0, 270, 0] },
  { p: 0.38, pos: [38, 380, 40], look: [0, 420, -60] },
  { p: 0.44, pos: [24, 460, -80], look: [0, 400, -320] },

  // Act 4: Approach Moon & Wormhole plunge (smooth linear progression down -Z toward Moon at -1200)
  { p: 0.48, pos: [0, 90, -420], look: [0, 20, -750] },
  { p: 0.52, pos: [0, 32, -720], look: [0, 12, -980] },
  { p: 0.56, pos: [0, 10, -1120], look: [0, 2.5, -1200] },

  // Act 5: Apollo Lunar Module Eagle breakdown inspection (Framed at [0, 0, -1200])
  // Test viewport baseline camera: pos [7.4, 3.4, 7.8], target [0, 1.8, 0] -> in world: pos [7.4, 3.4, -1192.2], look [0, 1.8, -1200]
  { p: 0.58, pos: [7.4, 3.4, -1192.2], look: [0, 1.8, -1200] },
  { p: 0.63, pos: [8.8, 4.2, -1190.8], look: [0, 2.4, -1200] },
  { p: 0.69, pos: [7.8, 5.2, -1189.5], look: [0, 2.8, -1200] },
  { p: 0.75, pos: [6.8, 3.2, -1192.4], look: [0, 1.8, -1200] },

  // Act 6: Lunar surface archaeology (Retroreflector & Rover)
  { p: 0.78, pos: [14, 2.2, -1184], look: [18, 0.5, -1190] },
  { p: 0.84, pos: [240, 6.5, -1350], look: [342, 1.2, -1400] },
  { p: 0.88, pos: [330, 3.6, -1390], look: [342, 1.2, -1400] },

  // Act 7: High orbit Earthrise & Return Loop
  { p: 0.92, pos: [120, 120, -1280], look: [0, 480, -450] },
  { p: 0.96, pos: [0, 320, -840], look: [0, 480, -450] },
  { p: 0.99, pos: [0, 45, 120], look: [0, 26, 0] },
  { p: 1.00, pos: [0, 14, 62], look: [0, 24, 0] },
]

export function cameraPose(progress: number): {
  position: THREE.Vector3
  lookAt: THREE.Vector3
} {
  const p = Math.min(1, Math.max(0, progress))
  let idx = 0
  for (let i = 0; i < CAMERA_KEYS.length - 1; i++) {
    if (p >= CAMERA_KEYS[i].p && p <= CAMERA_KEYS[i + 1].p) {
      idx = i
      break
    }
  }

  const k1 = CAMERA_KEYS[idx]
  const k2 = CAMERA_KEYS[Math.min(idx + 1, CAMERA_KEYS.length - 1)]
  const span = Math.max(0.0001, k2.p - k1.p)
  const rawT = (p - k1.p) / span

  // Smooth Hermite C1 continuous easing
  const t = rawT * rawT * (3 - 2 * rawT)

  const position = new THREE.Vector3(
    THREE.MathUtils.lerp(k1.pos[0], k2.pos[0], t),
    THREE.MathUtils.lerp(k1.pos[1], k2.pos[1], t),
    THREE.MathUtils.lerp(k1.pos[2], k2.pos[2], t)
  )

  const lookAt = new THREE.Vector3(
    THREE.MathUtils.lerp(k1.look[0], k2.look[0], t),
    THREE.MathUtils.lerp(k1.look[1], k2.look[1], t),
    THREE.MathUtils.lerp(k1.look[2], k2.look[2], t)
  )

  return { position, lookAt }
}

/* ------------------------------------------------------------------ */
/* Sky, Fog & Lighting State — Butter-smooth, NO abrupt flashes        */
/* ------------------------------------------------------------------ */

export interface SkyState {
  fogColor: THREE.Color
  fogDensity: number
  sunIntensity: number
  sunColor: THREE.Color
  ambientColor: THREE.Color
}

export function skyState(progress: number): SkyState {
  const p = Math.min(1, Math.max(0, progress))
  const state: SkyState = {
    fogColor: new THREE.Color('#030407'),
    fogDensity: 0.00025,
    sunIntensity: 2.8,
    sunColor: new THREE.Color('#fffdf6'),
    ambientColor: new THREE.Color('#141822'),
  }

  if (p < 0.16) {
    // Pad 39A morning coastal sky
    state.fogColor.set('#a0b8cc')
    state.fogDensity = 0.0007
    state.sunIntensity = 2.4
    state.sunColor.set('#fff4db')
    state.ambientColor.set('#5a7088')
  } else if (p < 0.28) {
    // Liftoff & smooth atmospheric climb — gentle warm haze that blends into space
    const t = (p - 0.16) / 0.12
    state.fogColor.lerpColors(new THREE.Color('#a0b8cc'), new THREE.Color('#030407'), t)
    state.fogDensity = THREE.MathUtils.lerp(0.0007, 0.00015, t)
    state.sunIntensity = THREE.MathUtils.lerp(2.4, 3.2, t)
    state.ambientColor.lerpColors(new THREE.Color('#5a7088'), new THREE.Color('#0a0d14'), t)
  } else if (p < 0.44) {
    // Deep space orbital void
    state.fogColor.set('#020204')
    state.fogDensity = 0.0001
    state.sunIntensity = 3.0
    state.sunColor.set('#ffffff')
    state.ambientColor.set('#0b0e14')
  } else if (p < 0.58) {
    // Wormhole warp approach — subtle cyan tint
    const t = Math.sin(((p - 0.44) / 0.14) * Math.PI)
    state.fogColor.lerpColors(new THREE.Color('#020204'), new THREE.Color('#04101d'), t)
    state.fogDensity = THREE.MathUtils.lerp(0.0001, 0.00035, t)
    state.sunIntensity = 2.4
    state.ambientColor.lerpColors(new THREE.Color('#0b0e14'), new THREE.Color('#122234'), t)
  } else if (p < 0.90) {
    // Lunar surface: crisp obsidian black sky, stark bright sunlight
    state.fogColor.set('#030305')
    state.fogDensity = 0.00018
    state.sunIntensity = 3.2
    state.sunColor.set('#fffdf8')
    state.ambientColor.set('#10131a')
  } else {
    // Earthrise loop transition — returns smoothly to morning coastal sky
    const t = (p - 0.90) / 0.10
    state.fogColor.lerpColors(new THREE.Color('#030305'), new THREE.Color('#a0b8cc'), t)
    state.fogDensity = THREE.MathUtils.lerp(0.00018, 0.0007, t)
    state.sunIntensity = THREE.MathUtils.lerp(3.2, 2.4, t)
    state.ambientColor.lerpColors(new THREE.Color('#10131a'), new THREE.Color('#5a7088'), t)
  }

  return state
}
