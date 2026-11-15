import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Html } from '@react-three/drei'

export interface AssemblyInfo {
  id: string
  name: string
  shortName: string
  badge: string
  role: string
  color: string
  nodePrefixes: string[]
}

export const COMPONENT_ASSEMBLIES: AssemblyInfo[] = [
  {
    id: 'ascent_cabin',
    name: 'Ascent Stage - Crew Compartment & Shell',
    shortName: 'Ascent Stage',
    badge: 'Stage Separation',
    role: 'Pressurized cockpit housing Armstrong & Aldrin, guidance computer, avionics, and ascent engine.',
    color: '#e8c86a',
    nodePrefixes: ['polySurfac', 'pCube2', 'pCube27', 'pCube28', 'pCube29'],
  },
  {
    id: 'antennas_docking',
    name: 'Upper Antennas & Docking Drogue Assembly',
    shortName: 'Antennas & Docking',
    badge: 'Upper Avionics',
    role: 'S-band steerable dish for direct telemetry/voice to Earth; overhead docking ring for CSM Columbia.',
    color: '#38bdf8',
    nodePrefixes: ['group51', 'group32', 'pCone7', 'pPipe1', 'pPipe2', 'polySurfa2', 'polySurfa3', 'polySurfa4'],
  },
  {
    id: 'egress_ladder',
    name: 'Forward Egress Platform, Hatch & Ladder',
    shortName: 'Egress Ladder & Porch',
    badge: 'EVA Interface',
    role: 'Forward work platform and 9-rung ladder where Neil Armstrong stepped off onto the lunar surface.',
    color: '#34d399',
    nodePrefixes: ['polySurfa1', 'pCube3', 'pCylinde11', 'pCylinder2'],
  },
  {
    id: 'rcs_thrusters',
    name: 'RCS Quad Attitude Control Clusters',
    shortName: 'RCS Thruster Quads',
    badge: 'Attitude Control',
    role: 'Four quad clusters of 100-lb Marquardt hypergolic rockets providing 3-axis pitch, roll, and yaw control.',
    color: '#f87171',
    nodePrefixes: ['group73', 'group74', 'group75', 'pCylinder4', 'pCylinder5', 'pCylinder6', 'pCylinder7'],
  },
  {
    id: 'spherical_tanks',
    name: 'Auxiliary Helium & Propellant Storage Tanks',
    shortName: 'Storage Tanks',
    badge: 'Consumables',
    role: 'Titanium pressure vessels holding Aerozine 50 fuel, N2O4 oxidizer, and supercritical helium.',
    color: '#c084fc',
    nodePrefixes: ['pSphere'],
  },
  {
    id: 'landing_gear',
    name: 'Descent Stage - Landing Gear & Footpads',
    shortName: 'Landing Gear & Footpads',
    badge: 'Surface Interface',
    role: 'Crushable aluminium honeycomb struts and four 37-inch dished footpads absorbing touchdown impact.',
    color: '#fbbf24',
    nodePrefixes: ['group31', 'pCylinder3'],
  },
  {
    id: 'descent_stage',
    name: 'Descent Stage - Octagonal Chassis & Engine Bell',
    shortName: 'Descent Stage Core',
    badge: 'Base Structure',
    role: 'Octagonal chassis with gold Kapton blankets, deep-throttling TRW engine. Permanent site datum.',
    color: '#e5e7eb',
    nodePrefixes: ['pCylinder1', 'group13', 'pPlane'],
  },
]

function classifyNode(name: string): AssemblyInfo {
  if (!name) return COMPONENT_ASSEMBLIES[6]
  if (name === 'polySurfa1' || name === 'pCube3' || name.startsWith('pCylinde11') || name.startsWith('pCylinder2')) {
    return COMPONENT_ASSEMBLIES[2] // egress_ladder
  }
  if (name === 'pCylinder1') return COMPONENT_ASSEMBLIES[6] // descent_stage
  if (name === 'pCylinder3') return COMPONENT_ASSEMBLIES[5] // landing_gear

  for (const ass of COMPONENT_ASSEMBLIES) {
    for (const prefix of ass.nodePrefixes) {
      if (name.startsWith(prefix) || name === prefix) return ass
    }
  }
  return COMPONENT_ASSEMBLIES[6]
}

function smoothstep(min: number, max: number, value: number): number {
  if (value <= min) return 0
  if (value >= max) return 1
  const t = (value - min) / (max - min)
  return t * t * (3 - 2 * t)
}

interface ClassifiedMesh {
  mesh: THREE.Mesh
  assembly: AssemblyInfo
  initialPosition: THREE.Vector3
  initialScale: THREE.Vector3
  quadrantX: number
  quadrantZ: number
}

interface LunarModuleBreakdownProps {
  progressRef: React.MutableRefObject<number>
  range?: [number, number]
}

