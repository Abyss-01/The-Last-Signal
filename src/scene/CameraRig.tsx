import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import gsap from 'gsap'

import type { FeaturedArtifact } from '@/data/types'
import { cameraPose } from './ScrollChoreography'

/**
 * Camera controller: during scroll mode it interpolates along the
 * choreography splines from `scrollProgressRef` (never React state). When
 * an artifact is selected, a GSAP tween hands the camera to a damped
 * OrbitControls focus; closing returns it to the exact scroll keyframe.
 */

type CameraMode = 'scroll' | 'to-inspect' | 'inspect' | 'to-scroll'

interface CameraRigProps {
  scrollProgressRef: React.MutableRefObject<number>
  focusArtifact: FeaturedArtifact | null
}

export function CameraRig({ scrollProgressRef, focusArtifact }: CameraRigProps) {
  const camera = useThree((state) => state.camera)
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null)
  const mode = useRef<CameraMode>('scroll')
  const lookTarget = useRef(new THREE.Vector3(0, 14, 0))
  const savedPose = useRef<{ pos: THREE.Vector3; look: THREE.Vector3 } | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  // Enter / exit inspection via GSAP camera choreography.
  useEffect(() => {
    if (focusArtifact) {
      if (mode.current !== 'scroll') return
      savedPose.current = {
        pos: camera.position.clone(),
        look: lookTarget.current.clone(),
      }
      mode.current = 'to-inspect'
      const anchor = new THREE.Vector3(...focusArtifact.sceneAnchor)
      const offset = new THREE.Vector3(6, 3.2, 7).normalize().multiplyScalar(focusArtifact.id === 'eagle-descent-stage' ? 16 : 7)
      const goalPos = anchor.clone().add(offset)
      const goalLook = anchor.clone().add(new THREE.Vector3(0, focusArtifact.id === 'eagle-descent-stage' ? 1.4 : 0.6, 0))
      tweenRef.current?.kill()
      tweenRef.current = gsap
        .to(camera.position, {
          x: goalPos.x,
          y: goalPos.y,
          z: goalPos.z,
          duration: 1.6,
          ease: 'power2.inOut',
          onUpdate: () => {
            const look = goalLook
            lookTarget.current.lerp(look, 0.12)
            camera.lookAt(lookTarget.current)
          },
          onComplete: () => {
            lookTarget.current.copy(goalLook)
            mode.current = 'inspect'
          },
        })
      // Configure orbit controls target once tween completes.
      const controls = controlsRef.current
      if (controls) {
        controls.target.copy(anchor)
        controls.update()
      }
    } else {
      // Returning to the saved scroll keyframe.
      const saved = savedPose.current
      if (!saved || mode.current === 'scroll') return
      mode.current = 'to-scroll'
      tweenRef.current?.kill()
      tweenRef.current = gsap
        .to(camera.position, {
          x: saved.pos.x,
          y: saved.pos.y,
          z: saved.pos.z,
          duration: 1.3,
          ease: 'power2.inOut',
          onUpdate: () => {
            lookTarget.current.lerp(saved.look, 0.15)
            camera.lookAt(lookTarget.current)
          },
          onComplete: () => {
            lookTarget.current.copy(saved.look)
            savedPose.current = null
            mode.current = 'scroll'
          },
        })
    }
    return () => {
      tweenRef.current?.kill()
    }
  }, [focusArtifact, camera])

  // Scroll mode: spline interpolation from the mutable progress ref.
  useFrame((_, delta) => {
    if (mode.current !== 'scroll') return
    const { position: targetPos, lookAt: targetLook } = cameraPose(scrollProgressRef.current)
    const damp = 1 - Math.exp(-delta * 7)

    camera.position.lerp(targetPos, damp)
    lookTarget.current.lerp(targetLook, damp)
    camera.lookAt(lookTarget.current)
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={false}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={2.2}
      maxDistance={40}
      maxPolarAngle={Math.PI / 2 - 0.06}
    />
  )
}

/**
 * Toggles OrbitControls enabled state from outside the Canvas.
 * Rendered as a null component that reacts to inspection mode.
 */
export function OrbitGate({ inspecting }: { inspecting: boolean }) {
  const controls = useThree((state) => state.controls) as
    | { enabled: boolean; update: () => void }
    | null
  useEffect(() => {
    if (!controls) return
    controls.enabled = inspecting
    controls.update()
  }, [controls, inspecting])
  return null
}
