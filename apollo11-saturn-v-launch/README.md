# Apollo 11 — Saturn V Launch Sequence

A scroll-driven Three.js scene built with vanilla HTML, CSS, GSAP, and ScrollTrigger. A 110-second playback control drives the same scroll timeline, so scrolling, scrubbing, and playback share one mission state.

## Project structure

- `index.html` — Mission HUD, countdown, playback and inspection controls, information card, and static no-WebGL scene.
- `css/styles.css` — Responsive telemetry, cinematic control panel, and fallback-scene styling.
- `js/timeline.js` — Reversible scroll timeline for launch, staging, parking orbit, TLI, spacecraft maneuvers, and lunar coast.
- `js/saturnV.js` — Saturn V GLB loader, low-cost whole-stack rendering, clipped stage reconstructions for separation, animated layered exhaust, and procedural fallback.
- `js/environment.js` — Open exhaust-path launch platform, deterministic textured smoke particles, Earth, stars, and Moon.
- `js/main.js` — Three.js renderer, HUD updates, camera shots, and render loop.
- `assets/saturn_v.glb` — Rocket model used by the scene.

## Model and reconstruction notes

The supplied GLB has 22 mesh nodes with generic names and 23 zero-duration animation entries (each has a single key at time zero), but no stage labels or usable motion clips. The scene divides the model into visible S-IC, S-II, S-IVB, and upper-spacecraft sections with Three.js clipping planes. Those stage groups can separate, highlight, and drift independently, but they are a geometric reconstruction rather than authored, engineering-accurate stage meshes. The model does not provide separately selectable Instrument Unit, Command Module, Service Module, or Lunar Module meshes, nor animated SLA panels; spacecraft transposition and extraction are represented as a simplified maneuver.

## Mission timing

The sequence follows Apollo 11 mission elapsed time. The S-IC/S-II handoff occurs near T+2:42, first S-IVB cutoff near T+11:39, parking-orbit insertion near T+11:49, and the second S-IVB ignition near T+2:44:16. Spacecraft separation, docking, and ejection follow in that order. Camera scale is illustrative; no interpolated altitude or velocity is presented as mission telemetry.

## Run locally

Use Python's local server (or double-click `START-APOLLO.bat` on Windows), then visit `http://localhost:8080`:

```bash
python -m http.server 8080
```

Scroll down to advance and scroll up to reverse the mission sequence. The control panel also supports play/pause, replay, reset, event stepping, scrubbing, speed selection, camera modes, stage highlighting/inspection, and an opt-in synthesized launch rumble. Drag the scene in Inspect mode to orbit the selected section. Reduced-motion settings remove camera shake and scrub easing; rendering pauses when the tab is hidden. Sound is generated locally and is not mission audio. The scene uses CDN-hosted Three.js and GSAP, so the interactive version needs an internet connection. Without WebGL 2, it shows a static mission overview.
