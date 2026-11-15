import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createInitialMissionState, initLaunchTimeline, MISSION_MARKERS } from './timeline.js';
import { createSaturnVRocket } from './saturnV.js';
import { APOLLO_SUN_DIRECTION, createLaunchPad39A, createExhaustSmoke, createAtmosphereAndSpace } from './environment.js';

// DOM Elements
const canvas = document.getElementById('launch-canvas');
const scrollRunway = document.getElementById('scroll-runway');
const loaderOverlay = document.getElementById('loader-overlay');
const loaderBarFill = document.getElementById('loader-bar-fill');
const loaderStatus = document.getElementById('loader-status');

const hudMet = document.getElementById('hud-met');
const hudStage = document.getElementById('hud-stage');
const hudPhaseLabel = document.getElementById('hud-phase-label');
const hudProgressFill = document.getElementById('hud-progress-fill');
const hudScrollHint = document.getElementById('hud-scroll-hint');
const hudCountdown = document.getElementById('hud-countdown');
const hudNoteEyebrow = document.getElementById('hud-note-eyebrow');
const hudNoteTitle = document.getElementById('hud-note-title');
const hudNoteBody = document.getElementById('hud-note-body');
const playToggle = document.getElementById('play-toggle');
const restartMission = document.getElementById('restart-mission');
const previousEvent = document.getElementById('previous-event');
const nextEvent = document.getElementById('next-event');
const missionScrubber = document.getElementById('mission-scrubber');
const cameraModeSelect = document.getElementById('camera-mode');
const componentSelect = document.getElementById('component-select');
const playbackSpeedSelect = document.getElementById('playback-speed');
const infoToggle = document.getElementById('info-toggle');
const soundToggle = document.getElementById('sound-toggle');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function formatMET(totalSeconds) {
  const sign = totalSeconds < 0 ? '-' : '+';
  const abs = Math.abs(Math.floor(totalSeconds));
  const hrs = String(Math.floor(abs / 3600)).padStart(2, '0');
  const mins = String(Math.floor((abs % 3600) / 60)).padStart(2, '0');
  const secs = String(abs % 60).padStart(2, '0');
  return `T${sign}${hrs}:${mins}:${secs}`;
}

function updateHUD(state) {
  hudMet.textContent = formatMET(state.metSeconds);
  hudStage.textContent = state.activeStage;
  hudPhaseLabel.textContent = state.phaseLabel;
  hudProgressFill.style.height = `${(state.progress * 100).toFixed(1)}%`;
  missionScrubber.value = String(Math.round(state.progress * 1000));
  hudScrollHint.style.opacity = state.progress > 0.03 ? '0' : '1';
  hudNoteEyebrow.textContent = state.annotationEyebrow;
  hudNoteTitle.textContent = state.annotationTitle;
  hudNoteBody.textContent = state.annotationBody;

  const showCountdown = state.metSeconds < 0 && state.metSeconds >= -10 && state.progress >= MISSION_MARKERS.establishingEnd;
  hudCountdown.hidden = !showCountdown;
  if (showCountdown) {
    hudCountdown.textContent = `T−${String(Math.ceil(-state.metSeconds)).padStart(2, '0')}`;
  }
}

// Renderer Setup (Optimized for 16GB RAM / Integrated Graphics)
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.localClippingEnabled = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

// Scene & Camera Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color('#020308');
scene.fog = new THREE.FogExp2('#77776e', 0.00055);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.5, 5000);
camera.position.set(95, 42, 135);

// Lighting
const hemiLight = new THREE.HemisphereLight('#9eb4c7', '#302b28', 0.42);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight('#ffd1a0', 3.2);
sunLight.position.copy(APOLLO_SUN_DIRECTION).multiplyScalar(360);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.camera.left = -180;
sunLight.shadow.camera.right = 180;
sunLight.shadow.camera.top = 190;
sunLight.shadow.camera.bottom = -150;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 700;
sunLight.shadow.bias = -0.00025;
sunLight.shadow.normalBias = 0.025;
sunLight.shadow.radius = 3;
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight('#9bb8dc', 0.38);
fillLight.position.copy(APOLLO_SUN_DIRECTION).multiplyScalar(-180).add(new THREE.Vector3(0, 70, 0));
scene.add(fillLight);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.38, 0.28, 0.88);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// Mission State & Timeline
const missionState = createInitialMissionState();
const missionTimeline = initLaunchTimeline(scrollRunway, missionState, updateHUD);

