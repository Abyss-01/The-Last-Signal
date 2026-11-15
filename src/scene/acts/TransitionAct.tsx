import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

import { useInRange } from './shared'

/**
 * Act 4 (progress 0.66 → 0.78): the interplanetary time-skip.
 *
 * Two era gates the camera flies through mark the 26-year leap from the
 * last crewed footsteps (Apollo 15, 1971) to the first robotic wheels on
 * Mars (Pathfinder/Sojourner, 1997). The HUD caption states the critical
 * distinction explicitly: Apollo never went to Mars — robotic missions did.
 */

const ringMat = new THREE.MeshBasicMaterial({
  color: '#e8c86a',
  transparent: true,
  opacity: 0.28,
  side: THREE.DoubleSide,
})

const GATES: {
  position: [number, number, number]
  radius: number
  label: string
  sub: string
}[] = [
  {
    position: [400, 62, -1600],
    radius: 44,
    label: '1971 — THE LAST FOOTSTEPS',
    sub: 'Apollo 15 departs Hadley–Apennine',
  },
  {
    position: [500, 84, -1840],
    radius: 52,
    label: '1997 — THE FIRST WHEELS ON MARS',
    sub: 'Pathfinder & Sojourner at Ares Vallis',
  },
]

export function TransitionAct({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>
}) {
  const visible = useInRange(progressRef, 0.62, 0.84)
  const marsDiscRef = useRef<THREE.Mesh>(null)
  const marsVisible = useInRange(progressRef, 0.64, 0.88)

  useFrame(({ clock }) => {
    const disc = marsDiscRef.current
    if (disc) {
      const s = 1 + Math.sin(clock.elapsedTime * 0.4) * 0.01
      disc.scale.setScalar(240 * s)
    }
  })

  if (!visible && !marsVisible) return null

  return (
    <group>
      {visible &&
        GATES.map((gate, i) => (
          <group key={i} position={gate.position} rotation={[0, i === 0 ? -0.25 : -0.2, 0]}>
            <mesh material={ringMat}>
              <torusGeometry args={[gate.radius, 0.5, 12, 72]} />
            </mesh>
            <Html position={[0, gate.radius + 12, 0]} center distanceFactor={60}>
              <div
                style={{
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 15,
                    letterSpacing: '0.22em',
                    color: '#e8c86a',
                    textShadow: '0 0 12px rgba(0,0,0,0.8)',
                  }}
                >
                  {gate.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Newsreader', serif",
                    fontSize: 13,
                    fontStyle: 'italic',
                    color: '#c9c2b2',
                    marginTop: 4,
                  }}
                >
                  {gate.sub}
                </div>
              </div>
            </Html>
          </group>
        ))}

      {marsVisible && (
        <mesh ref={marsDiscRef} position={[720, 70, -2400]} scale={240}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial
            color="#b0603a"
            emissive="#5a2b16"
            emissiveIntensity={0.55}
            roughness={1}
          />
        </mesh>
      )}
    </group>
  )
}
