import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

/**
 * WormholeTransition — Cinematic warp tunnel / crater plunge.
 * Activated as the spacecraft reaches the Moon (p: 0.46 → 0.58).
 * Renders relativistic star streaks, glowing hyperspace rings, and a
 * vortex pulling directly into the lunar coordinate to reveal the
 * Apollo Lunar Module.
 */

interface WormholeProps {
  progressRef: React.MutableRefObject<number>
  range?: [number, number]
}

export function WormholeTransition({
  progressRef,
  range = [0.44, 0.58],
}: WormholeProps) {
  const [start, end] = range
  const groupRef = useRef<THREE.Group>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const ringsGroupRef = useRef<THREE.Group>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  const LINE_COUNT = 380

  const { lineGeo, lineMat } = useMemo(() => {
    const positions = new Float32Array(LINE_COUNT * 2 * 3)
    const colors = new Float32Array(LINE_COUNT * 2 * 3)
    const colorA = new THREE.Color('#4ac9ff')
    const colorB = new THREE.Color('#e8c86a')

    for (let i = 0; i < LINE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 6 + Math.random() * 55
      const z1 = -Math.random() * 600
      const length = 40 + Math.random() * 120
      const z2 = z1 - length

      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      const idx = i * 6
      positions[idx] = x
      positions[idx + 1] = y
      positions[idx + 2] = z1

      positions[idx + 3] = x * 1.08
      positions[idx + 4] = y * 1.08
      positions[idx + 5] = z2

      const c = Math.random() > 0.4 ? colorA : colorB
      colors[idx] = c.r
      colors[idx + 1] = c.g
      colors[idx + 2] = c.b
      colors[idx + 3] = c.r * 1.4
      colors[idx + 4] = c.g * 1.4
      colors[idx + 5] = c.b * 1.4
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    return { lineGeo: geo, lineMat: mat }
  }, [])

  // 12 dimensional warp rings along tunnel
  const ringMeshes = useMemo(() => {
    const geo = new THREE.TorusGeometry(32, 0.4, 16, 64)
    const mat = new THREE.MeshBasicMaterial({
      color: '#65d5ff',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
    return { geo, mat }
  }, [])

  useFrame((state) => {
    const p = progressRef.current
    if (p < start - 0.02 || p > end + 0.02) {
      if (groupRef.current) groupRef.current.visible = false
      return
    }

    if (groupRef.current) groupRef.current.visible = true

    // Normalized progress within this warp window (0 → 1)
    const t = Math.min(1, Math.max(0, (p - start) / (end - start)))

    // Envelope bell curve: peaks around t = 0.5
    const intensity = Math.sin(t * Math.PI)
    const alpha = Math.pow(intensity, 1.4)

    lineMat.opacity = alpha * 0.95
    ringMeshes.mat.opacity = alpha * 0.65
    if (lightRef.current) {
      lightRef.current.intensity = alpha * 3.5
    }

    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.8 + t * 4
    }

    if (linesRef.current) {
      // Rush lines forward
      const posAttr = lineGeo.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      const speed = 120 + t * 650

      for (let i = 0; i < LINE_COUNT; i++) {
        const idx = i * 6 + 2
        arr[idx] += speed * 0.016
        arr[idx + 3] += speed * 0.016

        if (arr[idx] > 20) {
          const length = 40 + Math.random() * 120
          arr[idx] = -600
          arr[idx + 3] = -600 - length
        }
      }
      posAttr.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, -850]}>
      {/* Relativistic streak rays */}
      <lineSegments ref={linesRef} geometry={lineGeo} material={lineMat} />

      {/* Warp tunnel rings */}
      <group ref={ringsGroupRef}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh
            key={i}
            geometry={ringMeshes.geo}
            material={ringMeshes.mat}
            position={[0, 0, -i * 55]}
            scale={[1 + i * 0.08, 1 + i * 0.08, 1]}
          />
        ))}
      </group>

      {/* Central lunar vortex light flare */}
      <pointLight ref={lightRef} color="#7ad4ff" intensity={0} distance={300} decay={2} />
    </group>
  )
}