// Build 3D Subsystems
const atmosphereSystem = createAtmosphereAndSpace(scene, camera);
const padSystem = createLaunchPad39A(scene);
const smokeSystem = createExhaustSmoke(scene, camera);
const rocketSystem = createSaturnVRocket(
  scene,
  './assets/saturn_v.glb',
  (pct) => {
    loaderBarFill.style.width = `${pct.toFixed(0)}%`;
  },
  (loadedRealGlb) => {
    loaderBarFill.style.width = '100%';
    loaderStatus.textContent = loadedRealGlb
      ? 'SATURN V MODEL LOADED — STAGE CUTS ACTIVE'
      : 'USING SIMPLIFIED PROCEDURAL SATURN V MODEL';
    setTimeout(() => loaderOverlay.classList.add('hidden'), 450);
  }
);

const MISSION_DURATION_MS = 110_000;
const MISSION_EVENT_PROGRESS = [
  0,
  MISSION_MARKERS.establishingEnd,
  MISSION_MARKERS.ignitionEnd,
  MISSION_MARKERS.liftoff,
  MISSION_MARKERS.sicCutoff,
  MISSION_MARKERS.siiIgnition,
  MISSION_MARKERS.siiAscent,
  MISSION_MARKERS.siiCutoff,
  MISSION_MARKERS.sivbIgnition,
  MISSION_MARKERS.orbitInsertion,
  MISSION_MARKERS.parkingOrbitInsertion,
  MISSION_MARKERS.tliIgnition,
  MISSION_MARKERS.spacecraftSeparation,
  MISSION_MARKERS.docking,
  MISSION_MARKERS.spacecraftEjection,
  MISSION_MARKERS.lunarCoast,
  MISSION_MARKERS.missionEnd,
];
let isPlaying = false;
let playbackSpeed = 1;
let lastPlaybackFrame = 0;

function setMissionProgress(progress) {
  const safeProgress = THREE.MathUtils.clamp(progress, 0, 1);
  const trigger = missionTimeline.scrollTrigger;
  if (!trigger) return;
  const scrollPosition = trigger.start + (trigger.end - trigger.start) * safeProgress;
  window.scrollTo(0, scrollPosition);
  window.ScrollTrigger.update();
}

function stopPlayback() {
  isPlaying = false;
  lastPlaybackFrame = 0;
  playToggle.textContent = 'PLAY';
  playToggle.setAttribute('aria-label', 'Play mission');
}

function playMissionFromCurrentPosition() {
  if (missionState.progress >= 0.999) setMissionProgress(0);
  isPlaying = true;
  lastPlaybackFrame = 0;
  playToggle.textContent = 'PAUSE';
  playToggle.setAttribute('aria-label', 'Pause mission');
  requestAnimationFrame(playMissionFrame);
}

function playMissionFrame(now) {
  if (!isPlaying) return;
  if (!lastPlaybackFrame) lastPlaybackFrame = now;
  const elapsed = now - lastPlaybackFrame;
  lastPlaybackFrame = now;
  const nextProgress = missionState.progress + (elapsed * playbackSpeed) / MISSION_DURATION_MS;
  setMissionProgress(nextProgress);
  if (nextProgress >= 1) stopPlayback();
  else requestAnimationFrame(playMissionFrame);
}

function goToMissionEvent(direction) {
  stopPlayback();
  const progress = missionState.progress;
  const event = direction > 0
    ? MISSION_EVENT_PROGRESS.find((point) => point > progress + 0.004)
    : [...MISSION_EVENT_PROGRESS].reverse().find((point) => point < progress - 0.004);
  if (event !== undefined) setMissionProgress(event);
}

let audioContext = null;
let audioGain = null;
let audioFilter = null;
let audioSource = null;
let soundEnabled = false;

function ensureMissionAudio() {
  if (audioContext) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error('Web Audio is unavailable');
  audioContext = new AudioContextClass();
  audioFilter = audioContext.createBiquadFilter();
  audioFilter.type = 'lowpass';
  audioFilter.frequency.value = 150;
  audioGain = audioContext.createGain();
  audioGain.gain.value = 0;
  audioFilter.connect(audioGain);
  audioGain.connect(audioContext.destination);

  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i++) channel[i] = (Math.random() * 2 - 1) * 0.55;
  audioSource = audioContext.createBufferSource();
  audioSource.buffer = buffer;
  audioSource.loop = true;
  audioSource.connect(audioFilter);
  audioSource.start();
}

