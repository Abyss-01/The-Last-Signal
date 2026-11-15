import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Normalized model Y bounds from glTF accessors: [-0.14089 -> 12.8459] = 12.9868 units
// Real Saturn V height = 110.6m => scale factor ~ 8.516
const MODEL_SCALE = 8.516;
const MODEL_Y_OFFSET = 0.14089 * MODEL_SCALE;

// Interstage split heights in world meters above pad deck
const Y_SIC_SII_INTERSTAGE = (4.346 + 0.141) * MODEL_SCALE;
const Y_SII_SIVB_INTERSTAGE = (7.727 + 0.141) * MODEL_SCALE;
const Y_SIVB_CSM_ADAPTER = (10.65 + 0.141) * MODEL_SCALE;

function cloneWithClipPlanes(source, planes) {
  const clone = source.clone(true);
  clone.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      const clonedMats = mats.map((m) => {
        const mat = m.clone();
        mat.clippingPlanes = planes;
        mat.clipShadows = false;
        mat.needsUpdate = true;
        return mat;
      });
      child.material = Array.isArray(child.material) ? clonedMats : clonedMats[0];
    }
  });
  return clone;
}

function createPlumeMaterial(baseColor, hotColor, strength = 1) {
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
  });
}

// Fallback procedural Saturn V stack if saturn_v.glb is not yet placed in /assets/
function buildProceduralSaturnFallback() {
  const group = new THREE.Group();
  const whiteMat = new THREE.MeshStandardMaterial({ color: '#f2f4f7', roughness: 0.45, metalness: 0.2 });
  const blackMat = new THREE.MeshStandardMaterial({ color: '#181a1f', roughness: 0.55, metalness: 0.3 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.59, 10.5, 32), whiteMat);
  body.position.y = 5.5;
  group.add(body);

  const interstageBand = new THREE.Mesh(new THREE.CylinderGeometry(0.595, 0.595, 0.9, 32), blackMat);
  interstageBand.position.y = 4.35;
  group.add(interstageBand);

  const csm = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.45, 2.2, 32), whiteMat);
  csm.position.y = 11.6;
  group.add(csm);

  return group;
}

