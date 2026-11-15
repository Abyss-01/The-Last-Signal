import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { prepareModelHierarchy, applyBreakdownProgress } from '../utils/modelClassifier';
import { COMPONENT_ASSEMBLIES } from '../data/modelMetadata';

export default function Viewport3D({
  scrollProgress,
  onHoverComponent,
  selectedAssemblyId,
  setSelectedAssemblyId,
  autoRotate = false,
  prefersReducedMotion = false,
  onLoadingProgress,
  onLoadingComplete,
  onError,
  cameraPreset = 'orbit'
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRootRef = useRef(null);
  const meshesRef = useRef([]);
  const targetScrollProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const hoveredAssemblyRef = useRef(null);
  const [hoveredAssemblyState, setHoveredAssemblyState] = useState(null);
  const mousePosRef = useRef({ x: -1000, y: -1000, clientX: 0, clientY: 0, moved: false });
  const isDraggingRef = useRef(false);
  const downPosRef = useRef({ x: 0, y: 0 });

  // Camera preset animation target
  const presetTargetRef = useRef(null);
  const baseCamPos = useRef(new THREE.Vector3(7.4, 3.4, 7.8));

  // Stable callback refs to prevent any effect re-execution
  const onHoverComponentRef = useRef(onHoverComponent);
  const onLoadingProgressRef = useRef(onLoadingProgress);
  const onLoadingCompleteRef = useRef(onLoadingComplete);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onHoverComponentRef.current = onHoverComponent;
    onLoadingProgressRef.current = onLoadingProgress;
    onLoadingCompleteRef.current = onLoadingComplete;
    onErrorRef.current = onError;
  });

  // Keep target scroll progress updated
  useEffect(() => {
    targetScrollProgressRef.current = Math.max(0, Math.min(1, scrollProgress || 0));
  }, [scrollProgress]);

  // Sync autoRotate state to OrbitControls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate && !prefersReducedMotion;
      controlsRef.current.autoRotateSpeed = 0.6;
    }
  }, [autoRotate, prefersReducedMotion]);

  // Camera Presets handler
  useEffect(() => {
    if (!cameraPreset) return;
    const p = currentProgressRef.current;
    const dolly = 1.0 + 0.38 * p;

    let targetCam = new THREE.Vector3(7.4 * dolly, (3.2 + 1.2 * p), 7.8 * dolly);
    let targetFocus = new THREE.Vector3(0, 1.8 + 1.2 * p, 0);

    if (cameraPreset === 'eva') {
      targetCam.set(0.4, 2.2 + 0.8 * p, 8.8 * dolly);
      targetFocus.set(0, 1.8 + 0.8 * p, 1.0 * p);
    } else if (cameraPreset === 'top') {
      targetCam.set(0.05, 14.0 + 3.0 * p, 0.2);
      targetFocus.set(0, 2.2 + 1.2 * p, 0);
    } else if (cameraPreset === 'low') {
      targetCam.set(8.2 * dolly, 0.5, 3.8 * dolly);
      targetFocus.set(0, 1.6 + 0.8 * p, 0);
    }

    presetTargetRef.current = { cam: targetCam, target: targetFocus };
  }, [cameraPreset]);

  // Setup WebGL Scene with High-Performance Optimizations
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070c); // Deep cosmic obsidian
    sceneRef.current = scene;

    // Camera: fixed focal length framing the full Apollo Lunar Module
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(7.4, 3.4, 7.8);
    cameraRef.current = camera;

    // High performance renderer with ACESFilmic tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls with silky damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.8, 0); // Focus near vehicle center of mass
    controls.minDistance = 3.2;
    controls.maxDistance = 24.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // Prevent going underneath lunar surface
    controls.enablePan = false;
    controls.autoRotate = false;
    controlsRef.current = controls;

    // Lighting: Sun key light, Earthshine fill, ambient, and back rim light
    const sunLight = new THREE.DirectionalLight(0xfff8ee, 3.8);
    sunLight.position.set(14, 18, 12);
    scene.add(sunLight);

    const earthshine = new THREE.DirectionalLight(0x38bdf8, 1.4);
    earthshine.position.set(-12, 8, -10);
    scene.add(earthshine);

    const rimLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    rimLight.position.set(0, 12, -15);
    scene.add(rimLight);

    const groundBounce = new THREE.DirectionalLight(0x1e293b, 0.8);
    groundBounce.position.set(0, -6, 0);
    scene.add(groundBounce);

    const ambientLight = new THREE.AmbientLight(0x111622, 1.2);
    scene.add(ambientLight);

    // Cosmic starfield for lunar sky depth (two layers)
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 26 + Math.random() * 38;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i + 1] = Math.max(0.4, r * Math.cos(phi));
      starPos[i + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.11,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // High-Tech Telemetry Ground Pedestal (Igloo Aesthetic)
    const groundGeo = new THREE.CylinderGeometry(7.2, 7.5, 0.1, 64);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0x07090e });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.05;
    scene.add(groundMesh);

    // Concentric Telemetry Rings
    const ringRadii = [
      { r: 1.8, color: 0x1e293b, opacity: 0.35, width: 0.015 },
      { r: 3.28, color: 0x38bdf8, opacity: 0.75, width: 0.025 },
      { r: 4.8, color: 0x1e293b, opacity: 0.45, width: 0.015 },
      { r: 6.4, color: 0x1e293b, opacity: 0.3, width: 0.015 }
    ];
    ringRadii.forEach(({ r, color, opacity, width }, idx) => {
      const rGeo = new THREE.RingGeometry(r, r + width, 64);
      const rMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.rotation.x = -Math.PI / 2;
      rMesh.position.y = 0.005 + idx * 0.001;
      scene.add(rMesh);
    });

    // Crosshair Telemetry Lines on Ground Pad
    const crossGeo = new THREE.BufferGeometry();
    const crossPoints = new Float32Array([
      -6.8, 0.01, 0,  6.8, 0.01, 0,
      0, 0.01, -6.8,  0, 0.01, 6.8
    ]);
    crossGeo.setAttribute('position', new THREE.BufferAttribute(crossPoints, 3));
    const crossMat = new THREE.LineBasicMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.5
    });
    const crossLines = new THREE.LineSegments(crossGeo, crossMat);
    scene.add(crossLines);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Raycaster initialized once
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();
    let lastRaycastTime = 0;

    // Optimized 60 FPS Animation & Kinematics Loop
    let animId;
    const animate = (time) => {
      animId = requestAnimationFrame(animate);

      // Smoothly interpolate current breakdown progress towards scroll target
      const meshes = meshesRef.current;
      if (meshes.length > 0) {
        const targetP = targetScrollProgressRef.current;
        const diff = targetP - currentProgressRef.current;
        if (Math.abs(diff) > 0.0001) {
          // Butter-smooth damped lerp
          currentProgressRef.current += diff * 0.085;
          applyBreakdownProgress(meshes, currentProgressRef.current);
        }
      }

      const p = currentProgressRef.current;

      // Cinematic Dynamic Camera Framing:
      // Smoothly dollies out as the spacecraft explodes so every single component remains in view!
      if (!isDraggingRef.current && controls && !presetTargetRef.current) {
        const targetFocusY = 1.8 + 1.2 * p;
        controls.target.y += (targetFocusY - controls.target.y) * 0.08;

        // Dolly factor (+38% at full explosion)
        const dolly = 1.0 + 0.38 * p;
        // Subtle organic zero-G breathing drift
        const driftX = Math.sin(time * 0.0006) * 0.05;
        const driftY = Math.cos(time * 0.0008) * 0.03;
        const driftZ = Math.sin(time * 0.0005) * 0.05;

        const desiredCamX = baseCamPos.current.x * dolly + driftX;
        const desiredCamY = (baseCamPos.current.y + 1.2 * p) + driftY;
        const desiredCamZ = baseCamPos.current.z * dolly + driftZ;

        camera.position.x += (desiredCamX - camera.position.x) * 0.07;
        camera.position.y += (desiredCamY - camera.position.y) * 0.07;
        camera.position.z += (desiredCamZ - camera.position.z) * 0.07;
      } else if (presetTargetRef.current) {
        // Smoothly interpolate camera position & target to chosen preset
        const { cam, target } = presetTargetRef.current;
        camera.position.lerp(cam, 0.07);
        controls.target.lerp(target, 0.07);
        if (camera.position.distanceTo(cam) < 0.06 && controls.target.distanceTo(target) < 0.06) {
          presetTargetRef.current = null;
        }
      }

      // Throttled Raycast: only run every 60ms and only if mouse moved
      if (meshes.length > 0 && mousePosRef.current.moved && time - lastRaycastTime > 60) {
        lastRaycastTime = time;
        mousePosRef.current.moved = false;

        mouseVector.set(mousePosRef.current.x, mousePosRef.current.y);
        raycaster.setFromCamera(mouseVector, camera);

        const intersects = raycaster.intersectObjects(meshes, false);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const assemblyId = hit.userData.assemblyId;
          if (assemblyId) {
            const assembly = COMPONENT_ASSEMBLIES.find((a) => a.id === assemblyId);
            if (assembly && hoveredAssemblyRef.current !== assembly) {
              hoveredAssemblyRef.current = assembly;
              setHoveredAssemblyState(assembly.id);
              if (onHoverComponentRef.current) {
                onHoverComponentRef.current(assembly, {
                  clientX: mousePosRef.current.clientX,
                  clientY: mousePosRef.current.clientY
                });
              }
              container.style.cursor = 'pointer';
            }
          }
        } else if (hoveredAssemblyRef.current !== null) {
          hoveredAssemblyRef.current = null;
          setHoveredAssemblyState(null);
          if (onHoverComponentRef.current) {
            onHoverComponentRef.current(null, null);
          }
          container.style.cursor = 'grab';
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Load GLTF Model with DRACOLoader (Guarantees single instance, prevents clone duplication)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    let isDisposed = false;
    let loadedRoot = null;

    // Remove any previously existing model
    if (modelRootRef.current) {
      scene.remove(modelRootRef.current);
      modelRootRef.current = null;
    }

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/Apollo Lunar Module.glb',
      (gltf) => {
        if (isDisposed) {
          dracoLoader.dispose();
          return;
        }

        // Clean any duplicate if somehow exists
        if (modelRootRef.current) {
          scene.remove(modelRootRef.current);
        }

        const root = gltf.scene;
        loadedRoot = root;
        modelRootRef.current = root;
        scene.add(root);
        root.updateMatrixWorld(true);

        const hierarchyData = prepareModelHierarchy(root);
        meshesRef.current = hierarchyData.allMeshes;

        // Apply initial progress
        applyBreakdownProgress(hierarchyData.allMeshes, targetScrollProgressRef.current);

        dracoLoader.dispose();
        if (onLoadingCompleteRef.current) {
          onLoadingCompleteRef.current();
        }
      },
      (xhr) => {
        if (isDisposed) return;
        const progress = xhr.lengthComputable && xhr.total > 0
          ? (xhr.loaded / xhr.total) * 100
          : Math.min(99, (xhr.loaded / 716840) * 100);
        if (onLoadingProgressRef.current) {
          onLoadingProgressRef.current(progress);
        }
      },
      (error) => {
        if (isDisposed) return;
        console.error('GLTF loading error:', error);
        dracoLoader.dispose();
        if (onErrorRef.current) {
          onErrorRef.current(error);
        }
      }
    );

    return () => {
      isDisposed = true;
      dracoLoader.dispose();
      if (loadedRoot && scene) {
        scene.remove(loadedRoot);
      }
      if (modelRootRef.current && scene) {
        scene.remove(modelRootRef.current);
        modelRootRef.current = null;
      }
    };
  }, []);

  // Pointer event listeners
  const handlePointerMove = (e) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    mousePosRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mousePosRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mousePosRef.current.clientX = e.clientX;
    mousePosRef.current.clientY = e.clientY;
    mousePosRef.current.moved = true;
  };

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    presetTargetRef.current = null; // Clear preset animation when user interacts
    downPosRef.current = { x: e.clientX, y: e.clientY };
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';

    // Store updated manual camera orientation normalized by dolly factor
    if (cameraRef.current) {
      const p = currentProgressRef.current;
      const dolly = 1.0 + 0.38 * p;
      baseCamPos.current.set(
        cameraRef.current.position.x / dolly,
        cameraRef.current.position.y - 1.2 * p,
        cameraRef.current.position.z / dolly
      );
    }

    // Disambiguate dragging to orbit camera vs clicking to select assembly
    const dx = e.clientX - downPosRef.current.x;
    const dy = e.clientY - downPosRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 6 && hoveredAssemblyRef.current) {
      setSelectedAssemblyId((prev) =>
        prev === hoveredAssemblyRef.current.id ? null : hoveredAssemblyRef.current.id
      );
    }
  };

  const handlePointerLeave = () => {
    isDraggingRef.current = false;
    mousePosRef.current.moved = false;
    hoveredAssemblyRef.current = null;
    setHoveredAssemblyState(null);
    if (onHoverComponentRef.current) {
      onHoverComponentRef.current(null, null);
    }
  };

  // Highlighting: subtle cyan glow on hover, bright cyan glow on selection
  useEffect(() => {
    const meshes = meshesRef.current;
    if (!meshes || meshes.length === 0) return;

    for (let i = 0; i < meshes.length; i++) {
      const mesh = meshes[i];
      const isSelected = selectedAssemblyId && mesh.userData.assemblyId === selectedAssemblyId;
      const isHovered = !isSelected && hoveredAssemblyState && mesh.userData.assemblyId === hoveredAssemblyState;
      const mat = mesh.material;

      if (mat) {
        if (!mat.userData.origEmissive) {
          mat.userData.origEmissive = mat.emissive ? mat.emissive.clone() : new THREE.Color(0, 0, 0);
        }

        if (isSelected) {
          mat.emissive.setHex(0x38bdf8);
          mat.emissiveIntensity = 0.65;
        } else if (isHovered) {
          mat.emissive.setHex(0x38bdf8);
          mat.emissiveIntensity = 0.32;
        } else if (mat.userData.origEmissive) {
          mat.emissive.copy(mat.userData.origEmissive);
          mat.emissiveIntensity = 0.0;
        }
      }
    }
  }, [selectedAssemblyId, hoveredAssemblyState]);

  return (
    <div
      ref={containerRef}
      className="fixed-canvas-container"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      role="application"
      aria-label="3D Apollo Lunar Module Interactive Exhibit Canvas"
    />
  );
}
