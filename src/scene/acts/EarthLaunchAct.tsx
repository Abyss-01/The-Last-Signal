import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

import type { ReactNode } from 'react'

/**
 * Act 0–1 (progress 0 → 0.30): Launch Complex 39A, the Saturn V ascent
 * with S-IC / S-II separation, and the receding Earth during cislunar
 * transit. All motion derives from the shared scroll progress ref —
 * analytic, deterministic, no React state per frame.
 */

const stackMat = {
  white: new THREE.MeshStandardMaterial({ color: '#e8e6e0', metalness: 0.15, roughness: 0.5 }),
  black: new THREE.MeshStandardMaterial({ color: '#1c1c1e', metalness: 0.2, roughness: 0.6 }),
  metal: new THREE.MeshStandardMaterial({ color: '#b9b6ae', metalness: 0.85, roughness: 0.3 }),
  concrete: new THREE.MeshStandardMaterial({ color: '#7b7a74', metalness: 0.05, roughness: 0.9 }),
  steel: new THREE.MeshStandardMaterial({ color: '#5d5f61', metalness: 0.6, roughness: 0.55 }),
  ground: new THREE.MeshStandardMaterial({ color: '#262b20', metalness: 0, roughness: 1 }),
}

function stackY(a: number): number {
  const t = Math.max(0, a - 0.025) / 0.975
  return 560 * t * t
}

