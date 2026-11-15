import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

/** Fire map from a canvas gradient (no external texture asset). */
function createFireTexture() {
  const cv = document.createElement('canvas')
  cv.width = 256
  cv.height = 320
  const ctx = cv.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 0, 320)
  grad.addColorStop(0, 'rgba(255,216,90,0.95)')
  grad.addColorStop(0.28, 'rgba(255,150,40,0.85)')
  grad.addColorStop(0.58, 'rgba(255,60,20,0.6)')
  grad.addColorStop(0.85, 'rgba(190,25,8,0.35)')
  grad.addColorStop(1, 'rgba(70,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 320)
  const cg = ctx.createLinearGradient(0, 0, 0, 320)
  cg.addColorStop(0, 'rgba(0,0,0,0)')
  cg.addColorStop(0.5, 'rgba(255,215,130,0.55)')
  cg.addColorStop(1, 'rgba(255,180,100,0.12)')
  ctx.fillStyle = cg
  ctx.fillRect(100, 0, 56, 320)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = 'srgb'
  return tex
}

const FIRE = createFireTexture()
const SCALE = 9

/**
 * Real NASA Saturn V rocket for the launch sequence.
 *
 * The NASA 3D-Resources glTF is placed at identity transform (~12 m tall,
 * ~2 m wide). We scale it to launch-complex scale (~110 m tall, S-IC ≈ 10 m
 * diameter) and drive liftoff from scroll progress.
 */
export function LaunchRocket({
  progress,
}: {
  progress: number
}) {
  const groupRef = useRef<THREE.Group>(null)

  // Rocket glTF is the NASA 3D-Resources model at /models/nasa-saturn-v-rocket.glb.
  // useGLTF (drei) is the loader that fires the network request in this app.
  const gltf = useGLTF('/models/nasa-saturn-v-rocket.glb')
  const root = gltf?.scene

  const flameMat = new THREE.MeshBasicMaterial({
    map: FIRE,
    transparent: true,
    depthWrite: false,
  })

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    const p = Math.min(1, Math.max(0, progress))
    const launchStart = 0.018
    const launchEnd = 0.30
    const t = Math.min(1, Math.max(0, (p - launchStart) / (launchEnd - launchStart)))

    // Ascent: rise + yaw sway, anchored at the pad.
    group.position.set(0, t * 130, 0)
    group.rotation.z = t * 0.05

    // Flame flicker + thrust ramp.
    flameMat.opacity = 0.35 * (0.4 + 0.6 * Math.min(1, (t - 0.008) / 0.05))
    flameMat.needsUpdate = true
  })

  return (
    <group ref={groupRef}>
      {/* Scaled real NASA Saturn V; base anchored at the pad (y=0). */}
      <group position={[0, SCALE * 0.14, 0]} scale={SCALE}>
        <primitive object={root} />
      </group>

      {/* Exhaust column + engine glow, anchored at the pad. */}
      <group position={[0, -8, 0]}>
        <mesh material={flameMat}>
          <cylinderGeometry args={[11, 13.5, 16, 24, 1, true]} />
        </mesh>
        <pointLight color="#ff9a3c" distance={320} decay={1.6} intensity={0.06} />
      </group>
    </group>
  )
}
