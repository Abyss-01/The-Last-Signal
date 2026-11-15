# Apollo Lunar Module: Abandoned Space Equipment Interactive Exhibit

An interactive, responsive 3D web prototype built with React, Three.js, and Vite to inspect and test the supplied Apollo Lunar Module 3D asset (`Apollo Lunar Module.glb`) as an abandoned extraterrestrial equipment exhibit.

---

## 1. Quick Start & Run Commands

### Prerequisites
- **Node.js**: v18.0.0 or later (tested on Node v24.21.0)
- **npm**: v9.0.0 or later (tested on npm 11.19.0)

### Installation
```bash
npm install
```

### Development Server
Starts the local development server with hot-module reloading:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in any modern WebGL-compatible browser.

### Run Automated Checks / Unit Tests
Executes the Vitest test suite verifying node classification, coordinate math, placeholder compliance, and accessibility:
```bash
npm test
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 2. Asset Inspection & Provenance

| Property | Value / Record |
| :--- | :--- |
| **Supplied Filename** | `Apollo Lunar Module.glb` |
| **Asset Checksum (SHA-256)** | `379101dfcee399267addf771709107c35e826b0b9e5233272f123e4c8a585c4e` |
| **Filesize** | 716,840 bytes (~700 KB) |
| **glTF Format** | glTF 2.0 Binary |
| **Exporter Signature** | Khronos glTF Blender I/O v4.2.57 |
| **Model Dimensions** | Width: **6.43 m** (X span) × Height: **5.01 m** (Y) × Depth: **6.43 m** (Z span) |
| **Scene Graph Structure** | 135 nodes, 134 meshes, 12 materials, 1 scene root (`lunarlande`) |
| **Embedded Animations** | 135 actions, each of **0.0 seconds duration** (single frame 0 rest-pose transforms exported by Blender) |
| **Model Attribution / Provenance** | **UNKNOWN** (uncredited 3D asset supplied in repository; original author, studio, and license unverified) |
| **Preservation Status** | Source file in repository root preserved strictly unmodified. Working copy served via `public/Apollo Lunar Module.glb`. |

---

## 3. Mechanical Breakdown Mode & Limitations

### Curatorial Limitation Statement
The supplied 3D asset is an exterior polygonal mesh composed of 134 unlabelled Maya/Blender objects (`group13 10`, `group31 g1`, `polySurfa1`, `pCube2`, etc.).

- **No Internal CAD Mechanics**: The asset **does not contain** internal crew cockpit controls, life-support plumbing, ascent/descent engine combustion chambers, turbopumps, or avionics equipment.
- **No Inferred Technical Functions**: Technical functions must not be claimed from polygonal geometry alone.
- **Illustrative Inspection Breakdown**: To prevent misleading technical claims, the breakdown is clearly labeled as an **illustrative separation of verified visible surface modules**:
  1. **Ascent Stage Crew Compartment & Shell** (`polySurfa`, `pCube2`): Lifts vertically along `+Y`.
  2. **Upper Antennas & Docking Drogue** (`group51`, `group32`, `pCone7`, `pPipe1`): Separates upward along `+Y`.
  3. **Forward Egress Platform, Hatch & Ingress** (`group75`, `pCube3`): Translates forward along `+Z` and `+Y`.
  4. **Reaction Control System (RCS) Quads** (`group73`, `group74`, `group61`): Expands radially outward along quadrant normals.
  5. **Auxiliary Storage Tanks** (`pSphere20`, `pSphere26-30`): Expands radially outward.
  6. **Landing Gear, Struts & Footpads** (`group31`): Expands downward along `-Y` and radially outward.
  7. **Descent Stage Core & Engine Bell** (`group13`): Serves as the static ground anchor.

### Interactive Breakdown Controls
- **Scrubber Slider**: Drag to smoothly transition between 0% (fully assembled) and 100% (fully exploded).
- **Stepping Controls**: Step-by-step navigation through 5 defined stages (`Prev Step [`, `Next Step ]`).
- **Animate / Play**: Continuous cyclic breakdown animation (automatically disabled if `prefers-reduced-motion` is active).
- **Reassemble Spacecraft**: One-click restore button smoothly collapsing all parts back to the assembled configuration.
- **3D Screen Labels**: Dynamic screen-space labels anchored to each assembly in 3D space.

---

## 4. NASA Primary-Source Fact Verification Guide

To maintain archival rigor, **no mission facts, landing coordinates, touchdown dates, or operational statuses are fabricated**. All unverified fields are marked with `[NASA Source Verification Required]`.

### Placeholder Replacement Procedure

Open `src/data/modelMetadata.js` and locate the `OBJECT_INFORMATION.placeholderFields` array. Follow the guide below to replace placeholder entries with verified primary citations:

```javascript
// Example: Replacing the mission_assignment placeholder
{
  id: 'mission_assignment',
  label: 'Specific Mission Assignment',
  // REPLACE: '[NASA Source Verification Required]'
  // WITH VERIFIED VALUE: 'Apollo 11 (LM-5 "Eagle")'
  value: 'Apollo 11 (LM-5 "Eagle")',
  status: 'VERIFIED',
  citation: 'NASA SP-4029, Table 2-4: "Apollo Flight Summary"'
}
```

### Official NASA Primary Sources to Consult:

1. **Apollo Lunar Module Operations Manual (LMA790-3-LM2)**
   - *Publisher*: Grumman Aerospace Corporation / NASA Manned Spacecraft Center
   - *Use*: Verify physical dry masses, propellant capacities, stage interface dimensions, and subsystem designations.
   - *URL*: [https://www.hq.nasa.gov/alsj/LM04_Lunar_Module_pp1-24.pdf](https://www.hq.nasa.gov/alsj/LM04_Lunar_Module_pp1-24.pdf)

2. **Apollo Lunar Surface Journal (ALSJ)**
   - *Publisher*: NASA History Division
   - *Use*: Verify landing site coordinates, EVA timelines, equipment stowage configurations, and photographic records of abandoned descent stages.
   - *URL*: [https://www.hq.nasa.gov/alsj/](https://www.hq.nasa.gov/alsj/)

3. **Apollo By The Numbers: A Statistical Reference (NASA SP-4029)**
   - *Author*: Richard W. Orloff, NASA History Program Office
   - *Use*: Authoritative chronological records of touchdown times, coordinates, landing weight, and ascent stage post-mission impact coordinates.
   - *URL*: [https://history.nasa.gov/SP-4029/SP-4029.htm](https://history.nasa.gov/SP-4029/SP-4029.htm)

---

## 5. Accessibility & Motion Preferences

- **`prefers-reduced-motion` Support**:
  - Automatically detected via `window.matchMedia('(prefers-reduced-motion: reduce)')`.
  - When active: auto-rotation is paused, breakdown transformations snap directly to keyframes rather than interpolating, and CSS transition times are zeroed out.
- **Keyboard Navigation**:
  - <kbd>Space</kbd>: Play / Pause breakdown animation
  - <kbd>[</kbd> / <kbd>]</kbd>: Previous / Next breakdown step
  - <kbd>R</kbd>: Reset camera to default 45° perspective
  - <kbd>M</kbd>: Toggle Exhibit Inspection / Breakdown Mode
  - <kbd>A</kbd>: Toggle camera auto-orbit
  - <kbd>W</kbd>: Toggle wireframe mode
  - <kbd>Escape</kbd>: Clear component highlight
- **Mobile Responsive**: Collapsible curatorial drawer, minimum 44px touch targets, scalable layout.
- **Error Handling**: Graceful error boundary screen with retry button and live error simulation trigger for verification.
