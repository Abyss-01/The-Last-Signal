/**
 * modelMetadata.js
 * Comprehensive metadata, component assembly classification,
 * NASA source-verification placeholders, and asset provenance records.
 */

export const ASSET_PROVENANCE = {
  filename: 'Apollo Lunar Module.glb',
  filesizeBytes: 716840,
  filesizeFormatted: '700 KB (716,840 bytes)',
  sha256: '379101dfcee399267addf771709107c35e826b0b9e5233272f123e4c8a585c4e',
  gltfVersion: '2.0',
  generator: 'Khronos glTF Blender I/O v4.2.57',
  attributionStatus: 'UNKNOWN',
  attributionNote: 'Uncredited 3D model supplied in repository. Original creator, author, modeling studio, and license are UNVERIFIED pending source attribution.',
  preservationStatus: 'Source asset strictly preserved without modifications. Working copy served via /Apollo Lunar Module.glb.'
};

export const GEOMETRY_ANALYSIS = {
  totalNodes: 135,
  rootNode: 'lunarlande',
  totalMeshes: 134,
  totalMaterials: 12,
  animationsCount: 135,
  animationsDurationSeconds: 0.0,
  animationNote: 'All 135 embedded animations are single-keyframe static rest-pose actions (frame 0) exported by Blender. No pre-authored motion sequences exist.',
  boundingBox: {
    min: [-3.215, 0.103, -3.216],
    max: [3.213, 5.115, 3.211],
    size: [6.427, 5.013, 6.427]
  },
  dimensionsFormatted: {
    width: '6.43 m (X axis, landing gear span)',
    height: '5.01 m (Y axis, footpad baseline to antenna top)',
    depth: '6.43 m (Z axis, landing gear span)'
  },
  materials: [
    { id: 0, name: 'blinn1SG.002', type: 'Gold Foil / Kapton Thermal Shielding', baseColor: [0.77, 0.53, 0.06] },
    { id: 1, name: 'blinn4SG.002', type: 'Light Gray Aluminum Alloy Structure', baseColor: [0.75, 0.75, 0.75] },
    { id: 2, name: 'blinn5SG.002', type: 'White Coated Exterior Panel', baseColor: [1.0, 1.0, 1.0] },
    { id: 3, name: 'blinn2SG.002', type: 'Dark Gray / Structural Bracket', baseColor: [0.27, 0.27, 0.27] },
    { id: 4, name: 'blinn6SG.001', type: 'Black Thermal Radiator / High Emissivity Coating', baseColor: [0.05, 0.05, 0.05] },
    { id: 5, name: 'initialShadingGr.001', type: 'Medium Gray Neutral Structural Material', baseColor: [0.50, 0.50, 0.50] },
    { id: 6, name: 'blinn9SG.001', type: 'Copper / Inconel Heat Shielding', baseColor: [0.64, 0.32, 0.02] },
    { id: 7, name: 'blinn3SG.001', type: 'Machined Aluminum / Piping', baseColor: [0.68, 0.68, 0.68] },
    { id: 8, name: 'blinn7SG.002', type: 'White Thermal Insulation Blanket', baseColor: [1.0, 1.0, 1.0] },
    { id: 9, name: 'blinn8SG.001', type: 'White Exterior Cladding', baseColor: [1.0, 1.0, 1.0] },
    { id: 10, name: 'blinn12SG.001', type: 'White Antenna/Sensor Bracket', baseColor: [1.0, 1.0, 1.0] },
    { id: 11, name: 'blinn10SG.001', type: 'Pale Yellow / Tan Propellant Tank Casing', baseColor: [0.94, 0.94, 0.56] }
  ]
};