playToggle.addEventListener('click', () => {
  if (isPlaying) stopPlayback();
  else playMissionFromCurrentPosition();
});
document.getElementById('replay-mission').addEventListener('click', () => {
  stopPlayback();
  setMissionProgress(0);
  playMissionFromCurrentPosition();
});
restartMission.addEventListener('click', () => {
  stopPlayback();
  setMissionProgress(0);
});
previousEvent.addEventListener('click', () => goToMissionEvent(-1));
nextEvent.addEventListener('click', () => goToMissionEvent(1));
missionScrubber.addEventListener('input', () => {
  stopPlayback();
  setMissionProgress(Number(missionScrubber.value) / 1000);
});
playbackSpeedSelect.addEventListener('change', () => {
  playbackSpeed = Number(playbackSpeedSelect.value);
});
cameraModeSelect.addEventListener('change', () => {
  cameraMode = cameraModeSelect.value;
  canvas.style.touchAction = cameraMode === 'inspect' ? 'none' : 'pan-y';
});
infoToggle.addEventListener('click', () => {
  const visible = infoToggle.getAttribute('aria-pressed') !== 'true';
  infoToggle.setAttribute('aria-pressed', String(visible));
  document.querySelector('.mission-card').hidden = !visible;
});
soundToggle.addEventListener('click', async () => {
  try {
    ensureMissionAudio();
    soundEnabled = !soundEnabled;
    if (soundEnabled) await audioContext.resume();
    else await audioContext.suspend();
    soundToggle.textContent = soundEnabled ? 'SOUND ON' : 'SOUND OFF';
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
  } catch (_) {
    soundToggle.textContent = 'AUDIO UNAVAILABLE';
  }
});

const componentInformation = {
  sic: ['STAGE 01 · S-IC', 'S-IC · First stage', 'Provides the initial thrust for liftoff and the first part of ascent.'],
  sii: ['STAGE 02 · S-II', 'S-II · Second stage', 'Continues ascent after the S-IC has completed its role.'],
  sivb: ['STAGE 03 · S-IVB', 'S-IVB · Third stage', 'Completes the climb to orbit and restarts for translunar injection.'],
  csm: ['SPACECRAFT STACK', 'Apollo upper spacecraft', 'This supplied model does not separate the Command, Service, and Lunar Modules into individually selectable meshes.'],
};
componentSelect.addEventListener('change', () => {
  stopPlayback();
  selectedComponent = componentSelect.value;
  rocketSystem.highlightStage(selectedComponent || null);
  if (selectedComponent) {
    cameraMode = 'inspect';
    cameraModeSelect.value = 'inspect';
    canvas.style.touchAction = 'none';
    [missionState.annotationEyebrow, missionState.annotationTitle, missionState.annotationBody] = componentInformation[selectedComponent];
    updateHUD(missionState);
  } else {
    cameraMode = cameraModeSelect.value === 'inspect' ? 'cinematic' : cameraModeSelect.value;
    cameraModeSelect.value = cameraMode;
    canvas.style.touchAction = 'pan-y';
  }
});

let pointerDown = false;
let pointerInspectMode = false;
let pointerX = 0;
let pointerY = 0;
canvas.addEventListener('pointerdown', (event) => {
  if (cameraMode !== 'inspect' && missionState.progress >= MISSION_MARKERS.establishingEnd) return;
  pointerDown = true;
  pointerInspectMode = cameraMode === 'inspect';
  pointerX = event.clientX;
  pointerY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (!pointerDown) return;
  const deltaX = event.clientX - pointerX;
  const deltaY = event.clientY - pointerY;
  if (pointerInspectMode) {
    inspectionYaw += deltaX * 0.006;
    inspectionPitch = THREE.MathUtils.clamp(inspectionPitch + deltaY * 0.004, -0.45, 0.55);
  } else {
    padOrbitYaw = THREE.MathUtils.clamp(padOrbitYaw + deltaX * 0.003, -0.38, 0.38);
    padOrbitPitch = THREE.MathUtils.clamp(padOrbitPitch + deltaY * 0.12, -16, 16);
  }
  pointerX = event.clientX;
  pointerY = event.clientY;
});
canvas.addEventListener('pointerup', () => { pointerDown = false; pointerInspectMode = false; });
canvas.addEventListener('pointercancel', () => { pointerDown = false; pointerInspectMode = false; });

window.addEventListener('wheel', stopPlayback, { passive: true });
window.addEventListener('touchstart', stopPlayback, { passive: true });