export function createSaturnVRocket(scene, modelUrl = './assets/saturn_v.glb', onProgress, onReady) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vehicleRoot = new THREE.Group();
  vehicleRoot.name = 'saturn-v-stack';
  scene.add(vehicleRoot);

  const sicGroup = new THREE.Group();
  const siiGroup = new THREE.Group();
  const sivbGroup = new THREE.Group();
  const csmGroup = new THREE.Group();
  const fullStackGroup = new THREE.Group();
  fullStackGroup.name = 'saturn-v-unseparated-stack';
  const stageGroups = { sic: sicGroup, sii: siiGroup, sivb: sivbGroup, csm: csmGroup };
  const originalEmissive = new WeakMap();
  const originalStageOpacity = new WeakMap();
  let highlightedStage = null;

  const applyStageHighlight = () => {
    Object.entries(stageGroups).forEach(([stageId, group]) => {
      group.traverse((child) => {
        if (!child.isMesh) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (!material.emissive) return;
          if (!originalEmissive.has(material)) {
            originalEmissive.set(material, {
              color: material.emissive.clone(),
              intensity: material.emissiveIntensity,
            });
          }
          const original = originalEmissive.get(material);
          if (highlightedStage === stageId) {
            material.emissive.set('#d18b36');
            material.emissiveIntensity = 0.42;
          } else {
            material.emissive.copy(original.color);
            material.emissiveIntensity = original.intensity;
          }
        });
      });
    });
  };

  vehicleRoot.add(fullStackGroup, sicGroup, siiGroup, sivbGroup, csmGroup);

  // Clipping planes for non-destructive stage partitioning
  const planes = {
    sicTopPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), Y_SIC_SII_INTERSTAGE),
    siiBottomPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -Y_SIC_SII_INTERSTAGE),
    siiTopPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), Y_SII_SIVB_INTERSTAGE),
    sivbBottomPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -Y_SII_SIVB_INTERSTAGE),
    sivbTopPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), Y_SIVB_CSM_ADAPTER),
    csmBottomPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -Y_SIVB_CSM_ADAPTER),
  };

  const attachModelToStages = (rawModel) => {
    // The supplied GLB omits large stretches of the interstage and S-IVB skin.
    // Fill those authored mesh gaps with understated shell sections so the
    // opening stack reads as one vehicle; these are clipped with each stage.
    const shellMaterial = new THREE.MeshStandardMaterial({
      color: '#d5d0c4',
      roughness: 0.62,
      metalness: 0.12,
    });
    const addShell = (bottomRadius, topRadius, bottomY, topY, name) => {
      const shell = new THREE.Mesh(
        new THREE.CylinderGeometry(topRadius, bottomRadius, topY - bottomY, 48, 1, true),
        shellMaterial
      );
      shell.name = name;
      shell.position.y = (bottomY + topY) * 0.5;
      // This GLB's vertical axis sits at z ~= 0.69 in its local coordinates.
      shell.position.z = 0.69;
      shell.castShadow = true;
      shell.receiveShadow = true;
      rawModel.add(shell);
    };
    addShell(0.56, 0.56, Y_SIC_SII_INTERSTAGE / MODEL_SCALE, 5.72, 'S-II interstage skin');
    addShell(0.43, 0.43, Y_SII_SIVB_INTERSTAGE / MODEL_SCALE, 10.64, 'S-IVB stage skin');
    addShell(0.43, 0.27, 10.64, 11.18, 'spacecraft adapter skin');

    rawModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((material) => {
          if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
            material.roughness = Math.min(material.roughness, 0.48);
            material.metalness = Math.max(material.metalness, 0.12);
          }
        });
      }
    });
    rawModel.scale.setScalar(MODEL_SCALE);
    rawModel.position.set(0, MODEL_Y_OFFSET, 0);
    fullStackGroup.add(rawModel);

    const sic = cloneWithClipPlanes(rawModel, [planes.sicTopPlane]);
    const sii = cloneWithClipPlanes(rawModel, [planes.siiBottomPlane, planes.siiTopPlane]);
    const sivb = cloneWithClipPlanes(rawModel, [planes.sivbBottomPlane, planes.sivbTopPlane]);
    const csm = cloneWithClipPlanes(rawModel, [planes.csmBottomPlane]);

    [sic, sii, sivb, csm].forEach((part) => {
      part.scale.setScalar(MODEL_SCALE);
      part.position.set(0, MODEL_Y_OFFSET, 0);
    });

    sicGroup.add(sic);
    siiGroup.add(sii);
    sivbGroup.add(sivb);
    csmGroup.add(csm);
    lastSicOpacity = -1;
    lastSiiOpacity = -1;
    applyStageHighlight();
  };

  // Load official NASA Saturn V GLB
  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    (gltf) => {
      attachModelToStages(gltf.scene);
      if (onReady) onReady(true);
    },
    (xhr) => {
      if (onProgress && xhr.total > 0) {
        onProgress((xhr.loaded / xhr.total) * 100);
      }
    },
    (err) => {
      console.warn('Could not load ./assets/saturn_v.glb; falling back to procedural geometry.', err);
      attachModelToStages(buildProceduralSaturnFallback());
      if (onReady) onReady(false);
    }
  );

  // Interstage Bulkhead Caps
  const siiBulkhead = new THREE.Mesh(
    new THREE.CircleGeometry(5.05, 32),
    new THREE.MeshStandardMaterial({ color: '#1a1d24', roughness: 0.6, metalness: 0.5 })
  );
  siiBulkhead.rotation.x = -Math.PI / 2;
  siiBulkhead.position.y = Y_SIC_SII_INTERSTAGE + 0.1;
  siiGroup.add(siiBulkhead);

  const sivbBulkhead = new THREE.Mesh(
    new THREE.CircleGeometry(3.3, 32),
    new THREE.MeshStandardMaterial({ color: '#1e222b', roughness: 0.5, metalness: 0.6 })
  );
  sivbBulkhead.rotation.x = -Math.PI / 2;
  sivbBulkhead.position.y = Y_SII_SIVB_INTERSTAGE + 0.1;
  sivbGroup.add(sivbBulkhead);

  // Layered F-1 plumes: hot inner cores plus animated, turbulent outer envelopes.
  const f1OuterMaterial = createPlumeMaterial('#ff9d3b', '#fff4d2', 0.9);
  const f1CoreMaterial = createPlumeMaterial('#ffd27a', '#ffffff', 1.35);
  const f1Offsets = [
    [0, 0, 0],
    [3.1, 0, 3.1],
    [-3.1, 0, 3.1],
    [3.1, 0, -3.1],
    [-3.1, 0, -3.1],
  ];

  const f1Plumes = new THREE.Group();
  f1Plumes.position.set(0, 0.2, 0);
  f1Offsets.forEach(([x, y, z]) => {
    const nozzleGroup = new THREE.Group();
    nozzleGroup.position.set(x, y, z);

    const outerCone = new THREE.Mesh(
      new THREE.ConeGeometry(1.65, 28, 16, 1, true),
      f1OuterMaterial
    );
    outerCone.position.y = -14;

    const innerCore = new THREE.Mesh(
      new THREE.ConeGeometry(0.95, 14, 12, 1, true),
      f1CoreMaterial
    );
    innerCore.position.y = -7;

    nozzleGroup.add(outerCone, innerCore);
    f1Plumes.add(nozzleGroup);
  });
  // The plume remains visible while the authored whole-stack model is shown.
  vehicleRoot.add(f1Plumes);

  // The same animated layered treatment is reused by both J-2 stages.
  const j2OuterMaterial = createPlumeMaterial('#79b9ff', '#e8f5ff', 0.58);
  const j2CoreMaterial = createPlumeMaterial('#b7dcff', '#ffffff', 0.9);
  const j2SiiPlumes = new THREE.Group();
  j2SiiPlumes.position.set(0, Y_SIC_SII_INTERSTAGE, 0);
  f1Offsets.forEach(([x, , z]) => {
    const outerCone = new THREE.Mesh(
      new THREE.ConeGeometry(1.35, 22, 14, 1, true),
      j2OuterMaterial
    );
    outerCone.position.set(x * 0.65, -11, z * 0.65);
    const coreCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.62, 14, 12, 1, true),
      j2CoreMaterial
    );
    coreCone.position.set(x * 0.65, -7, z * 0.65);
    j2SiiPlumes.add(outerCone, coreCone);
  });
  siiGroup.add(j2SiiPlumes);

  // 1x Rocketdyne J-2 Plume (S-IVB)
  const j2SivbPlume = new THREE.Group();
  const j2SivbOuter = new THREE.Mesh(
    new THREE.ConeGeometry(1.6, 24, 16, 1, true),
    j2OuterMaterial
  );
  const j2SivbCore = new THREE.Mesh(
    new THREE.ConeGeometry(0.72, 15, 12, 1, true),
    j2CoreMaterial
  );
  j2SivbOuter.position.set(0, Y_SII_SIVB_INTERSTAGE - 12, 0);
  j2SivbCore.position.set(0, Y_SII_SIVB_INTERSTAGE - 7.5, 0);
  j2SivbPlume.add(j2SivbOuter, j2SivbCore);
  sivbGroup.add(j2SivbPlume);

  // Dynamic Engine Illumination
  const engineLight = new THREE.PointLight('#ff9d3b', 0, 120, 1.6);
  engineLight.position.set(0, -4, 0);
  vehicleRoot.add(engineLight);

  const upVec = new THREE.Vector3(0, 1, 0);
  const downVec = new THREE.Vector3(0, -1, 0);
  const tmpPos = new THREE.Vector3();
  const tmpQuat = new THREE.Quaternion();
  const stageUp = new THREE.Vector3();

  let lastSicOpacity = 1;
  let lastSiiOpacity = 1;
  const setStageOpacity = (group, opacity, previousOpacity) => {
    if (Math.abs(opacity - previousOpacity) < 0.001) return previousOpacity;
    group.visible = opacity > 0.015;
    group.traverse((child) => {
      if (!child.isMesh) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!originalStageOpacity.has(material)) {
          originalStageOpacity.set(material, { transparent: material.transparent, opacity: material.opacity });
        }
        const original = originalStageOpacity.get(material);
        const transparent = original.transparent || opacity < 0.999;
        if (material.transparent !== transparent) {
          material.transparent = transparent;
          material.needsUpdate = true;
        }
        material.opacity = original.opacity * opacity;
      });
    });
    return opacity;
  };

  const updateStagePlane = (obj, plane, localY, isTopCap) => {
    obj.updateWorldMatrix(true, false);
    obj.getWorldPosition(tmpPos);
    obj.getWorldQuaternion(tmpQuat);
    stageUp.copy(upVec).applyQuaternion(tmpQuat);
    const cutPoint = tmpPos.clone().addScaledVector(stageUp, localY);
    const normal = isTopCap
      ? downVec.clone().applyQuaternion(tmpQuat)
      : stageUp.clone();
    plane.setFromNormalAndCoplanarPoint(normal, cutPoint);
  };

  return {
    highlightStage(stageId) {
      highlightedStage = stageId;
      applyStageHighlight();
    },
    update(state, elapsedTime) {
      const flicker = prefersReducedMotion
        ? 1
        : 0.92 + Math.sin(elapsedTime * 48) * 0.05 + Math.cos(elapsedTime * 73) * 0.03;
      [f1OuterMaterial, f1CoreMaterial, j2OuterMaterial, j2CoreMaterial].forEach((material) => {
        material.uniforms.uTime.value = state.progress * 42;
      });
      f1OuterMaterial.uniforms.uThrust.value = state.f1Thrust;
      f1CoreMaterial.uniforms.uThrust.value = state.f1Thrust;
      j2OuterMaterial.uniforms.uThrust.value = Math.max(state.j2SiiThrust, state.j2SivbThrust);
      j2CoreMaterial.uniforms.uThrust.value = Math.max(state.j2SiiThrust, state.j2SivbThrust);

      vehicleRoot.position.set(0, state.rocketY, 0);
      vehicleRoot.rotation.set(0, 0, -state.rocketPitch);

      // S-IC separation & aerodynamic tumble
      sicGroup.position.set(0, state.sicDropY, 0);
      sicGroup.rotation.set(state.sicTumbleX, 0, state.sicTumbleX * 0.35);
      lastSicOpacity = setStageOpacity(
        sicGroup,
        1 - THREE.MathUtils.clamp((-state.sicDropY - 82) / 30, 0, 1),
        lastSicOpacity
      );

      // S-II separation
      siiGroup.position.set(0, state.siiDropY, 0);
      siiGroup.rotation.set(0, 0, state.siiTumbleZ);
      lastSiiOpacity = setStageOpacity(
        siiGroup,
        1 - THREE.MathUtils.clamp((-state.siiDropY - 72) / 36, 0, 1),
        lastSiiOpacity
      );

      // The spent S-IVB drifts behind as the docked spacecraft departs.
      sivbGroup.position.z = state.sivbDriftZ;

      // Apollo CSM Transposition & Docking
      csmGroup.position.set(0, state.csmTransposeZ, 0);
      csmGroup.rotation.set(state.csmFlipPitch, 0, 0);

      // Render the authored model once until a stage actually moves. The four
      // clipped reconstructions are only needed for independent separation.
      const partitionsNeeded = highlightedStage !== null
        || Math.abs(state.sicDropY) > 0.01
        || Math.abs(state.siiDropY) > 0.01
        || Math.abs(state.sivbDriftZ) > 0.01
        || Math.abs(state.csmTransposeZ) > 0.01
        || Math.abs(state.csmFlipPitch) > 0.01;
      fullStackGroup.visible = !partitionsNeeded;
      sicGroup.visible = partitionsNeeded && lastSicOpacity > 0.015;
      siiGroup.visible = partitionsNeeded && lastSiiOpacity > 0.015;
      sivbGroup.visible = partitionsNeeded;
      csmGroup.visible = partitionsNeeded;

      // Keep clipping planes aligned with separated stage transforms
      updateStagePlane(sicGroup, planes.sicTopPlane, Y_SIC_SII_INTERSTAGE, true);
      updateStagePlane(siiGroup, planes.siiBottomPlane, Y_SIC_SII_INTERSTAGE, false);
      updateStagePlane(siiGroup, planes.siiTopPlane, Y_SII_SIVB_INTERSTAGE, true);
      updateStagePlane(sivbGroup, planes.sivbBottomPlane, Y_SII_SIVB_INTERSTAGE, false);
      updateStagePlane(sivbGroup, planes.sivbTopPlane, Y_SIVB_CSM_ADAPTER, true);
      updateStagePlane(csmGroup, planes.csmBottomPlane, Y_SIVB_CSM_ADAPTER, false);

      // Plume scaling
      f1Plumes.visible = state.f1Thrust > 0.01;
      const f1Len = (0.2 + state.f1Thrust * (1 + state.spaceTransition * 1.4)) * flicker;
      const f1Spread = 1 + state.spaceTransition * 1.8;
      f1Plumes.scale.set(f1Spread, f1Len, f1Spread);

      j2SiiPlumes.visible = state.j2SiiThrust > 0.01;
      j2SiiPlumes.scale.set(1.3, state.j2SiiThrust * flicker, 1.3);

      j2SivbPlume.visible = state.j2SivbThrust > 0.01;
      j2SivbPlume.scale.set(1.2, state.j2SivbThrust * flicker, 1.2);

      const totalThrust = Math.max(state.f1Thrust, state.j2SiiThrust * 0.6, state.j2SivbThrust * 0.4);
      engineLight.intensity = totalThrust * 18 * flicker;
      engineLight.color.set(state.f1Thrust > 0.1 ? '#ff9d3b' : '#70b5ff');
    },
  };
}
