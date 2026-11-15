export const MISSION_MARKERS = Object.freeze({
  establishingEnd: 0.12,
  ignitionStart: 0.13,
  engineCloseupEnd: 0.18,
  ignitionEnd: 0.21,
  liftoff: 0.25,
  sicCutoff: 0.39,
  sicSeparationRelease: 0.402,
  siiIgnition: 0.43,
  siiAscent: 0.45,
  siiCutoff: 0.56,
  siiSeparationRelease: 0.572,
  sivbIgnition: 0.62,
  orbitInsertion: 0.68,
  parkingOrbitInsertion: 0.69,
  tliIgnition: 0.76,
  spacecraftSeparation: 0.82,
  spacecraftTurnaround: 0.85,
  docking: 0.875,
  spacecraftEjection: 0.90,
  lunarCoast: 0.94,
  missionEnd: 1,
});

export function createInitialMissionState() {
  return {
    progress: 0,
    metSeconds: -15,
    phase: 'ESTABLISHING',
    phaseLabel: 'KENNEDY SPACE CENTER — LC-39A',
    activeStage: 'S-IC',
    annotationEyebrow: 'APOLLO 11 MISSION',
    annotationTitle: 'A quiet morning at the Cape',
    annotationBody: 'Saturn V stands ready on Pad 39A.',
    rocketY: 0,
    rocketPitch: 0,
    cameraShake: 0,
    sicDropY: 0,
    sicTumbleX: 0,
    siiDropY: 0,
    siiTumbleZ: 0,
    sivbDriftZ: 0,
    lesJettisonY: 0,
    slaPanelsOpen: 0,
    csmTransposeZ: 0,
    csmFlipPitch: 0,
    f1Thrust: 0,
    j2SiiThrust: 0,
    j2SivbThrust: 0,
    smokeDensity: 0,
    stagingFlash: 0,
    spaceTransition: 0,
    earthCurveProgress: 0,
    moonVisibility: 0,
  };
}

