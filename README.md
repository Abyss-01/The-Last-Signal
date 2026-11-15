# The Last Signal — Abandoned, Not Forgotten

An interactive, cinematic **space-archaeology** experience documenting human-made equipment left on the Moon. Built for the **NASA International Space Apps Challenge 2026** by team **Quark Babies**.

> **"Every mission leaves something behind. But not everything left behind is forgotten."**

---

## Experience Highlights

* **Unified Scrolling Journey & Seamless Infinite Loop**: A continuous, high-performance narrative that flows from a 1969 archival broadsheet into an Awwwards/Igloo.inc-caliber 3D WebGL space voyage, ending with an orbital Earthrise that loops seamlessly back to July 16, 1969.
* **Match-Cut Broadsheet Hero Zoom**: The front page features an archival framed photograph of the 363-foot Saturn V rocket on Launch Complex 39A. As you scroll, the newspaper dissolves and the photo zooms in to seamlessly transition into the real-time 3D rocket standing on the launch pad.
* **Integrated Saturn V Launch & Screen-Filling Dust Transition**: 
  * Powered by genuine NASA Saturn V 3D geometry split non-destructively across 4 stages with clipping planes.
  * Real-time turbulent F-1 flame plumes and F-1/J-2 engine ignition.
  * As liftoff occurs, massive billowing smoke and pad dust engulf the viewport, creating a cinematic transition as the rocket cuts through the upper atmosphere into deep cosmic space.
  * Multi-stage physical separation: S-IC drops away tumbling into the Atlantic; S-II ignites and separates; S-IVB performs Translunar Injection (TLI).
* **Relativistic Wormhole / Crater Warp Tunnel**:
  * As the spacecraft arrives at the Moon, the camera accelerates towards a lunar crater, plunging through a hypnotic warp tunnel of relativistic star streaks and event-horizon ring pulses to arrive at Tranquility Base.
* **Eagle Lunar Module Mechanical Breakdown & Exploded View**:
  * Based on verified structural node classification: Ascent Stage Crew Cabin ($+Y$), Steerable S-band Antenna & Docking Drogue ($+Y$), Egress Platform & 9-Rung Ladder ($+Z$), RCS Attitude Thrusters (4 diagonal quadrants), Propellant Tanks, Landing Gear & Footpads ($-Y$), and Descent Stage Base ($0,0,0$).
  * Dynamic 3D screen-space telemetry labels, assembly specifications, and interactive camera perspective presets.
* **Lunar Surface Archaeology**:
  * Explore the **Eagle Descent Stage**, the operational **Laser Ranging Retroreflector (LRRR)** still returning laser pulses to Earth, the **Passive Seismic Experiment (PSE)**, and Apollo 15's **Lunar Roving Vehicle (LRV-1)**.
* **Strict Scientific Curatorial Policy**:
  * No fabricated specifications or coordinates. Flight-discarded launch hardware is clearly distinguished from surface artifacts.

---

## Tech Stack

* **Frontend Framework:** React 19.3.1 + TypeScript (strict) + Vite 8.3.6
* **3D Engine:** Three.js 0.187.0 + @react-three/fiber + @react-three/drei
* **Smooth Motion & Orchestration:** Lenis (smooth inertia scrolling) + GSAP 3.15.1 (ScrollTrigger)
* **Audio Synthesis:** Zero-asset procedural Web Audio engine (`SoundEngine.ts`) with physical space constraints + Web Speech API narration
* **Styling & Design System:** Tailwind CSS v4 (`@tailwindcss/vite`) + 1969 Archival Typography (`editorial.css`)
* **Code Quality & Linting:** Oxlint

---

## Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or later (Node v24.22.3 LTS recommended)
* **npm**: v9.0.0 or later

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production (TypeScript check + Vite production bundle)
npm run build

# 4. Preview production build locally
npm run preview
```

Open [http://localhost:5174](http://localhost:5174) in any modern WebGL-compatible browser.

---

## Verified Lunar Artifacts Registry

| Catalog ID | Object | Mission | Disposition | Science Status |
| :--- | :--- | :--- | :--- | :--- |
| **OBJ-01** | Lunar Module Eagle Descent Stage | Apollo 11 (1969) | Tranquility Base (0.67416° N, 23.47314° E) | Permanent site datum |
| **OBJ-02** | Lunar Laser Ranging Retroreflector (LRRR) | Apollo 11 (1969) | ~15 m from LM descent stage | **Active / Operational** — millimeter ranging |
| **OBJ-03** | Passive Seismic Experiment (PSE) | Apollo 11 (1969) | ~17 m south of LM descent stage | Terminated 27 Aug 1969 |
| **OBJ-04** | Lunar Roving Vehicle (LRV-1) | Apollo 15 (1971) | Hadley–Apennine (~90 m east of Falcon) | Parked 2 Aug 1971 |

---

## Primary NASA Attributions

* **NSSDCA Spacecraft Record 1969-059C** (Apollo 11 LM / EASEP)
* **NSSDCA Experiment Record 1969-059C-04** (Laser Ranging Retroreflector)
* **NASA Apollo Lunar Surface Journal (ALSJ)**
* **NASA LROC Imagery** (Arizona State University / GSFC)
* **NASA 3D Resources & JSC Image Archive** (Public Domain)