export function LunarModuleBreakdown({
  progressRef,
  range = [0.56, 0.78],
}: LunarModuleBreakdownProps) {
  const [start, end] = range
  const rootGroupRef = useRef<THREE.Group>(null)
  const classifiedMeshesRef = useRef<ClassifiedMesh[]>([])
  const [modelLoaded, setModelLoaded] = useState(false)
  const [activeAssembly, setActiveAssembly] = useState<AssemblyInfo | null>(null)
  const currentEasePRef = useRef(0)

  // Load Model with DRACOLoader
  useEffect(() => {
    let active = true

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    const modelUrls = ['/Apollo Lunar Module.glb', '/assets/models/002.apollo-lunar-module.glb']

    function tryLoad(urlIndex: number) {
      if (urlIndex >= modelUrls.length) return

      loader.load(
        modelUrls[urlIndex],
        (gltf) => {
          if (!active) {
            dracoLoader.dispose()
            return
          }

          const root = gltf.scene
          const list: ClassifiedMesh[] = []

          root.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh
              mesh.castShadow = true
              mesh.receiveShadow = true

              const initialPosition = mesh.position.clone()
              const initialScale = mesh.scale.clone()

              mesh.geometry.computeBoundingBox()
              const geomCenter = new THREE.Vector3()
              if (mesh.geometry.boundingBox) {
                mesh.geometry.boundingBox.getCenter(geomCenter)
              }

              const posX = Math.abs(geomCenter.x) > 0.05 ? geomCenter.x : mesh.position.x
              const posZ = Math.abs(geomCenter.z) > 0.05 ? geomCenter.z : mesh.position.z
              const quadrantX = posX >= 0 ? 1 : -1
              const quadrantZ = posZ >= 0 ? 1 : -1

              const assembly = classifyNode(mesh.name)

              // PBR Materials refinement matching Test
              if (mesh.material) {
                const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
                mats.forEach((m) => {
                  if ((m as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                    const mat = m as THREE.MeshStandardMaterial
                    if (mat.name.includes('blinn1')) {
                      // Kapton gold foil
                      mat.color.setHex(0xd4af37)
                      mat.metalness = 0.88
                      mat.roughness = 0.32
                    } else if (mat.name.includes('blinn9')) {
                      // Copper heat shield
                      mat.color.setHex(0xb87333)
                      mat.metalness = 0.82
                      mat.roughness = 0.35
                    } else if (mat.name.includes('blinn4')) {
                      // Aluminum alloy
                      mat.metalness = 0.72
                      mat.roughness = 0.38
                    } else if (mat.name.includes('blinn7') || mat.name.includes('blinn5')) {
                      // White blanket
                      mat.roughness = 0.72
                      mat.metalness = 0.1
                    }
                  }
                })
              }

              list.push({
                mesh,
                assembly,
                initialPosition,
                initialScale,
                quadrantX,
                quadrantZ,
              })
            }
          })

          root.scale.setScalar(1.0)
          root.position.set(0, 0, 0)

          if (rootGroupRef.current) {
            rootGroupRef.current.clear()
            rootGroupRef.current.add(root)
          }

          classifiedMeshesRef.current = list
          setModelLoaded(true)
          dracoLoader.dispose()
        },
        undefined,
        (err) => {
          console.warn(`Failed loading LM from ${modelUrls[urlIndex]}, trying next:`, err)
          tryLoad(urlIndex + 1)
        }
      )
    }

    tryLoad(0)

    return () => {
      active = false
      dracoLoader.dispose()
    }
  }, [])

  // Optimized Per-Frame Staged Exploded Separation Kinematics
  useFrame(() => {
    const p = progressRef.current

    // Visibility boundary
    if (p < start - 0.04 || p > end + 0.06) {
      if (rootGroupRef.current) rootGroupRef.current.visible = false
      return
    }

    if (rootGroupRef.current) rootGroupRef.current.visible = true

    // Target breakdown progress (0.0: resting assembled -> 1.0: fully exploded)
    const rawP = Math.min(1, Math.max(0, (p - 0.58) / 0.18))

    // Silky lerp
    currentEasePRef.current += (rawP - currentEasePRef.current) * 0.1

    const progress = currentEasePRef.current
    const list = classifiedMeshesRef.current

    if (list.length > 0) {
      // Staged progression factors directly from modelClassifier.js
      const pAscent = smoothstep(0.06, 0.30, progress)
      const pGear = smoothstep(0.24, 0.48, progress)
      const pLadder = smoothstep(0.42, 0.66, progress)
      const pRCS = smoothstep(0.56, 0.80, progress)
      const pAntenna = smoothstep(0.66, 0.88, progress)
      const pTanks = smoothstep(0.76, 1.00, progress)

      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        const mesh = item.mesh
        const init = item.initialPosition
        const assemblyId = item.assembly.id

        let ox = 0
        let oy = 0
        let oz = 0
        let scaleX = 1
        let scaleZ = 1

        switch (assemblyId) {
          case 'ascent_cabin':
            oy = 2.4 * pAscent
            break
          case 'antennas_docking':
            oy = 2.4 * pAscent + 1.5 * pAntenna
            break
          case 'egress_ladder':
            oy = 0.8 * pLadder
            oz = 1.8 * pLadder
            break
          case 'rcs_thrusters': {
            const dirX = item.quadrantX
            const dirZ = item.quadrantZ
            ox = dirX * 1.6 * pRCS
            oy = 2.4 * pAscent + 0.3 * pRCS
            oz = dirZ * 1.6 * pRCS
            break
          }
          case 'landing_gear':
            oy = -1.1 * pGear
            scaleX = 1 + 0.18 * pGear
            scaleZ = 1 + 0.18 * pGear
            break
          case 'spherical_tanks': {
            const dirX = item.quadrantX
            const dirZ = item.quadrantZ
            ox = dirX * 1.4 * pTanks
            oy = 0.3 * pTanks
            oz = dirZ * 1.4 * pTanks
            break
          }
          case 'descent_stage':
          default:
            break
        }

        mesh.position.x = init.x + ox
        mesh.position.y = init.y + oy
        mesh.position.z = init.z + oz

        if (scaleX !== 1 || scaleZ !== 1) {
          mesh.scale.x = item.initialScale.x * scaleX
          mesh.scale.z = item.initialScale.z * scaleZ
        } else {
          mesh.scale.x = item.initialScale.x
          mesh.scale.z = item.initialScale.z
        }
      }
    }

    // Set active badge description according to staged separation
    if (progress < 0.12) {
      setActiveAssembly(COMPONENT_ASSEMBLIES[6]) // Descent Stage Core
    } else if (progress < 0.32) {
      setActiveAssembly(COMPONENT_ASSEMBLIES[0]) // Ascent Cabin Separation
    } else if (progress < 0.50) {
      setActiveAssembly(COMPONENT_ASSEMBLIES[5]) // Landing Gear Struts
    } else if (progress < 0.68) {
      setActiveAssembly(COMPONENT_ASSEMBLIES[2]) // Egress Ladder & Porch
    } else if (progress < 0.82) {
      setActiveAssembly(COMPONENT_ASSEMBLIES[3]) // RCS Attitude Quads
    } else {
      setActiveAssembly(COMPONENT_ASSEMBLIES[4]) // Spherical Tanks
    }
  })

  // Telemetry Rings on Ground Pad (Matching Viewport3D aesthetic)
  const ringRadii = useMemo(
    () => [
      { r: 1.8, color: '#1e293b', opacity: 0.35, width: 0.02 },
      { r: 3.28, color: '#38bdf8', opacity: 0.75, width: 0.035 },
      { r: 4.8, color: '#1e293b', opacity: 0.45, width: 0.02 },
      { r: 6.4, color: '#1e293b', opacity: 0.3, width: 0.02 },
    ],
    []
  )

  return (
    <group position={[0, 0, -1200]}>
      {/* High-Tech Telemetry Ground Pedestal (Igloo Aesthetic from Test) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[7.4, 64]} />
        <meshBasicMaterial color="#07090e" />
      </mesh>

      {/* Concentric Telemetry Guidance Rings */}
      {ringRadii.map(({ r, color, opacity, width }, idx) => (
        <mesh
          key={idx}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02 + idx * 0.001, 0]}
        >
          <ringGeometry args={[r, r + width, 64]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Regolith Ground Plane Surrounding Exhibit */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[95, 48]} />
        <meshStandardMaterial color="#16181e" roughness={0.92} metalness={0.06} />
      </mesh>

      {/* Loaded Apollo Lunar Module hierarchy */}
      <group ref={rootGroupRef} />

      {/* 3D Telemetry Floating Label Anchor (from Test) */}
      {modelLoaded && activeAssembly && (
        <Html position={[0, 4.4, 0]} center distanceFactor={24}>
          <div
            style={{
              background: 'rgba(5, 7, 14, 0.92)',
              border: `1px solid ${activeAssembly.color}`,
              boxShadow: `0 0 28px ${activeAssembly.color}33`,
              borderRadius: 6,
              padding: '12px 18px',
              color: '#ece9e2',
              pointerEvents: 'none',
              minWidth: 260,
              maxWidth: 320,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.25s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: activeAssembly.color,
                }}
              >
                APOLLO LM STAGED BREAKDOWN
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.58rem',
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: `${activeAssembly.color}22`,
                  color: activeAssembly.color,
                  border: `1px solid ${activeAssembly.color}55`,
                  textTransform: 'uppercase',
                }}
              >
                {activeAssembly.badge}
              </span>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.08rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: 6,
                lineHeight: 1.2,
              }}
            >
              {activeAssembly.name}
            </div>

            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                lineHeight: 1.45,
                color: '#c9c5be',
              }}
            >
              {activeAssembly.role}
            </div>
          </div>
        </Html>
      )}

      {/* Dedicated Key Sun Illumination for Module Details */}
      <directionalLight
        position={[14, 18, 12]}
        intensity={3.8}
        color="#fff8ee"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-12, 8, -10]} intensity={1.4} color="#38bdf8" />
      <directionalLight position={[0, 12, -15]} intensity={1.8} color="#ffeedd" />
      <ambientLight intensity={0.4} color="#111622" />
    </group>
  )
}
