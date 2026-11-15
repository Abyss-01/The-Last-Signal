/**
 * Adaptive quality tiers — keeps the journey at ~60fps on ordinary laptops.
 *
 * DPR clamp, shadow-map resolution and geometry detail are chosen once from
 * hardware/screen hints; nothing here touches React state per frame.
 */

export interface QualityProfile {
  dpr: [number, number]
  shadowMapSize: number
  terrainSegments: number
  starCount: number
  antialias: boolean
}

export function resolveQualityTier(): QualityProfile {
  if (typeof window === 'undefined') {
    return {
      dpr: [1, 1.5],
      shadowMapSize: 1024,
      terrainSegments: 96,
      starCount: 1200,
      antialias: true,
    }
  }

  const cores = navigator.hardwareConcurrency ?? 4
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 700
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (smallScreen || cores <= 4 || reducedMotion) {
    return {
      dpr: [1, 1.25],
      shadowMapSize: 1024,
      terrainSegments: 80,
      starCount: 800,
      antialias: false,
    }
  }

  if (cores <= 8) {
    return {
      dpr: [1, 1.5],
      shadowMapSize: 1536,
      terrainSegments: 112,
      starCount: 1400,
      antialias: true,
    }
  }

  return {
    dpr: [1, 1.75],
    shadowMapSize: 2048,
    terrainSegments: 144,
    starCount: 2000,
    antialias: true,
  }
}

export const QUALITY = resolveQualityTier()

/** True when the current context can render the three.js <Canvas>. */
export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return true
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
  return !!gl
}

/** A reduced profile to run while no WebGL surface exists. */
export const FALLBACK_PROFILE: QualityProfile = {
  dpr: [1, 1],
  shadowMapSize: 512,
  terrainSegments: 32,
  starCount: 120,
  antialias: false,
}