export const BREAKDOWN_LIMITATION_STATEMENT = {
  title: 'Mechanical Breakdown Model Limitations & Methodology',
  summary: 'Illustrative visual breakdown of verified visible surface assemblies.',
  explanation: [
    'The 3D model asset contains 134 unlabelled polygonal mesh nodes (Maya/Blender generated names such as "group13 10", "group31 g1", "polySurfa1").',
    'Internal mechanical components (such as cabin controls, environmental control life support systems, descent engine gimbal actuators, combustion chamber injectors, and avionics bays) are NOT present in the geometry.',
    'Technical functions must not be claimed from polygonal exterior geometry alone. This interactive breakdown separates only verified visible exterior assemblies along logical axes to demonstrate overall vehicle architecture.',
    'All component groupings represent exterior structural modules observable on the 3D surface, rather than certified engineering schematics.'
  ]
};

/**
 * Verified visible structural assemblies
 */
export const COMPONENT_ASSEMBLIES = [
  {
    id: 'ascent_cabin',
    name: 'Ascent Stage - Crew Compartment & Shell',
    shortName: 'Ascent Stage',
    badge: 'Stage Separation',
    description: 'Pressurized crew cabin, midsection equipment bay, and exterior thermal micrometeoroid shielding.',
    visibleGeometry: 'Upper faceted polygonal cabin structure, front face triangular forward-looking windows, and upper structural bulkheads.',
    verificationStatus: 'Visible Exterior Assembly (Internal cabin controls/avionics NOT modeled)',
    nodePrefixes: ['polySurfac', 'pCube2', 'pCube27', 'pCube28', 'pCube29'],
    breakdownOffset: [0, 4.2, 0], // Lifts straight up along Y axis
    step: 1
  },
  {
    id: 'antennas_docking',
    name: 'Upper Antennas & Docking Drogue Assembly',
    shortName: 'Antennas & Docking',
    badge: 'Upper Avionics',
    description: 'Overhead docking tunnel interface, steerable S-band high-gain antenna, and rendezvous radar dish assembly.',
    visibleGeometry: 'Overhead cylindrical docking tunnel collar, antenna mast, and steerable parabolic dish assembly.',
    verificationStatus: 'Visible Exterior Assembly',
    nodePrefixes: ['group51', 'group32', 'pCone7', 'pPipe1', 'pPipe2', 'polySurfa2', 'polySurfa3', 'polySurfa4'],
    breakdownOffset: [0, 7.6, 0], // Lifts high above cabin along Y axis
    step: 3
  },
  {
    id: 'egress_ladder',
    name: 'Forward Egress Platform, Hatch & Ladder Assembly',
    shortName: 'Egress Ladder & Porch',
    badge: 'EVA Interface',
    description: 'Forward extravehicular activity (EVA) egress ladder, exterior work porch/platform, and forward handrails.',
    visibleGeometry: 'Forward egress ladder, rectangular work porch, and tubular safety handrails.',
    verificationStatus: 'Visible Exterior Assembly',
    nodePrefixes: ['polySurfa1', 'pCube3', 'pCylinde11', 'pCylinder2'],
    breakdownOffset: [0, 1.5, 3.6], // Translates forward along +Z and slightly up
    step: 2
  },
  {
    id: 'rcs_thrusters',
    name: 'Reaction Control System (RCS) Quad Thruster Clusters',
    shortName: 'RCS Thruster Quads',
    badge: 'Attitude Control',
    description: 'Four external outrigger truss clusters containing hypergolic attitude control thruster nozzles (pitch, roll, yaw control).',
    visibleGeometry: 'Cruciform four-nozzle thruster clusters mounted on outrigger standoff tubular trusses in 4 quadrants.',
    verificationStatus: 'Visible Exterior Assembly',
    nodePrefixes: ['group73', 'group74', 'group75', 'pCylinder4', 'pCylinder5', 'pCylinder6', 'pCylinder7'],
    breakdownOffset: 'radial_outward_rcs', // Custom radial outward displacement
    step: 3
  },
  {
    id: 'spherical_tanks',
    name: 'Auxiliary Helium & Propellant Storage Tanks',
    shortName: 'Storage Tanks',
    badge: 'Consumables',
    description: 'Spherical pressure vessels for supercritical helium pressurization and hypergolic propellants (Aerozine 50 / N2O4).',
    visibleGeometry: 'Six spherical pressure vessels clustered in descent quadrant bays.',
    verificationStatus: 'Visible Exterior Tanks (Internal plumbing/valves NOT modeled)',
    nodePrefixes: ['pSphere'],
    breakdownOffset: 'radial_outward_tanks', // Custom radial outward displacement
    step: 4
  },
  {
    id: 'landing_gear',
    name: 'Descent Stage - Landing Gear, Struts & Footpads',
    shortName: 'Landing Gear & Footpads',
    badge: 'Surface Interface',
    description: 'Four deployable landing gear legs consisting of primary compression struts with crushable honeycomb shock absorbers, secondary A-frame struts, and inverted dish footpads.',
    visibleGeometry: 'Four primary cantilevered struts, dual secondary V-struts per leg, and four circular landing pads.',
    verificationStatus: 'Visible Exterior Assembly',
    nodePrefixes: ['group31', 'pCylinder3'],
    breakdownOffset: [0, -2.2, 0], // Deploys downward and expands radially
    step: 2
  },
  {
    id: 'structural_struts',
    name: 'Inter-Stage Truss Members & Plumbing Conduits',
    shortName: 'Structural Struts',
    badge: 'Structure',
    description: 'Cylindrical structural tie rods, stage attachment struts, and external protective conduit runs.',
    visibleGeometry: 'Inter-stage structural tie rods and external conduit runs.',
    verificationStatus: 'Visible Exterior Assembly',
    nodePrefixes: ['pCylinder8', 'pCylinder9', 'pCylinde10'],
    breakdownOffset: 'radial_struts',
    step: 3
  },
  {
    id: 'descent_stage',
    name: 'Descent Stage - Octagonal Chassis & Engine Skirt',
    shortName: 'Descent Stage Core',
    badge: 'Base Structure',
    description: 'Octagonal welded aluminum alloy descent stage chassis, thermal foil containment bays, and descent propulsion engine bell.',
    visibleGeometry: 'Central octagonal structure with gold/kapton thermal foil simulation and downward-facing descent engine nozzle.',
    verificationStatus: 'Visible Exterior Assembly (Foundation Anchor)',
    nodePrefixes: ['pCylinder1', 'group13', 'pPlane'],
    breakdownOffset: [0, 0, 0], // Anchor base: stays at origin
    step: 0
  }
];