export function initLaunchTimeline(scrollTriggerElement, state, onHudUpdate) {
  gsap.registerPlugin(ScrollTrigger);
  const marker = MISSION_MARKERS;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lastHudEmit = 0;
  let lastPhase = '';
  let missionTimeline = null;

  const syncPhaseMetadata = () => {
    const p = missionTimeline ? missionTimeline.progress() : state.progress;
    state.progress = p;
    let phase;
    if (p < marker.establishingEnd) {
      phase = ['ESTABLISHING', 'KENNEDY SPACE CENTER — LC-39A', 'S-IC', 'APOLLO 11 MISSION', 'A quiet morning at the Cape', 'Saturn V stands ready on Pad 39A.'];
    } else if (p < marker.ignitionStart) {
      phase = ['COUNTDOWN', 'TERMINAL COUNT', 'S-IC', 'T-MINUS 10 SECONDS', 'The final countdown', 'Five F-1 engines prepare to ignite.'];
    } else if (p < marker.liftoff) {
      phase = ['IGNITION', 'F-1 ENGINE IGNITION', 'S-IC', 'IGNITION SEQUENCE', 'Five engines light', 'Flame and exhaust build beneath the restrained vehicle.'];
    } else if (p < marker.sicCutoff) {
      phase = ['LIFTOFF', 'LIFTOFF & PITCHOVER', 'S-IC', 'STAGE 01 · S-IC', 'Clearing the tower', 'The first stage carries the vehicle through the lower atmosphere.'];
    } else if (p < marker.siiAscent) {
      phase = ['S_IC_SEPARATION', 'S-IC / S-II SEPARATION', 'S-II', 'STAGE 01 · S-IC', 'First stage separation', 'The spent S-IC drops away as the upper vehicle continues.'];
    } else if (p < marker.siiCutoff) {
      phase = ['S_II_ASCENT', 'S-II SECOND-STAGE ASCENT', 'S-II', 'STAGE 02 · S-II', 'Second stage ascent', 'Five J-2 engines continue the climb; S-IC recedes below.'];
    } else if (p < marker.sivbIgnition) {
      phase = ['S_II_SEPARATION', 'S-II / S-IVB SEPARATION', 'S-IVB', 'STAGE 02 · S-II', 'Second stage separation', 'The S-II separates and the single-engine S-IVB takes over.'];
    } else if (p < marker.orbitInsertion) {
      phase = ['S_IVB_ASCENT', 'S-IVB ORBIT INSERTION', 'S-IVB', 'STAGE 03 · S-IVB', 'Third stage operation', 'The S-IVB completes the powered ascent to parking orbit.'];
    } else if (p < marker.tliIgnition) {
      phase = ['EARTH_ORBIT', 'EARTH PARKING ORBIT', 'S-IVB', 'EARTH ORBIT', 'A coast above Earth', 'The spacecraft coasts in orbit before the translunar burn.'];
    } else if (p < marker.spacecraftSeparation) {
      phase = ['TLI_BURN', 'TRANSLUNAR INJECTION', 'S-IVB', 'S-IVB SECOND BURN', 'Course set for the Moon', 'The S-IVB restarts to send Apollo onto its lunar trajectory.'];
    } else if (p < marker.docking) {
      phase = ['CSM_SEPARATION', 'SPACECRAFT TRANSPOSE & DOCK', 'CSM/LM', 'APOLLO SPACECRAFT', 'Turn, dock, and extract', 'A simplified view of the crewed spacecraft maneuver at the S-IVB.'];
    } else if (p < marker.lunarCoast) {
      phase = ['LM_EXTRACTION', 'SPACECRAFT DEPARTS THE S-IVB', 'CSM/LM', 'TRANSLUNAR JOURNEY', 'Leaving Earth orbit', 'The docked spacecraft continues while the launch stage falls behind.'];
    } else {
      phase = ['LUNAR_COAST', 'TRANSLUNAR COAST', 'CSM/LM', 'DESTINATION · THE MOON', 'Earth behind, Moon ahead', 'The spacecraft begins its long coast toward the lunar vicinity.'];
    }

    [state.phase, state.phaseLabel, state.activeStage, state.annotationEyebrow, state.annotationTitle, state.annotationBody] = phase;

    const now = performance.now();
    if (phase[0] !== lastPhase || now - lastHudEmit > 100 || p === 0 || p === 1) {
      lastPhase = phase[0];
      lastHudEmit = now;
      onHudUpdate(state);
    }
  };

  const tl = missionTimeline = gsap.timeline({
    defaults: { ease: 'none' },
    onUpdate: syncPhaseMetadata,
    scrollTrigger: {
      trigger: scrollTriggerElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: prefersReducedMotion ? true : 0.45,
    },
  });

  // A. Establishing shot ends at T-10.
  tl.to(state, { metSeconds: -10, smokeDensity: 0, duration: marker.establishingEnd }, 0)
    // B. Terminal count and staged F-1 ignition (about T-9). The rocket stays on the pad.
    .to(state, { metSeconds: 0, duration: marker.ignitionEnd - marker.establishingEnd }, marker.establishingEnd)
    .to(
      state,
      { f1Thrust: 1, smokeDensity: 1, cameraShake: 0.38, duration: marker.ignitionEnd - marker.ignitionStart },
      marker.ignitionStart
    )
    // C. Liftoff: a deliberate initial rise, then a smooth climb to S-IC cutoff.
    .to(
      state,
      {
        metSeconds: 161,
        rocketY: 140,
        rocketPitch: 0.32,
        cameraShake: 0.18,
        smokeDensity: 0.2,
        spaceTransition: 0.42,
        duration: marker.sicCutoff - marker.liftoff,
      },
      marker.liftoff
    )
    // D. Separation hold: S-IC drifts down and away while S-II continues.
    .to(state, { f1Thrust: 0, stagingFlash: 0.45, cameraShake: 0.55, duration: 0.012 }, marker.sicCutoff)
    .to(state, { stagingFlash: 0, duration: 0.028 }, marker.sicSeparationRelease)
    .to(state, { sicDropY: -24, sicTumbleX: 0.08, duration: marker.siiIgnition - marker.sicSeparationRelease }, marker.sicSeparationRelease)
    .to(state, { metSeconds: 162.3, duration: marker.siiIgnition - marker.sicCutoff }, marker.sicCutoff)
    .to(state, { j2SiiThrust: 1, lesJettisonY: 45, duration: 0.025 }, marker.siiIgnition)
    .to(
      state,
      {
        metSeconds: 549,
        rocketY: 300,
        rocketPitch: 0.72,
        sicDropY: -82,
        sicTumbleX: 0.22,
        spaceTransition: 0.9,
        earthCurveProgress: 0.65,
        cameraShake: 0.12,
        duration: marker.siiCutoff - marker.siiIgnition,
      },
      marker.siiIgnition
    )
    // E. Second stage cutoff and visible separation hold.
    .to(state, { j2SiiThrust: 0, stagingFlash: 0.4, duration: 0.012 }, marker.siiCutoff)
    .to(state, { stagingFlash: 0, siiDropY: -36, siiTumbleZ: 0.1, duration: marker.sivbIgnition - marker.siiSeparationRelease }, marker.siiSeparationRelease)
    .to(state, { metSeconds: 552, duration: marker.sivbIgnition - marker.siiCutoff }, marker.siiCutoff)
    .to(state, { j2SivbThrust: 1, duration: 0.02 }, marker.sivbIgnition)
    .to(
      state,
      {
        metSeconds: 699,
        rocketY: 390,
        rocketPitch: 0.95,
        sicDropY: -95,
        siiDropY: -72,
        siiTumbleZ: 0.18,
        spaceTransition: 1,
        earthCurveProgress: 1,
        duration: marker.orbitInsertion - marker.sivbIgnition,
      },
      marker.sivbIgnition
    )
    .to(state, { j2SivbThrust: 0, cameraShake: 0, duration: 0.012 }, marker.orbitInsertion)
    // F. Parking-orbit coast to the historically timed second S-IVB ignition.
    .to(state, { metSeconds: 709, duration: marker.parkingOrbitInsertion - marker.orbitInsertion }, marker.orbitInsertion)
    .to(state, { sicDropY: -120, siiDropY: -108, duration: marker.tliIgnition - marker.orbitInsertion }, marker.orbitInsertion)
    .to(state, { metSeconds: 9856, duration: marker.tliIgnition - marker.parkingOrbitInsertion }, marker.parkingOrbitInsertion)
    // G. Apollo 11 TLI burn lasts about 5 min 47 sec.
    .to(state, { j2SivbThrust: 1, duration: marker.spacecraftSeparation - marker.tliIgnition }, marker.tliIgnition)
    .to(state, { metSeconds: 10203, j2SivbThrust: 0, duration: marker.spacecraftSeparation - marker.tliIgnition }, marker.tliIgnition)
    // H. Transpose/dock/extract beats follow the burn in mission order.
    .to(state, { metSeconds: 11824, csmTransposeZ: 14, slaPanelsOpen: 1, duration: marker.spacecraftTurnaround - marker.spacecraftSeparation }, marker.spacecraftSeparation)
    .to(state, { csmFlipPitch: Math.PI, duration: marker.docking - marker.spacecraftTurnaround }, marker.spacecraftTurnaround)
    .to(state, { metSeconds: 12540, csmTransposeZ: 4.2, duration: 0.025 }, marker.docking)
    .to(state, { metSeconds: 15420, csmTransposeZ: 24, sivbDriftZ: -50, duration: marker.lunarCoast - marker.spacecraftEjection }, marker.spacecraftEjection)
    // I. Translunar coast: Earth recedes and the Moon enters view.
    .to(
      state,
      {
        metSeconds: 17280,
        moonVisibility: 1,
        duration: marker.missionEnd - marker.lunarCoast,
      },
      marker.lunarCoast
    );

  syncPhaseMetadata();
  return tl;
}
