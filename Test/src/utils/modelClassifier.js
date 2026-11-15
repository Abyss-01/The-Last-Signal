/**
 * modelClassifier.js
 * Inspects Three.js scene hierarchy and associates meshes with verified structural assemblies.
 * Computes individual, cohesive, staged separation kinematics along clear mechanical axes.
 */

import * as THREE from 'three';
import { COMPONENT_ASSEMBLIES } from '../data/modelMetadata';

/**
 * Classifies a node name into one of the COMPONENT_ASSEMBLIES.
 * @param {string} name
 * @returns {object} assembly config
 */
export function classifyNodeName(name) {
  if (!name) return COMPONENT_ASSEMBLIES.find(a => a.id === 'descent_stage');

  // Exact / prioritized node matches
  if (name === 'polySurfa1') return COMPONENT_ASSEMBLIES.find(a => a.id === 'egress_ladder');
  if (name === 'pCube3' || name.startsWith('pCylinde11') || name.startsWith('pCylinder2')) {
    return COMPONENT_ASSEMBLIES.find(a => a.id === 'egress_ladder');
  }
  if (name === 'pCylinder1') return COMPONENT_ASSEMBLIES.find(a => a.id === 'descent_stage');
  if (name === 'pCylinder3') return COMPONENT_ASSEMBLIES.find(a => a.id === 'landing_gear');

  for (const assembly of COMPONENT_ASSEMBLIES) {
    for (const prefix of assembly.nodePrefixes) {
      if (name.startsWith(prefix) || name === prefix) {
        return assembly;
      }
    }
  }
  return COMPONENT_ASSEMBLIES.find(a => a.id === 'descent_stage');
}

/**
 * Calculates target exploded offset for a mesh based on its assembly and quadrant coordinates.
 * @param {THREE.Mesh} mesh
 * @param {object} assembly
 * @param {THREE.Vector3} geomCenter
 * @returns {THREE.Vector3}
 */
export function calculateTargetOffset(mesh, assembly, geomCenter) {
  const target = new THREE.Vector3(0, 0, 0);
  const center = geomCenter || (mesh && mesh.userData && mesh.userData.geomCenter) || (mesh && mesh.position) || new THREE.Vector3(1, 0, 1);
  const dirX = center.x >= 0 ? 1 : -1;
  const dirZ = center.z >= 0 ? 1 : -1;

  switch (assembly ? assembly.id : '') {
    case 'ascent_cabin':
      // Elevates vertically along +Y
      target.set(0, 4.2, 0);
      break;

    case 'antennas_docking':
      // Lifts high above the ascent cabin roof
      target.set(0, 7.6, 0);
      break;

    case 'egress_ladder':
      // Translates forward along +Z with ascent lift
      target.set(0, 1.5, 3.6);
      break;

    case 'rcs_thrusters':
      // RCS quads expand outward radially in 4 diagonal quadrants + ascent lift
      target.set(dirX * 3.2, 4.2 + 0.4, dirZ * 3.2);
      break;

    case 'spherical_tanks':
      // Spherical fuel and helium tanks expand outward from descent bays
      target.set(dirX * 2.8, 0.5, dirZ * 2.8);
      break;

    case 'landing_gear':
      // Landing gear drops cleanly downward along -Y as an intact unit
      target.set(0, -2.2, 0);
      break;

    case 'structural_struts':
      // Tubular conduits and tie rods drift outward
      target.set(dirX * 2.0, -0.6, dirZ * 2.0);
      break;

    case 'descent_stage':
    default:
      // Foundation base anchor: stays grounded at origin
      target.set(0, 0, 0);
      break;
  }

  return target;
}

/**
 * Prepares the loaded GLTF model for interactive inspection and breakdown.
 * Computes exact vertex bounding centers and prepares materials.
 * @param {THREE.Object3D} sceneRoot
 * @returns {object} structured metadata and classified mesh lists
 */