export function EarthLaunchAct({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>
}) {
  const zoneRef = useRef<THREE.Group>(null)
  const stackRef = useRef<THREE.Group>(null)
  const sIcRef = useRef<THREE.Group>(null)
  const sIIRef = useRef<THREE.Group>(null)
  const plumeRef = useRef<THREE.Group>(null)
  const upperPlumeRef = useRef<THREE.Group>(null)
  const plumeLightRef = useRef<THREE.PointLight>(null)
  const smokeRef = useRef<THREE.Mesh>(null)
  const earthRef = useRef<THREE.Group>(null)
  const craftRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const p = progressRef.current
    const zone = zoneRef.current
    if (!zone) return
    zone.visible = p < 0.31
    if (!zone.visible) return

    const a = THREE.MathUtils.clamp(p / 0.16, 0, 1)
    const stack = stackRef.current
    if (stack) {
      const tilt = Math.min(0.34, Math.max(0, a - 0.025) * 0.5)
      stack.position.set(0, stackY(a), 0)
      stack.rotation.x = -tilt
    }

    // S-IC plume (first-stage burn: a ≈ 0.025 → 0.30)
    const burning = a > 0.022 && a < 0.3
    if (plumeRef.current && plumeLightRef.current) {
      plumeRef.current.visible = burning
      plumeLightRef.current.visible = burning
      if (burning) {
        const flicker = 1 + Math.sin(clock.elapsedTime * 41) * 0.14
        const ramp = Math.min(1, (a - 0.022) * 9)
        plumeRef.current.scale.set(1, flicker * ramp, 1)
        plumeLightRef.current.intensity = 260 * flicker * ramp
      }
    }

    // S-II J-2 plume after S-IC separation
    if (upperPlumeRef.current) {
      upperPlumeRef.current.visible = a > 0.3 && a < 0.85
    }

    // S-IC separation (a ≈ 0.30) — tumbles back toward the ocean.
    const sIc = sIcRef.current
    if (sIc) {
      if (a > 0.3) {
        const da = a - 0.3
        sIc.visible = a < 0.75
        sIc.position.y = -700 * da * da
        sIc.position.z = -55 * da
        sIc.rotation.z = -0.45 * da
      } else {
        sIc.visible = true
        sIc.position.set(0, 0, 0)
        sIc.rotation.set(0, 0, 0)
      }
    }

    // S-II separation (a ≈ 0.62)
    const sII = sIIRef.current
    if (sII) {
      if (a > 0.62) {
        const da = a - 0.62
        sII.visible = a < 0.95
        sII.position.y = -820 * da * da
        sII.position.x = 45 * da
        sII.rotation.z = 0.3 * da
      } else {
        sII.visible = true
        sII.position.set(0, 0, 0)
        sII.rotation.set(0, 0, 0)
      }
    }

    // Pad deluge / liftoff steam
    const smoke = smokeRef.current
    if (smoke) {
      const sa = THREE.MathUtils.clamp(a / 0.18, 0, 1)
      smoke.visible = a < 0.2
      smoke.scale.setScalar(1 + sa * 12)
      ;(smoke.material as THREE.MeshBasicMaterial).opacity = 0.42 * (1 - sa)
    }

    // Receding Earth during transit
    const earth = earthRef.current
    if (earth) {
      earth.visible = p > 0.02 && p < 0.26
      const recede = THREE.MathUtils.smoothstep(p, 0.05, 0.26)
      earth.position.set(60 + recede * 80, 150 + recede * 60, -60 - recede * 120)
    }

    // Translunar craft ahead on the corridor
    const craft = craftRef.current
    if (craft) {
      craft.visible = p > 0.15 && p < 0.32
      const c = THREE.MathUtils.smoothstep(p, 0.15, 0.3)
      craft.position.set(0, 185 - c * 60, -260 - c * 420)
      craft.rotation.y = clock.elapsedTime * 0.15
    }
  })

  return (
    <group ref={zoneRef}>
      {/* Florida scrub */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={stackMat.ground}>
        <circleGeometry args={[720, 48]} />
      </mesh>

      {/* Pad 39A */}
      <mesh position={[0, 0.4, 0]} material={stackMat.concrete} receiveShadow castShadow>
        <boxGeometry args={[64, 0.8, 64]} />
      </mesh>
      <mesh position={[0, 0.2, 0]} material={stackMat.black}>
        <boxGeometry args={[26, 0.5, 26]} />
      </mesh>

      {/* Service tower */}
      <group position={[15, 0, 2]}>
        <mesh position={[0, 40, 0]} material={stackMat.steel} castShadow>
          <boxGeometry args={[6, 80, 8]} />
        </mesh>
        <mesh position={[-5, 38, 0]} material={stackMat.steel} castShadow>
          <boxGeometry args={[0.7, 76, 5]} />
        </mesh>
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[-2.6, 6 + i * 7.4, 0]} material={stackMat.steel}>
            <boxGeometry args={[5.4, 0.35, 0.35]} />
          </mesh>
        ))}
      </group>

      {/* Lightning masts */}
      {[
        [-58, -40],
        [58, -40],
        [0, 62],
      ].map(([mx, mz], i) => (
        <group key={i} position={[mx, 0, mz]}>
          <mesh position={[0, 34, 0]} material={stackMat.steel} castShadow>
            <cylinderGeometry args={[0.5, 1.1, 68, 6]} />
          </mesh>
        </group>
      ))}

      {/* Liftoff steam */}
      <mesh ref={smokeRef} position={[0, 2.5, 0]} visible={false}>
        <sphereGeometry args={[9, 20, 14]} />
        <meshBasicMaterial color="#cfd3d6" transparent opacity={0.4} depthWrite={false} />
      </mesh>

      {/* Saturn V stack */}
      <group ref={stackRef}>
        {/* S-IC — first stage (falls to the Atlantic) */}
        <group ref={sIcRef}>
          <mesh position={[0, 21, 0]} material={stackMat.white} castShadow>
            <cylinderGeometry args={[5, 5, 42, 28]} />
          </mesh>
          {[12, 24, 34].map((y) => (
            <mesh key={y} position={[0, y, 0]} material={stackMat.black}>
              <cylinderGeometry args={[5.04, 5.04, 2.6, 28]} />
            </mesh>
          ))}
          {[0, 1, 2, 3].map((i) => {
            const ang = (i * Math.PI) / 2 + Math.PI / 4
            return (
              <mesh
                key={i}
                position={[Math.cos(ang) * 4.7, 3.4, Math.sin(ang) * 4.7]}
                rotation={[0, -ang, 0.35]}
                material={stackMat.white}
                castShadow
              >
                <boxGeometry args={[0.4, 7, 2.6]} />
              </mesh>
            )
          })}
        </group>

        {/* Interstage */}
        <mesh position={[0, 43.5, 0]} material={stackMat.black}>
          <cylinderGeometry args={[5.02, 5.02, 3, 28]} />
        </mesh>

        {/* S-II — second stage (falls to the Atlantic) */}
        <group ref={sIIRef}>
          <mesh position={[0, 56, 0]} material={stackMat.white} castShadow>
            <cylinderGeometry args={[5, 5, 23, 28]} />
          </mesh>
        </group>

        {/* S-IVB — third stage (TLI; Apollo 11's enters solar orbit) */}
        <mesh position={[0, 68.6, 0]} material={stackMat.white} castShadow>
          <cylinderGeometry args={[3.3, 5, 3.2, 28]} />
        </mesh>
        <mesh position={[0, 79.5, 0]} material={stackMat.white} castShadow>
          <cylinderGeometry args={[3.3, 3.3, 15.4, 24]} />
        </mesh>

        {/* Instrument unit + CSM */}
        <mesh position={[0, 88.6, 0]} material={stackMat.white} castShadow>
          <cylinderGeometry args={[3.3, 3.3, 1.8, 24]} />
        </mesh>
        <mesh position={[0, 94.5, 0]} material={stackMat.metal} castShadow>
          <cylinderGeometry args={[2.6, 3.3, 9, 20]} />
        </mesh>
        <mesh position={[0, 100.2, 0]} material={stackMat.metal} castShadow>
          <coneGeometry args={[1.95, 3.2, 18]} />
        </mesh>

        {/* Launch escape system */}
        <mesh position={[0, 105.6, 0]} material={stackMat.metal}>
          <cylinderGeometry args={[0.22, 0.3, 6.4, 8]} />
        </mesh>
        <mesh position={[0, 109.4, 0]} material={stackMat.white}>
          <coneGeometry args={[0.55, 2.2, 10]} />
        </mesh>

        {/* First-stage plume */}
        <group ref={plumeRef} position={[0, 0, 0]} visible={false}>
          <mesh position={[0, -18, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[5.4, 36, 20, 1, true]} />
            <meshBasicMaterial color="#ff7a2a" transparent opacity={0.42} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -8.5, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[2.2, 17, 14, 1, true]} />
            <meshBasicMaterial color="#ffe9b0" transparent opacity={0.8} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <pointLight
            ref={plumeLightRef}
            position={[0, -6, 0]}
            color="#ff9a3c"
            distance={260}
            decay={1.6}
            visible={false}
          />
        </group>

        {/* Second-stage J-2 plume */}
        <group ref={upperPlumeRef} position={[0, 44, 0]} visible={false}>
          <mesh position={[0, -10, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[1.6, 20, 14, 1, true]} />
            <meshBasicMaterial color="#b8d4ff" transparent opacity={0.4} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* Earth, receding behind the camera during transit */}
      <group ref={earthRef} visible={false}>
        <mesh scale={62}>
          <sphereGeometry args={[1, 36, 26]} />
          <meshStandardMaterial
            color="#5b8ec4"
            emissive="#28527f"
            emissiveIntensity={0.9}
            roughness={0.95}
          />
        </mesh>
      </group>

      {/* Translunar stack ahead on the corridor */}
      <group ref={craftRef} visible={false}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.6, 1.6, 5, 16]} />
          <meshStandardMaterial color="#d8d6d0" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[3.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[1.2, 2.2, 14]} />
          <meshStandardMaterial color="#b9b6ae" metalness={0.8} roughness={0.35} />
        </mesh>
      </group>
    </group>
  )
}

/** Keeps the JSX type honest when children are optional. */
export type ActChild = ReactNode
