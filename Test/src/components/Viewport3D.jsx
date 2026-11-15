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
  onError
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
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls with silky damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 2.0, 0); // Focus near vehicle center of mass
    controls.minDistance = 3.2;
    controls.maxDistance = 18.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // Prevent going underneath lunar surface
    controls.enablePan = false;
    controls.autoRotate = false;
    controlsRef.current = controls;

    // Lighting: Sun key light, Earthshine fill, ambient, and back rim light
    const sunLight = new THREE.DirectionalLight(0xfff6e8, 3.5);
    sunLight.position.set(12, 16, 10);
    scene.add(sunLight);

    const earthshine = new THREE.DirectionalLight(0x4a789c, 1.1);
    earthshine.position.set(-10, 6, -8);
    scene.add(earthshine);

    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.9);
    rimLight.position.set(0, 10, -14);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0x181f2c, 1.4);
    scene.add(ambientLight);

    // Cosmic starfield for lunar sky depth
    const starCount = 500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 28 + Math.random() * 32;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i + 1] = Math.max(0.6, r * Math.cos(phi));
      starPos[i + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Minimalist Circular Ground Baseline (Igloo aesthetic)
    const groundGeo = new THREE.CylinderGeometry(6.6, 6.8, 0.1, 48);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0x090c12 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.05;
    scene.add(groundMesh);

    const ringGeo = new THREE.RingGeometry(3.28, 3.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x1f2937, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.005;
    scene.add(ringMesh);

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
        if (Math.abs(diff) > 0.0002) {
          // Butter-smooth damped lerp
          currentProgressRef.current += diff * 0.085;
          applyBreakdownProgress(meshes, currentProgressRef.current);

          // Gently elevate camera target and expand framing if user is not actively orbiting
          if (!isDraggingRef.current && controls) {
            controls.target.y = 2.0 + 0.6 * currentProgressRef.current;
          }
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
        window.__scene = scene;
        window.__camera = cameraRef.current;
        window.__meshes = hierarchyData.allMeshes;

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
    downPosRef.current = { x: e.clientX, y: e.clientY };
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';

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
    onHoverComponent(null, null);
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

