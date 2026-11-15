import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  ASSET_PROVENANCE,
  GEOMETRY_ANALYSIS,
  COMPONENT_ASSEMBLIES,
  BREAKDOWN_STEPS,
  OBJECT_INFORMATION,
  BREAKDOWN_LIMITATION_STATEMENT
} from './modelMetadata';
import {
  classifyNodeName,
  calculateTargetOffset,
  prepareModelHierarchy,
  applyBreakdownProgress
} from '../utils/modelClassifier';
import { getPrefersReducedMotion } from '../utils/motion';

describe('Model Metadata & Provenance Verification', () => {
  it('documents model attribution as UNKNOWN until verified', () => {
    expect(ASSET_PROVENANCE.attributionStatus).toBe('UNKNOWN');
    expect(ASSET_PROVENANCE.filename).toBe('Apollo Lunar Module.glb');
    expect(ASSET_PROVENANCE.filesizeBytes).toBe(716840);
    expect(ASSET_PROVENANCE.sha256).toBe('379101dfcee399267addf771709107c35e826b0b9e5233272f123e4c8a585c4e');
  });

  it('records correct geometry properties from GLTF inspection', () => {
    expect(GEOMETRY_ANALYSIS.totalNodes).toBe(135);
    expect(GEOMETRY_ANALYSIS.totalMeshes).toBe(134);
    expect(GEOMETRY_ANALYSIS.totalMaterials).toBe(12);
    expect(GEOMETRY_ANALYSIS.animationsCount).toBe(135);
    expect(GEOMETRY_ANALYSIS.animationsDurationSeconds).toBe(0.0);
  });

  it('strictly marks all unverified mission facts with NASA placeholder flag', () => {
    OBJECT_INFORMATION.placeholderFields.forEach((field) => {
      expect(field.value).toBe('[NASA Source Verification Required]');
      expect(field.status).toBe('UNVERIFIED');
      expect(field.verificationGuide).toBeDefined();
    });
  });

  it('provides primary sources references for fact verification', () => {
    expect(OBJECT_INFORMATION.primarySourcesReference.length).toBeGreaterThanOrEqual(3);
    const urls = OBJECT_INFORMATION.primarySourcesReference.map(s => s.url);
    expect(urls.some(u => u.includes('nasa.gov'))).toBe(true);
  });

  it('includes explicit limitation statement regarding lack of internal CAD geometry', () => {
    expect(BREAKDOWN_LIMITATION_STATEMENT.explanation.length).toBeGreaterThan(0);
    const text = BREAKDOWN_LIMITATION_STATEMENT.explanation.join(' ');
    expect(text).toContain('134 unlabelled polygonal mesh nodes');
    expect(text).toContain('NOT present');
  });
});

describe('Node Classification & Breakdown Kinematics', () => {
  it('correctly classifies nodes into verified visible assemblies', () => {
    expect(classifyNodeName('group31 19').id).toBe('landing_gear');
    expect(classifyNodeName('group13 10').id).toBe('descent_stage');
    expect(classifyNodeName('polySurfac').id).toBe('ascent_cabin');
    expect(classifyNodeName('polySurfa1').id).toBe('egress_ladder');
    expect(classifyNodeName('group51 g1').id).toBe('antennas_docking');
    expect(classifyNodeName('group73 g1').id).toBe('rcs_thrusters');
    expect(classifyNodeName('pCube3').id).toBe('egress_ladder');
    expect(classifyNodeName('pSphere26').id).toBe('spherical_tanks');
    expect(classifyNodeName('pCylinde10').id).toBe('structural_struts');
    expect(classifyNodeName('pCylinder1').id).toBe('descent_stage');
  });

  it('calculates proper separation directions for each assembly', () => {
    const ascentMesh = new THREE.Mesh();
    ascentMesh.position.set(0, 3.0, 0);
    const ascentAssembly = COMPONENT_ASSEMBLIES.find(a => a.id === 'ascent_cabin');
    const ascentOffset = calculateTargetOffset(ascentMesh, ascentAssembly);
    expect(ascentOffset.y).toBeGreaterThan(2.0); // Ascent stage lifts upward along Y

    const gearMesh = new THREE.Mesh();
    gearMesh.position.set(2.0, 0.5, 2.0);
    const gearAssembly = COMPONENT_ASSEMBLIES.find(a => a.id === 'landing_gear');
    const gearOffset = calculateTargetOffset(gearMesh, gearAssembly);
    expect(gearOffset.y).toBeLessThan(0); // Landing gear lowers along Y

    const rcsMesh = new THREE.Mesh();
    rcsMesh.position.set(1.5, 2.5, 0);
    const rcsAssembly = COMPONENT_ASSEMBLIES.find(a => a.id === 'rcs_thrusters');
    const rcsOffset = calculateTargetOffset(rcsMesh, rcsAssembly);
    expect(rcsOffset.x).toBeGreaterThan(1.0); // Displaces outward along normal
  });

  it('correctly prepares scene hierarchy and interpolates breakdown progress', () => {
    const root = new THREE.Group();
    const meshA = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
    meshA.name = 'polySurfac';
    meshA.position.set(0, 2, 0);
    root.add(meshA);

    const meshB = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
    meshB.name = 'group31 10';
    meshB.position.set(1, 0.5, 1);
    root.add(meshB);

    const data = prepareModelHierarchy(root);
    expect(data.allMeshes.length).toBe(2);

    // Initial breakdown progress 0.0 -> at rest position
    applyBreakdownProgress(data.allMeshes, 0.0);
    expect(meshA.position.y).toBeCloseTo(2.0);
    expect(meshB.position.y).toBeCloseTo(0.5);

    // Progressive staged breakdown: at progress 0.20, ascent stage has elevated
    // while landing gear has not yet separated
    applyBreakdownProgress(data.allMeshes, 0.20);
    expect(meshA.position.y).toBeGreaterThan(2.0);
    expect(meshA.position.y).toBeLessThan(6.5);
    expect(meshB.position.y).toBeCloseTo(0.5); // gear untouched in Stage 1

    // Full breakdown progress 1.0 -> all at target exploded positions
    applyBreakdownProgress(data.allMeshes, 1.0);
    expect(meshA.position.y).toBeCloseTo(2.0 + 4.2);
    expect(meshB.position.y).toBeCloseTo(0.5 - 2.2);
  });
});

describe('Reduced Motion & Accessibility', () => {
  it('safely evaluates getPrefersReducedMotion', () => {
    const val = getPrefersReducedMotion();
    expect(typeof val).toBe('boolean');
  });

  it('defines 5 progressive breakdown steps', () => {
    expect(BREAKDOWN_STEPS.length).toBe(5);
    expect(BREAKDOWN_STEPS[0].progress).toBe(0.0);
    expect(BREAKDOWN_STEPS[4].progress).toBe(1.0);
  });
});
