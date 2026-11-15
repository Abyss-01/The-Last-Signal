import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { LaunchRocket } from './RealSaturnV'

/**
 * Act 0–1 (progress 0 → 0.30): Pad 39A, the real Saturn V ascent with
 * S-IC / S-II separation, and the receding Earth during cislunar transit.
 *
 * The Saturn V is the NASA 3D-Resources glTF, scaled to launch-complex
 * scale and driven by scroll progress.
 */
const stackMat = {
  white: new THREE.MeshStandardMaterial({ color: '#e8e6e0', metalness: 0.15, roughness: 0.5 }),
  black: new THREE.MeshStandardMaterial({ color: '#1c1c1e', metalness: 0.2, roughness: 0.6 }),
  metal: new THREE.MeshStandardMaterial({ color: '#b9b6ae', metalness: 0.85, roughness: 0.3 }),
  concrete: new THREE.MeshStandardMaterial({ color: '#7b7a74', metalness: 0.05, roughness: 0.9 }),
  steel: new THREE.MeshStandardMaterial({ color: '#5d5f61', metalness: 0.6, roughness: 0.55 }),
  ground: new THREE.MeshStandardMaterial({ color: '#262b20', metalness: 0, roughness: 1 }),
}

export function EarthLaunchAct({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>,
}) {
  const zoneRef = useRef<THREE.Group>(null)
  const smokeRef = useRef<THREE.Mesh>(null)
  const earthRef = useRef<THREE.Group>(null)
  const craftRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const p = progressRef.current
    const zone = zoneRef.current
    if (!zone) return
    zone.visible = p < 0.31
    if (!zone.visible) return

    // Pad deluge / liftoff steam — fades in with launch
    const smoke = smokeRef.current
    if (smoke) {
      const sa = THREE.MathUtils.clamp(p / 0.18, 0, 1)
      smoke.visible = p < 0.2
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

    // Translunar (CSM/S-IVB) ahead on the corridor
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

      {/* Pad 39A + lightning masts */}
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

      {/* LaunchRocket: the real NASA Saturn V + exhaust plume. */}
      <LaunchRocket progress={progressRef.current} />

      {/* Receding Earth during transit */}
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

      {/* Translunar (CSM/S-IVB) ahead on the corridor */}
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