export function prepareModelHierarchy(sceneRoot) {
  const assemblyMap = new Map();
  COMPONENT_ASSEMBLIES.forEach(a => {
    assemblyMap.set(a.id, {
      ...a,
      meshes: [],
      bounds: new THREE.Box3(),
      restCenter: new THREE.Vector3(),
      explodedCenter: new THREE.Vector3()
    });
  });

  const allMeshes = [];

  sceneRoot.traverse((child) => {
    if (child.isMesh) {
      // Store rest transforms
      child.userData.initialPosition = child.position.clone();
      child.userData.initialRotation = child.rotation.clone();
      child.userData.initialScale = child.scale.clone();

      // Compute actual geometry bounding center in local mesh coordinates
      child.geometry.computeBoundingBox();
      const geomCenter = new THREE.Vector3();
      if (child.geometry.boundingBox) {
        child.geometry.boundingBox.getCenter(geomCenter);
      }
      child.userData.geomCenter = geomCenter;

      // Classify assembly
      const assembly = classifyNodeName(child.name);
      child.userData.assemblyId = assembly.id;
      child.userData.assemblyName = assembly.name;

      // Quadrant determination based on true geometry center
      const posX = Math.abs(geomCenter.x) > 0.05 ? geomCenter.x : child.position.x;
      const posZ = Math.abs(geomCenter.z) > 0.05 ? geomCenter.z : child.position.z;
      child.userData.quadrantX = posX >= 0 ? 1 : -1;
      child.userData.quadrantZ = posZ >= 0 ? 1 : -1;

      // Calculate target offset
      const targetOffset = calculateTargetOffset(child, assembly, geomCenter);
      child.userData.targetOffset = targetOffset;
      child.userData.targetPosition = child.position.clone().add(targetOffset);

      // Material refinements for cinematic realism and 60-120fps performance
      if (child.material) {
        child.castShadow = false;
        child.receiveShadow = false;

        const mats = Array.isArray(child.material) ? child.material : [child.material];
        const newMats = mats.map(m => {
          const cloned = m.clone();
          // Enhance PBR properties if standard/physical
          if (cloned.isMeshStandardMaterial || cloned.isMeshPhysicalMaterial) {
            if (cloned.name.includes('blinn1')) {
              // Gold Kapton foil
              cloned.color.setHex(0xd4af37);
              cloned.metalness = 0.85;
              cloned.roughness = 0.32;
            } else if (cloned.name.includes('blinn9')) {
              // Copper / Inconel heat shield
              cloned.color.setHex(0xb87333);
              cloned.metalness = 0.8;
              cloned.roughness = 0.35;
            } else if (cloned.name.includes('blinn4')) {
              // Aluminum alloy structure
              cloned.metalness = 0.7;
              cloned.roughness = 0.38;
            } else if (cloned.name.includes('blinn7') || cloned.name.includes('blinn5')) {
              // White insulation blanket
              cloned.roughness = 0.75;
              cloned.metalness = 0.1;
            }
          }
          return cloned;
        });

        child.material = Array.isArray(child.material) ? newMats : newMats[0];
      }

      allMeshes.push(child);

      const group = assemblyMap.get(assembly.id);
      if (group) {
        group.meshes.push(child);
      }
    }
  });

  // Compute group centers
  assemblyMap.forEach((group) => {
    group.meshes.forEach((mesh) => {
      if (mesh.geometry.boundingBox) {
        const box = mesh.geometry.boundingBox.clone();
        box.applyMatrix4(mesh.matrixWorld);
        group.bounds.union(box);
      }
    });

    if (!group.bounds.isEmpty()) {
      group.bounds.getCenter(group.restCenter);
      const avgOffset = group.meshes.length > 0 ? group.meshes[0].userData.targetOffset : new THREE.Vector3();
      group.explodedCenter.copy(group.restCenter).add(avgOffset);
    }
  });

  return {
    allMeshes,
    assemblies: Array.from(assemblyMap.values()),
    assemblyMap
  };
}