// Camera Director
const targetPos = new THREE.Vector3();
const lookAtPos = new THREE.Vector3();
let cameraMode = 'cinematic';
let selectedComponent = '';
let inspectionYaw = 0.25;
let inspectionPitch = 0.08;
let padOrbitYaw = 0;
let padOrbitPitch = 0;

function updateCamera(state) {
  const p = state.progress;

  if (p < MISSION_MARKERS.establishingEnd) {
    const k = p / MISSION_MARKERS.establishingEnd;
    targetPos.set(
      THREE.MathUtils.lerp(148, 86, k),
      THREE.MathUtils.lerp(56, 32, k),
      THREE.MathUtils.lerp(235, 128, k)
    );
    lookAtPos.set(0, THREE.MathUtils.lerp(56, 48, k), 0);
  } else if (p < MISSION_MARKERS.engineCloseupEnd) {
    const k = (p - MISSION_MARKERS.establishingEnd) / (MISSION_MARKERS.engineCloseupEnd - MISSION_MARKERS.establishingEnd);
    targetPos.set(
      THREE.MathUtils.lerp(86, 24, k),
      THREE.MathUtils.lerp(32, 12, k),
      THREE.MathUtils.lerp(128, 70, k)
    );
    lookAtPos.set(0, THREE.MathUtils.lerp(48, 4, k), 0);
  } else if (p < MISSION_MARKERS.ignitionEnd) {
    const k = (p - MISSION_MARKERS.engineCloseupEnd) / (MISSION_MARKERS.ignitionEnd - MISSION_MARKERS.engineCloseupEnd);
    targetPos.set(
      THREE.MathUtils.lerp(24, 100, k),
      THREE.MathUtils.lerp(12, 64, k),
      THREE.MathUtils.lerp(70, 180, k)
    );
    lookAtPos.set(0, THREE.MathUtils.lerp(4, 54, k), 0);
  } else if (p < MISSION_MARKERS.liftoff) {
    targetPos.set(100, 64, 180);
    lookAtPos.set(0, 54, 0);
  } else if (p < MISSION_MARKERS.sicCutoff) {
    const k = (p - MISSION_MARKERS.liftoff) / (MISSION_MARKERS.sicCutoff - MISSION_MARKERS.liftoff);
    targetPos.set(
      THREE.MathUtils.lerp(100, 112, k),
      state.rocketY + THREE.MathUtils.lerp(64, 78, k),
      THREE.MathUtils.lerp(175, 190, k)
    );
    lookAtPos.set(0, state.rocketY + 48, 0);
  } else if (p < MISSION_MARKERS.siiAscent) {
    // Pull wide and hold both the S-IC and the continuing upper vehicle.
    targetPos.set(148, state.rocketY + 58, 240);
    lookAtPos.set(0, state.rocketY + 36, 0);
  } else if (p < MISSION_MARKERS.siiCutoff) {
    const k = (p - MISSION_MARKERS.siiAscent) / (MISSION_MARKERS.siiCutoff - MISSION_MARKERS.siiAscent);
    targetPos.set(
      THREE.MathUtils.lerp(98, 82, k),
      state.rocketY + 76,
      THREE.MathUtils.lerp(190, 160, k)
    );
    lookAtPos.set(12, state.rocketY + 55, 0);
  } else if (p < MISSION_MARKERS.sivbIgnition) {
    targetPos.set(160, state.rocketY + 58, 250);
    lookAtPos.set(0, state.rocketY + 34, 0);
  } else if (p < MISSION_MARKERS.orbitInsertion) {
    const k = (p - MISSION_MARKERS.sivbIgnition) / (MISSION_MARKERS.orbitInsertion - MISSION_MARKERS.sivbIgnition);
    targetPos.set(
      THREE.MathUtils.lerp(92, 72, k),
      state.rocketY + THREE.MathUtils.lerp(82, 102, k),
      THREE.MathUtils.lerp(170, 140, k)
    );
    lookAtPos.set(0, state.rocketY + 78, 0);
  } else if (p < MISSION_MARKERS.spacecraftSeparation) {
    const k = (p - MISSION_MARKERS.orbitInsertion) / (MISSION_MARKERS.spacecraftSeparation - MISSION_MARKERS.orbitInsertion);
    const orbitAngle = k * Math.PI * 0.28;
    targetPos.set(92 + 26 * Math.sin(orbitAngle), state.rocketY + 98, 170 * Math.cos(orbitAngle));
    lookAtPos.set(0, state.rocketY + 80, 0);
  } else if (p < MISSION_MARKERS.lunarCoast) {
    const k = (p - MISSION_MARKERS.spacecraftSeparation) / (MISSION_MARKERS.lunarCoast - MISSION_MARKERS.spacecraftSeparation);
    targetPos.set(THREE.MathUtils.lerp(74, 54, k), state.rocketY + 92, THREE.MathUtils.lerp(125, 96, k));
    lookAtPos.set(0, state.rocketY + 96, 0);
  } else {
    const k = (p - MISSION_MARKERS.lunarCoast) / (MISSION_MARKERS.missionEnd - MISSION_MARKERS.lunarCoast);
    targetPos.set(
      THREE.MathUtils.lerp(54, 80, k),
      state.rocketY + THREE.MathUtils.lerp(92, 120, k),
      THREE.MathUtils.lerp(96, 200, k)
    );
    lookAtPos.set(100 * k, state.rocketY + 110, -120 * k);
  }

  if (cameraMode === 'inspect') {
    const focus = {
      sic: [18 + state.sicDropY, 0],
      sii: [56 + state.siiDropY, 0],
      sivb: [82, state.sivbDriftZ],
      csm: [101, state.csmTransposeZ],
    }[selectedComponent] || [58, 0];
    lookAtPos.set(0, state.rocketY + focus[0], focus[1]);
    const radius = 98;
    const pitch = THREE.MathUtils.clamp(inspectionPitch, -0.45, 0.55);
    targetPos.set(
      lookAtPos.x + Math.sin(inspectionYaw) * radius,
      lookAtPos.y + Math.sin(pitch) * radius,
      lookAtPos.z + Math.cos(inspectionYaw) * radius
    );
  } else if (cameraMode === 'follow' || cameraMode === 'wide') {
    const directionScale = cameraMode === 'wide' ? 1.48 : 0.82;
    targetPos.sub(lookAtPos).multiplyScalar(directionScale).add(lookAtPos);
  } else if (p < MISSION_MARKERS.establishingEnd && (padOrbitYaw !== 0 || padOrbitPitch !== 0)) {
    const dx = targetPos.x - lookAtPos.x;
    const dz = targetPos.z - lookAtPos.z;
    const cosYaw = Math.cos(padOrbitYaw);
    const sinYaw = Math.sin(padOrbitYaw);
    targetPos.x = lookAtPos.x + dx * cosYaw + dz * sinYaw;
    targetPos.z = lookAtPos.z - dx * sinYaw + dz * cosYaw;
    targetPos.y += padOrbitPitch;
  }

  const inIgnitionShot = p >= MISSION_MARKERS.ignitionStart && p <= MISSION_MARKERS.ignitionEnd;
  const wantedFov = cameraMode === 'wide' ? 48 : cameraMode === 'inspect' ? 38 : inIgnitionShot ? 40 : window.innerWidth < 720 ? 39 : 35;
  if (camera.fov !== wantedFov) {
    camera.fov = wantedFov;
    camera.updateProjectionMatrix();
  }

  const shakeAmp = prefersReducedMotion ? 0 : state.cameraShake * 0.45;
  const shakePhase = state.progress * 5830;
  const shakeX = Math.sin(shakePhase) * shakeAmp;
  const shakeY = Math.cos(shakePhase * 1.26) * shakeAmp;

  camera.position.set(targetPos.x + shakeX, targetPos.y + shakeY, targetPos.z);
  camera.lookAt(lookAtPos);
}

// Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Mark startup complete only after the renderer and mission systems are ready.
window.__apolloAppStarted = true;

// Animation Loop
const clock = new THREE.Clock();
let lastAudioUpdate = 0;
let animationFrameId = 0;
function animate() {
  animationFrameId = requestAnimationFrame(animate);
  if (document.hidden) return;
  const elapsedTime = clock.getElapsedTime();

  atmosphereSystem.update(missionState);
  padSystem.update(missionState);
  rocketSystem.update(missionState, elapsedTime);
  smokeSystem.update(missionState);
  updateCamera(missionState);

  if (audioContext && audioContext.state === 'running' && elapsedTime - lastAudioUpdate > 0.1) {
    const engine = Math.max(missionState.f1Thrust * 0.55, missionState.j2SiiThrust * 0.36, missionState.j2SivbThrust * 0.25);
    audioGain.gain.setTargetAtTime(soundEnabled ? 0.025 + engine * 0.12 : 0, audioContext.currentTime, 0.16);
    lastAudioUpdate = elapsedTime;
  }

  composer.render();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopPlayback();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
    clock.stop();
  } else if (!animationFrameId) {
    clock.start();
    animate();
  }
});

animate();