export const BREAKDOWN_STEPS = [
  { step: 0, progress: 0.0, label: 'Fully Assembled', description: 'All 134 structural components resting in operational flight/landing configuration.' },
  { step: 1, progress: 0.25, label: 'Stage Separation', description: 'Ascent Stage separates vertically from the Descent Stage anchor structure along +Y.' },
  { step: 2, progress: 0.50, label: 'Landing Gear & Hatch Separation', description: 'Landing gear deploys downward while forward EVA egress platform shifts forward.' },
  { step: 3, progress: 0.75, label: 'RCS Quads & Upper Antennas', description: 'Attitude control thrusters displace laterally; overhead docking and radar dish lift upward.' },
  { step: 4, progress: 1.0, label: 'Full Exploded Inspection', description: 'Spherical propellant/helium tanks expand radially outward; all 7 visible assemblies isolated for inspection.' }
];

/**
 * Object Information Panel data with strict placeholder marking
 */
export const OBJECT_INFORMATION = {
  exhibitName: 'Apollo Lunar Module (LM) Flight Equipment',
  curatorialClassification: 'Abandoned Extraterrestrial Equipment / Lunar Surface Artifact',
  
  // Fields requiring NASA primary source verification
  verifiedFields: [
    {
      label: 'Model Geometry Span',
      value: '6.43 m × 5.01 m × 6.43 m',
      verified: true,
      source: 'Extracted from GLTF accessor bounds'
    },
    {
      label: 'Mesh Node Count',
      value: '134 individual mesh nodes',
      verified: true,
      source: 'Extracted from glTF 2.0 scene graph'
    },
    {
      label: 'Asset File Checksum',
      value: 'SHA-256: 379101df...5c4e',
      verified: true,
      source: 'Preserved local repository asset'
    }
  ],

  placeholderFields: [
    {
      id: 'mission_assignment',
      label: 'Specific Mission Assignment',
      value: '[NASA Source Verification Required]',
      candidateOptions: 'LM-5 (Apollo 11 "Eagle"), LM-6 (Apollo 12 "Intrepid"), LM-8 (Apollo 14 "Antares"), LM-10 (Apollo 15 "Falcon"), LM-11 (Apollo 16 "Orion"), LM-12 (Apollo 17 "Challenger")',
      status: 'UNVERIFIED',
      verificationGuide: 'Inspect markings or identify distinguishing flight-specific equipment fits (e.g. Lunar Roving Vehicle deployment pallet on LM-10 through LM-12 vs early J-series vs H-series).'
    },
    {
      id: 'landing_coordinates',
      label: 'Lunar Surface Coordinates',
      value: '[NASA Source Verification Required]',
      candidateOptions: 'e.g. Mare Tranquillitatis 0.67408° N, 23.47297° E (Apollo 11); Oceanus Procellarum 3.01239° S, 23.42157° W (Apollo 12); Taurus-Littrow 20.19080° N, 30.77168° E (Apollo 17)',
      status: 'UNVERIFIED',
      verificationGuide: 'Requires matching the specific vehicle serial or mission assignment before entering planetary coordinates.'
    },
    {
      id: 'touchdown_date',
      label: 'Touchdown & Abandonment Epoch',
      value: '[NASA Source Verification Required]',
      candidateOptions: 'Apollo mission landing dates span July 20, 1969 to December 11, 1972',
      status: 'UNVERIFIED',
      verificationGuide: 'Verify specific landing mission timeline in the Apollo Flight Journal or mission transcripts.'
    },
    {
      id: 'operational_status',
      label: 'Operational & Site Status',
      value: '[NASA Source Verification Required]',
      candidateOptions: 'Descent stage: In situ lunar artifact (intact). Ascent stage: Deliberately impacted on lunar surface (Apollo 12, 14, 15, 17) or lunar/solar orbit (Apollo 10, 11).',
      status: 'UNVERIFIED',
      verificationGuide: 'Verify stage disposition records in NASA SP-4029 / Apollo By The Numbers.'
    },
    {
      id: 'dry_launch_mass',
      label: 'Operational Mass Specs',
      value: '[NASA Source Verification Required]',
      candidateOptions: 'Ascent stage dry mass ~2,150 kg; Descent stage dry mass ~2,030 kg; Total fueled landing mass ~15,100 kg to ~16,400 kg (varies per mission)',
      status: 'UNVERIFIED',
      verificationGuide: 'Consult Grumman Lunar Module Operations Manual (LMA790-3-LM2) Table 1-1.'
    }
  ],

  primarySourcesReference: [
    {
      title: 'Apollo Lunar Module Operations Manual (LMA790-3-LM2)',
      publisher: 'Grumman Aerospace Corporation / NASA Manned Spacecraft Center',
      url: 'https://www.hq.nasa.gov/alsj/LM04_Lunar_Module_pp1-24.pdf',
      citationType: 'Flight & Technical Systems Manual'
    },
    {
      title: 'Apollo Lunar Surface Journal (ALSJ)',
      publisher: 'NASA History Division',
      url: 'https://www.hq.nasa.gov/alsj/',
      citationType: 'Mission Transcripts & Lunar Photographic Evidence'
    },
    {
      title: 'Apollo By The Numbers: A Statistical Reference (NASA SP-4029)',
      author: 'Richard W. Orloff',
      publisher: 'NASA History Program Office',
      url: 'https://history.nasa.gov/SP-4029/SP-4029.htm',
      citationType: 'Chronology & Mass Properties Reference'
    }
  ]
};