/**
 * Smoothstep easing for progressive transitions.
 */
function smoothstep(min, max, value) {
  if (value <= min) return 0;
  if (value >= max) return 1;
  const t = (value - min) / (max - min);
  return t * t * (3 - 2 * t);
}

/**
 * Fast direct transform update for individual, staged section breakdown.
 * Progress 0.0 to 1.0 separates each section in sequence along clear mechanical axes.
 * @param {Array<THREE.Mesh>} meshes
 * @param {number} progress 0.0 to 1.0
 */
export function applyBreakdownProgress(meshes, progress) {
  const p = Math.max(0, Math.min(1, progress));

  // Individual staged progression factors
  const pAscent = smoothstep(0.06, 0.30, p);
  const pGear = smoothstep(0.24, 0.48, p);
  const pLadder = smoothstep(0.42, 0.66, p);
  const pRCS = smoothstep(0.56, 0.80, p);
  const pAntenna = smoothstep(0.66, 0.88, p);
  const pTanks = smoothstep(0.76, 1.00, p);

  for (let i = 0; i < meshes.length; i++) {
    const mesh = meshes[i];
    const initPos = mesh.userData.initialPosition;
    if (!initPos) continue;

    const assemblyId = mesh.userData.assemblyId;
    let ox = 0;
    let oy = 0;
    let oz = 0;
    let scaleX = 1;
    let scaleZ = 1;

    switch (assemblyId) {
      case 'ascent_cabin':
        // Elevates vertically during Stage Separation
        oy = 4.2 * pAscent;
        break;

      case 'antennas_docking':
        // Inherits Ascent lift + telescopes higher above cabin roof
        oy = 4.2 * pAscent + 3.4 * pAntenna;
        break;

      case 'egress_ladder':
        // Translates forward (+Z) and lifts slightly
        oy = 1.5 * pLadder;
        oz = 3.6 * pLadder;
        break;

      case 'rcs_thrusters': {
        // Inherits Ascent lift + expands outward in 4 diagonal quadrants
        const dirX = mesh.userData.quadrantX || 1;
        const dirZ = mesh.userData.quadrantZ || 1;
        ox = dirX * 3.2 * pRCS;
        oy = 4.2 * pAscent + 0.4 * pRCS;
        oz = dirZ * 3.2 * pRCS;
        break;
      }

      case 'landing_gear':
        // Drops cleanly downward along -Y and expands outward radially
        oy = -2.2 * pGear;
        scaleX = 1 + 0.35 * pGear;
        scaleZ = 1 + 0.35 * pGear;
        break;

      case 'spherical_tanks': {
        const dirX = mesh.userData.quadrantX || 1;
        const dirZ = mesh.userData.quadrantZ || 1;
        ox = dirX * 2.8 * pTanks;
        oy = 0.5 * pTanks;
        oz = dirZ * 2.8 * pTanks;
        break;
      }

      case 'structural_struts': {
        const dirX = mesh.userData.quadrantX || 1;
        const dirZ = mesh.userData.quadrantZ || 1;
        ox = dirX * 2.0 * pTanks;
        oy = -0.6 * pTanks;
        oz = dirZ * 2.0 * pTanks;
        break;
      }

      case 'descent_stage':
      default:
        // Grounded reference base stays at (0, 0, 0)
        break;
    }

    mesh.position.x = initPos.x + ox;
    mesh.position.y = initPos.y + oy;
    mesh.position.z = initPos.z + oz;

    if (scaleX !== 1 || scaleZ !== 1) {
      mesh.scale.x = (mesh.userData.initialScale ? mesh.userData.initialScale.x : 1) * scaleX;
      mesh.scale.z = (mesh.userData.initialScale ? mesh.userData.initialScale.z : 1) * scaleZ;
    } else if (mesh.userData.initialScale) {
      mesh.scale.x = mesh.userData.initialScale.x;
      mesh.scale.z = mesh.userData.initialScale.z;
    }
  }
}

