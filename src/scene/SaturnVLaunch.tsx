import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Model dimensions & interstage split heights
const MODEL_SCALE = 8.516
const MODEL_Y_OFFSET = 0.14089 * MODEL_SCALE

const Y_SIC_SII_INTERSTAGE = (4.346 + 0.141) * MODEL_SCALE
const Y_SII_SIVB_INTERSTAGE = (7.727 + 0.141) * MODEL_SCALE
const Y_SIVB_CSM_ADAPTER = (10.65 + 0.141) * MODEL_SCALE

function cloneWithClipPlanes(source: THREE.Object3D, planes: THREE.Plane[]) {
  const clone = source.clone(true)
  clone.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      const clonedMats = mats.map((m) => {
        const mat = m.clone()
        mat.clippingPlanes = planes
        mat.clipShadows = false
        mat.needsUpdate = true
        return mat
      })
      mesh.material = Array.isArray(mesh.material) ? clonedMats : clonedMats[0]
    }
  })
  return clone
}

function createPlumeMaterial(baseColor: string, hotColor: string, strength = 1) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uThrust: { value: 0 },
      uStrength: { value: strength },
      uBaseColor: { value: new THREE.Color(baseColor) },
      uHotColor: { value: new THREE.Color(hotColor) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uThrust;
      varying vec2 vUv;
      varying float vRun;

      void main() {
        vUv = uv;
        vRun = 1.0 - uv.y;
        vec3 displaced = position;
        float envelope = vRun * vRun * uThrust;
        displaced.x += sin(uv.x * 31.0 + uTime * 4.1 - vRun * 13.0) * envelope * 0.2;
        displaced.z += cos(uv.x * 23.0 - uTime * 3.4 + vRun * 17.0) * envelope * 0.16;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uThrust;
      uniform float uStrength;
      uniform vec3 uBaseColor;
      uniform vec3 uHotColor;
      varying vec2 vUv;
      varying float vRun;

      void main() {
        float turbulence = sin(vUv.x * 27.0 + uTime * 4.2 - vRun * 15.0)
          * cos(vUv.x * 13.0 - uTime * 2.8 + vRun * 21.0);
        float breakup = smoothstep(-0.82, 0.78, turbulence);
        float rootFade = smoothstep(0.0, 0.09, vRun);
        float tailFade = 1.0 - smoothstep(0.77, 1.0, vRun + (breakup - 0.5) * 0.13);
        float alpha = rootFade * tailFade * mix(0.3, 0.9, breakup) * uThrust * uStrength;
        vec3 flameColor = mix(uHotColor, uBaseColor, smoothstep(0.05, 0.88, vRun));
        gl_FragColor = vec4(flameColor * alpha * 1.8, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
}

interface SaturnVLaunchProps {
  progressRef: React.MutableRefObject<number>
}

export function SaturnVLaunch({ progressRef }: SaturnVLaunchProps) {
  const { gl } = useThree()
  const vehicleGroupRef = useRef<THREE.Group>(null)
  const fullStackRef = useRef<THREE.Group>(null)
  const sicRef = useRef<THREE.Group>(null)
  const siiRef = useRef<THREE.Group>(null)
  const sivbRef = useRef<THREE.Group>(null)
  const csmRef = useRef<THREE.Group>(null)

  const [_modelLoaded, setModelLoaded] = useState(false)

  // Enable renderer local clipping for stage division
  useEffect(() => {
    gl.localClippingEnabled = true
  }, [gl])

  // Plume Materials
  const f1OuterMat = useMemo(() => createPlumeMaterial('#ff9d3b', '#fff4d2', 0.9), [])
  const f1CoreMat = useMemo(() => createPlumeMaterial('#ffd27a', '#ffffff', 1.4), [])
  const j2OuterMat = useMemo(() => createPlumeMaterial('#79b9ff', '#e8f5ff', 0.7), [])
  const j2CoreMat = useMemo(() => createPlumeMaterial('#cbe7ff', '#ffffff', 1.2), [])

  // Smoke Billboard Screen-Cover Particles
  const SMOKE_COUNT = 90
  const { smokeMesh, smokeDummy, smokeSeeds } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(16, 16)
    const mat = new THREE.MeshBasicMaterial({
      color: '#c4aa86',
      transparent: true,
      opacity: 0,
      blending: THREE.NormalBlending,
      depthWrite: false,
    })
    const inst = new THREE.InstancedMesh(geo, mat, SMOKE_COUNT)
    inst.frustumCulled = false

    const dummy = new THREE.Object3D()
    const seeds = Array.from({ length: SMOKE_COUNT }, (_, i) => ({
      angle: (i * 2.39996) % (Math.PI * 2),
      radialSpeed: 16 + ((i * 37) % 65),
      lift: 8 + ((i * 19) % 25),
      phaseOffset: i / SMOKE_COUNT,
      baseScale: 1.2 + ((i * 13) % 8) * 0.4,
    }))

    return { smokeMesh: inst, smokeDummy: dummy, smokeSeeds: seeds }
  }, [])

  // Load Model and Setup Stages
  useEffect(() => {
    let active = true
    const loader = new GLTFLoader()

    const planes = {
      sicTopPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), Y_SIC_SII_INTERSTAGE),
      siiBottomPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -Y_SIC_SII_INTERSTAGE),
      siiTopPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), Y_SII_SIVB_INTERSTAGE),
      sivbBottomPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -Y_SII_SIVB_INTERSTAGE),
      sivbTopPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), Y_SIVB_CSM_ADAPTER),
      csmBottomPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -Y_SIVB_CSM_ADAPTER),
    }

    loader.load(
      '/assets/models/nasa-saturn-v-rocket.glb',
      (gltf) => {
        if (!active) return
        const rawModel = gltf.scene

        rawModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            mesh.castShadow = true
            mesh.receiveShadow = true
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
            mats.forEach((m) => {
              if ((m as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                const std = m as THREE.MeshStandardMaterial
                std.roughness = 0.45
                std.metalness = 0.2
              }
            })
          }
        })

        rawModel.scale.setScalar(MODEL_SCALE)
        rawModel.position.set(0, MODEL_Y_OFFSET, 0)

        // Attach whole stack
        if (fullStackRef.current) {
          fullStackRef.current.clear()
          fullStackRef.current.add(rawModel.clone())
        }

        // Attach segmented stages
        const sic = cloneWithClipPlanes(rawModel, [planes.sicTopPlane])
        const sii = cloneWithClipPlanes(rawModel, [planes.siiBottomPlane, planes.siiTopPlane])
        const sivb = cloneWithClipPlanes(rawModel, [planes.sivbBottomPlane, planes.sivbTopPlane])
        const csm = cloneWithClipPlanes(rawModel, [planes.csmBottomPlane])

        ;[sic, sii, sivb, csm].forEach((p) => {
          p.scale.setScalar(MODEL_SCALE)
          p.position.set(0, MODEL_Y_OFFSET, 0)
        })

        if (sicRef.current) {
          sicRef.current.clear()
          sicRef.current.add(sic)
        }
        if (siiRef.current) {
          siiRef.current.clear()
          siiRef.current.add(sii)
        }
        if (sivbRef.current) {
          sivbRef.current.clear()
          sivbRef.current.add(sivb)
        }
        if (csmRef.current) {
          csmRef.current.clear()
          csmRef.current.add(csm)
        }

        setModelLoaded(true)
      },
      undefined,
      (err) => {
        console.warn('Fallback loading Saturn V', err)
      }
    )

    return () => {
      active = false
    }
  }, [])

  // Dynamic Launch & Stage Separation Choreography
  useFrame((state) => {
    const p = progressRef.current
    const time = state.clock.elapsedTime

    // Only active during launch & ascent (p: 0.0 → 0.46)
    if (p > 0.48) {
      if (vehicleGroupRef.current) vehicleGroupRef.current.visible = false
      smokeMesh.visible = false
      return
    }

    if (vehicleGroupRef.current) vehicleGroupRef.current.visible = true

    // Mission Timing Checkpoints:
    // 0.00 - 0.12: Pad 39A standing
    // 0.12 - 0.16: Ignition & thrust build
    // 0.16 - 0.28: Liftoff, smoke clouds billow and screen is covered
    // 0.28 - 0.34: Punching into space, S-IC burnout
    // 0.34 - 0.38: S-IC staging separation
    // 0.38 - 0.44: S-II burn & S-II separation
    // 0.44 - 0.48: S-IVB translunar burn

    let rocketY = 0
    let rocketPitch = 0
    let f1Thrust = 0
    let j2SiiThrust = 0
    let j2SivbThrust = 0
    let sicDropY = 0
    let sicTumbleX = 0
    let siiDropY = 0
    let siiTumbleZ = 0
    let smokeDensity = 0

    if (p < 0.12) {
      // Standing on pad
      rocketY = 0
    } else if (p < 0.16) {
      // Ignition ramp
      const t = (p - 0.12) / 0.04
      f1Thrust = t
      smokeDensity = t * 0.8
    } else if (p < 0.28) {
      // Liftoff & climb through atmosphere
      const t = (p - 0.16) / 0.12
      rocketY = Math.pow(t, 2.2) * 160
      rocketPitch = t * 0.08
      f1Thrust = 1.0
      // Smoke billows up to engulf camera (peaks at t ≈ 0.7 - 0.9, then clears)
      smokeDensity = 1.0
    } else if (p < 0.34) {
      // Upper atmosphere to space edge
      const t = (p - 0.28) / 0.06
      rocketY = 160 + t * 240
      rocketPitch = 0.08 + t * 0.12
      f1Thrust = 1.0 - t * 0.5
      smokeDensity = (1.0 - t) * 0.3
    } else if (p < 0.38) {
      // S-IC stage separation
      const t = (p - 0.34) / 0.04
      rocketY = 400 + t * 220
      rocketPitch = 0.20 + t * 0.08
      f1Thrust = 0
      j2SiiThrust = t
      sicDropY = t * 65
      sicTumbleX = t * 0.4
    } else if (p < 0.44) {
      // S-II burn & S-II staging
      const t = (p - 0.38) / 0.06
      rocketY = 620 + t * 380
      rocketPitch = 0.28 + t * 0.12
      sicDropY = 65 + t * 200
      sicTumbleX = 0.4 + t * 0.8
      if (t < 0.6) {
        j2SiiThrust = 1.0
      } else {
        j2SiiThrust = 0
        const st = (t - 0.6) / 0.4
        j2SivbThrust = st
        siiDropY = st * 70
        siiTumbleZ = st * 0.35
      }
    } else {
      // S-IVB translunar cruise
      const t = (p - 0.44) / 0.04
      rocketY = 1000 + t * 500
      rocketPitch = 0.40
      j2SivbThrust = 1.0
      sicDropY = 350
      siiDropY = 120 + t * 150
    }

    // Update vehicle group position
    if (vehicleGroupRef.current) {
      vehicleGroupRef.current.position.set(0, rocketY, 0)
      vehicleGroupRef.current.rotation.z = -rocketPitch
    }

    // Toggle between single full stack and separated stages
    const isSeparated = p >= 0.34
    if (fullStackRef.current) fullStackRef.current.visible = !isSeparated
    if (sicRef.current) {
      sicRef.current.visible = isSeparated
      sicRef.current.position.set(0, -sicDropY, 0)
      sicRef.current.rotation.x = sicTumbleX
    }
    if (siiRef.current) {
      siiRef.current.visible = isSeparated
      siiRef.current.position.set(0, -siiDropY, 0)
      siiRef.current.rotation.z = siiTumbleZ
    }
    if (sivbRef.current) sivbRef.current.visible = isSeparated
    if (csmRef.current) csmRef.current.visible = isSeparated

    // Update Plume Shaders
    f1OuterMat.uniforms.uTime.value = time
    f1OuterMat.uniforms.uThrust.value = f1Thrust
    f1CoreMat.uniforms.uTime.value = time
    f1CoreMat.uniforms.uThrust.value = f1Thrust

    j2OuterMat.uniforms.uTime.value = time
    j2OuterMat.uniforms.uThrust.value = Math.max(j2SiiThrust, j2SivbThrust)
    j2CoreMat.uniforms.uTime.value = time
    j2CoreMat.uniforms.uThrust.value = Math.max(j2SiiThrust, j2SivbThrust)

    // Update Smoke Clouds & Screen-Cover Transition
    if (smokeDensity > 0.01 && p < 0.32) {
      smokeMesh.visible = true
      const mat = smokeMesh.material as THREE.MeshBasicMaterial
      mat.opacity = Math.min(0.55, smokeDensity * 0.55)

      const drive = p * 12
      const camPos = state.camera.position

      for (let i = 0; i < SMOKE_COUNT; i++) {
        const s = smokeSeeds[i]
        const life = (drive + s.phaseOffset) % 1
        const dist = life * s.radialSpeed * (0.5 + smokeDensity * 0.9)
        const x = Math.cos(s.angle) * dist
        const z = Math.sin(s.angle) * dist
        // In liftoff phase, lift particles up into camera path to cover screen
        const y = Math.min(rocketY * 0.5, 45) + life * s.lift + (p > 0.20 ? (p - 0.20) * 120 : 0)

        const scale = s.baseScale * (1.2 + life * 4.5) * (0.4 + smokeDensity * 1.2)
        smokeDummy.position.set(x, y, z)
        smokeDummy.scale.set(scale * 1.6, scale * 1.4, 1)
        smokeDummy.lookAt(camPos)
        smokeDummy.updateMatrix()
        smokeMesh.setMatrixAt(i, smokeDummy.matrix)
      }
      smokeMesh.instanceMatrix.needsUpdate = true
    } else {
      smokeMesh.visible = false
    }
  })

  // 5 F-1 Plumes
  const f1Plumes = useMemo(() => {
    const group = new THREE.Group()
    const offsets = [
      [0, 0, 0],
      [3.1, 0, 3.1],
      [-3.1, 0, 3.1],
      [3.1, 0, -3.1],
      [-3.1, 0, -3.1],
    ]
    offsets.forEach(([x, y, z]) => {
      const nozzle = new THREE.Group()
      nozzle.position.set(x, y, z)

      const outer = new THREE.Mesh(new THREE.ConeGeometry(1.65, 32, 16, 1, true), f1OuterMat)
      outer.position.y = -16
      const inner = new THREE.Mesh(new THREE.ConeGeometry(0.95, 18, 12, 1, true), f1CoreMat)
      inner.position.y = -9

      nozzle.add(outer, inner)
      group.add(nozzle)
    })
    return group
  }, [f1OuterMat, f1CoreMat])

  // J-2 Plume for S-II & S-IVB
  const j2Plumes = useMemo(() => {
    const group = new THREE.Group()
    const outer = new THREE.Mesh(new THREE.ConeGeometry(1.2, 22, 16, 1, true), j2OuterMat)
    outer.position.y = -11
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.65, 12, 12, 1, true), j2CoreMat)
    inner.position.y = -6
    group.add(outer, inner)
    return group
  }, [j2OuterMat, j2CoreMat])

  return (
    <group>
      {/* Launch Pad 39A Base Structure */}
      <group position={[0, -2, 0]}>
        {/* Concrete deck */}
        <mesh position={[0, -1, 0]} receiveShadow>
          <boxGeometry args={[48, 2.5, 48]} />
          <meshStandardMaterial color="#30353d" roughness={0.9} />
        </mesh>
        {/* Flame trench cut */}
        <mesh position={[0, -3.5, 0]}>
          <boxGeometry args={[18, 4, 60]} />
          <meshStandardMaterial color="#1a1c21" roughness={0.95} />
        </mesh>
        {/* Service tower lattice silhouette */}
        <mesh position={[-16, 52, 0]}>
          <boxGeometry args={[6, 110, 6]} />
          <meshStandardMaterial color="#6a2824" roughness={0.7} />
        </mesh>
      </group>

      {/* Billowing Pad Smoke & Screen-Cover Volumetrics */}
      <primitive object={smokeMesh} />

      {/* The Saturn V Vehicle */}
      <group ref={vehicleGroupRef}>
        {/* Whole stack (unseparated) */}
        <group ref={fullStackRef}>
          <primitive object={f1Plumes} position={[0, 0, 0]} />
        </group>

        {/* Separated Stage Groups */}
        <group ref={sicRef}>
          <primitive object={f1Plumes.clone()} position={[0, 0, 0]} />
        </group>

        <group ref={siiRef}>
          <primitive object={j2Plumes} position={[0, Y_SIC_SII_INTERSTAGE, 0]} />
        </group>

        <group ref={sivbRef}>
          <primitive object={j2Plumes.clone()} position={[0, Y_SII_SIVB_INTERSTAGE, 0]} />
        </group>

        <group ref={csmRef} />
      </group>
    </group>
  )
}
