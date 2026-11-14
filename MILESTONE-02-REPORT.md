# MILESTONE 02 REPORT — Apollo 11 Artifact Registry

**Project:** Abandoned but not Forgotten | NASA Space Apps Challenge
**Scope:** Source-verified artifact database + registry/inspection interface for Tranquility Base
**Status:** Complete — 2.5D environment deliberately NOT started (next milestone)

---

## 1. Files created and modified

### Created
| File | Purpose |
| --- | --- |
| `src/types/artifact.ts` | Typed artifact data model: `Artifact`, `MissionProfile`, `LocationRecord`, `PositionAccuracy`, `ScenePlacement`, `StatusRecord`, `SourceRef` (with per-claim `supports`), `MediaAsset`, `TimelineEvent` |
| `src/data/artifacts/apollo-11.ts` | Apollo 11 mission profile + 6 verified artifact records (facts, timelines, narratives, media, sources) |
| `src/data/artifacts/index.ts` | `ALL_MISSIONS` / `ALL_ARTIFACTS` registry index |
| `src/lib/artifact-utils.ts` | Lookup/filter/format helpers (`getArtifactById`, `getSurfaceArtifacts`, `getRecoveredArtifacts`, `formatCoordinates`, `positionAccuracyLabel`, `resolveSources`, …) |
| `src/components/artifacts/ArtifactStatus.tsx` | Operational status chip + surface/observations readout + `PositionAccuracyBadge` |
| `src/components/artifacts/ArtifactCard.tsx` | Registry card (photo, category, status badge, disposition, link to inspection) |
| `src/components/artifacts/ArtifactMetadata.tsx` | Identity / location / status dossier, incl. coordinate precision and scene anchor |
| `src/components/artifacts/ArtifactTimeline.tsx` | Event timeline with per-event source citation chips (S1, S2, …) |
| `public/assets/artifacts/apollo-11/{eagle-descent-stage,retroreflector,passive-seismic-experiment,us-flag,lunar-plaque,solar-wind-composition,diagrams}/` | 11 NASA images organised by artifact |
| `MILESTONE-02-REPORT.md` | This report |

### Modified
| File | Change |
| --- | --- |
| `src/pages/expeditions/Apollo11ExpeditionPage.tsx` | Rewritten: mission identification, site information (documented coordinates + accuracy), 2.5D viewport reservation, artifact inventory grid, recovered-equipment section — all data-driven |
| `src/pages/expeditions/ArtifactInspectionPage.tsx` | Rewritten: param-driven record view (media, purpose, technical description, operational history, timeline, disposition, dossier, labelled interpretive narrative, source references, media gallery, honest "no record" empty state) |
| `src/app/routes.ts` | `artifactHref(missionId, artifactId)` generalised for multi-mission use; `ROUTES.apollo11` kept for existing links |
| `ATTRIBUTIONS.md` | 11 new image attributions with NASA IDs, source pages, credits and usage notes |
| `src/components/artifacts/ArtifactCard.tsx` (fix) | Removed unused import flagged by lint |

No changes to the Milestone 01 landing page, navigation, design tokens or router structure.

---

## 2. Verified artifacts — 6 records

| ID | Object | Surface remains | Position accuracy | Status |
| --- | --- | --- | --- | --- |
| `eagle-descent-stage` | LM Eagle descent stage | Yes | **Site datum — documented** (0.67416° N, 23.47314° E, LRO-derived) | Inert; site periodically re-imaged by LRO |
| `laser-ranging-retroreflector` | LRRR (S078, EASEP) | Yes | **Documented relative** (~5 m NNW of EASEP station) | **Operational** — lunar laser ranging continues |
| `passive-seismic-experiment` | PSE (EASEP central station) | Yes | **Documented relative** (~17 m south of LM) + documented feature coords (0.6735° N, 23.4730° E) | Inactive — terminated 27 Aug 1969 |
| `us-flag` | Lunar Flag Assembly | Yes | **Unknown — uncertainty preserved** (no documented distance in consulted sources) | Inactive; standing state uncertain |
| `lunar-plaque` | LM commemorative plaque | Yes | **Documented relative** (fixed to descent-stage ladder strut) | Inert |
| `solar-wind-composition` | SWC (EASEP component) | **No — RECOVERED** | Not applicable (returned to Earth) | Returned inside sample return container, opened 26 Jul 1969 |

**The SWC test case:** researched first, correctly classified as **recovered equipment**. It is shown in a separate "Recovered equipment — returned to Earth" section, excluded from the permanent surface catalogue and from scene placement, with an explicit `registryNote`. It was NOT misclassified as abandoned.

---

## 3. Key research findings (all source-backed)

- **EASEP, not ALSEP** — every record uses the correct Apollo 11 package (Early Apollo Scientific Experiments Package): 48 kg solar-powered central station, lunar-day-only operation, PSE + LRRR (+ dust detector); LRRR passive and not attached.
- **Landing site:** 20:17:40 UT, 20 July 1969 at **0.67416° N, 23.47314° E** (DE 421 mean Earth/polar axis frame, derived from LRO imagery — NSSDCA 1969-059C).
- **Descent stage:** octagonal, 4.2 m across, 1.7 m thick; dry mass 2034 kg; 756.3 s powered descent; ascent stage lifted off 17:54:01 UT 21 Jul after 21 h 36 m; ascent stage jettisoned into lunar orbit 00:01:01 UT 22 Jul — **fate unknown, assumed impact within 1–4 months** (NSSDCA). The ascent stage is therefore *not* catalogued as a surface artifact.
- **LRRR:** fused-silica corner cubes, 100 per Apollo 11 array, no power required, PI Carroll O. Alley; NSSDCA lists 77 kg experiment mass. JPL (24 Jul 2019): ranging continues from New Mexico, France, Italy, Germany at **millimetre-level accuracy**; results include lunar recession 3.8 cm/yr and evidence for a fluid lunar core.
- **PSE/EASEP operational history:** activated by ground command 04:40:39 UT 21 Jul; transmission stopped by ground command ~5 h before local sunset (10:58:46 UT 3 Aug) as predicted power dropped; operating temps exceeded planned max by 30 °C yet functioned normally; reactivated next lunar day; **on 27 Aug 1969 it no longer accepted commands — terminated**. Cause of the loss of command acceptance is *not stated in consulted sources and is not asserted*.
- **U.S. flag:** NASA CR-188251 (Platoff, 1993) — pole driven only ~6–9 inches into the surface; "It is uncertain if the flag remained standing or was blown over by the engine blast when the ascent module took off"; no film of the Apollo 11 liftoff exists. NSSDCA states it "was actually knocked over when the LM took off". **Both statements are preserved rather than merged.**
- **Flag position:** the commonly repeated "~8.2 m from the LM centreline" figure (Wikipedia, citing Platoff) is **NOT present in the NASA CR-188251 text** (verified by extracting and searching the PDF). The flag's position is therefore registered as **unknown — uncertainty preserved**, and any future scene placement is flagged as reconstructed.
- **SWC recovery:** NSSDCA mission record (packed into sample boxes with samples and core tubes) + NASA JSC image metadata S69-45002 (first sample return container "also contained the Solar Wind Composition experiment", opened at the Lunar Receiving Laboratory, Building 37, MSC, 3:55 p.m. CDT, 26 Jul 1969).
- **Samples:** 21.55 kg collected; ~250 m total traverse, max ~100 m from the LM (NSSDCA).

## 4. Official NASA sources consulted

1. **NSSDCA Spacecraft record 1969-059C** (Apollo 11 LM / EASEP) — https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C — primary source for landing data, LM dimensions/masses, EASEP deployment/termination, plaque, SWC packing, sample mass.
2. **NSSDCA Experiment record 1969-059C-04 (LRRR, S078)** — https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-04
3. **NSSDCA Apollo 11 page** — https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo11.html — flag "knocked over" statement; photo descriptions (AS11-40-5927, AS11-40-5873, AS11-37-5545).
4. **NASA JPL News, "The Apollo Experiment That Keeps on Giving" (24 Jul 2019)** — https://www.jpl.nasa.gov/news/the-apollo-experiment-that-keeps-on-giving/ — continuing lunar laser ranging, 100 corner cubes, mm accuracy, 3.8 cm/yr, fluid core.
5. **Platoff, A. M., "Where No Flag Has Gone Before…", NASA CR-188251 (Aug 1993)** — https://ntrs.nasa.gov/citations/19940008327 (PDF downloaded and text-searched) — Lunar Flag Assembly design, 6–9 inch pole penetration, standing-state uncertainty.
6. **NASA Image and Video Library (images.nasa.gov)** — metadata for AS11-40-5927, AS11-40-5899, AS11-40-5951, AS11-40-5875, AS11-40-5873, S69-39334, S69-45002, 6900957, 6901252, PIA12909.

Every claim in the data file lists which source supports it (`supports` arrays); timeline events cite source IDs resolved in the UI.

## 5. Images collected and attribution

11 genuine NASA images under `public/assets/artifacts/apollo-11/`, all public domain, all attributed in `ATTRIBUTIONS.md` and per-asset in the data (`media[].credit`, `media[].sourceUrl`):

- AS11-40-5927 (LM at Tranquility Base, NASA/JSC) · PIA12909 (LRO site image, NASA/GSFC/ASU) · 6900957 (EASEP carry, NASA/MSFC) · AS11-40-5951 (PSE deployment, NASA/JSC) · AS11-40-5899 (plaque close-up, NASA/JSC) · S69-39334 (plaque replica, NASA/JSC) · AS11-40-5873 (SWC deployed, NASA/JSC) · 6901252 (SWC near flag, NASA/MSFC) · S69-45002 (sample box containing SWC — recovery evidence, NASA/JSC) · apollo_lm_diagram.gif (NASA History Office via NSSDCA) · AS11-40-5875 (U.S. flag, NASA/JSC; copy of the Milestone 01 hero frame).

No AI-generated or third-party imagery was used. Imagery was checked against NASA media usage guidelines.

## 6. Known gaps in historical documentation (honest, not filled)

1. **NSSDCA has no individual experiment pages for the Apollo 11 PSE or SWC** under 1969-059C (only LRRR -04 and dust detector -05). PSE/EASEP facts rest on the NSSDCA spacecraft record; SWC instrument specifications are deliberately *not asserted*.
2. **Cause of PSE termination** (27 Aug 1969 command-acceptance loss) is undocumented in consulted sources — recorded as unknown.
3. **Flag standing state and exact position** remain uncertain (see §3).
4. **Ascent stage fate** unknown (documented as such; excluded from the registry).
5. **Flagpole depth figure** (6–9 in) comes from astronaut reports summarised in CR-188251; no independent confirmation sought.

## 7. Location uncertainties (explicitly modelled)

- Site datum coordinates documented at site level; **not** extrapolated to individual objects.
- EASEP station coordinates are documented but rounded (0.0001° ≈ tens of metres) — labelled **feature-level, not metre-precise** in the UI.
- Flag position: **unknown** — no arbitrary coordinates generated.
- LRRR / PSE: documented relative positions (~5 m NNW / ~17 m S of LM) — scene anchors are marked **reconstructed** and geometrically separate from geographic coordinates (`ScenePlacement` is a distinct field, never derived from lat/lon).
- SWC: no surface position applies (recovered).

## 8. Verification results

- **Historical accuracy:** every record compiled from the fetched NASA sources above; Platoff PDF text-searched to verify (and to reject) the 8.2 m flag claim; SWC verified as returned before cataloguing.
- **Source URLs:** all cited URLs were fetched live during research (2026-11-14); all media `sourceUrl`s point to the canonical images.nasa.gov details pages.
- **Image credits:** verified against images.nasa.gov metadata (center, creator) and NSSDCA; documented in ATTRIBUTIONS.md.
- **Recovered-equipment check:** SWC shows "Recovered — returned to Earth", surface remains = No, excluded from surface catalogue and reconstruction.
- **Documented vs. approximate coordinates:** distinct enum (`documented-datum` / `documented-relative` / `reconstructed` / `unknown` / `not-applicable`) rendered as coloured badges in the UI.
- **Browser testing (dev server, port 5174):** expedition page renders all 6 cards with correct hrefs; card click → inspection navigation works (client-side router); unknown ID (`nonexistent-radar`) → honest "No record found" state; all lazy-loaded images load (naturalWidth > 0); LRRR sources/timeline/citations render; SWC shows recovered status + registry note; flag record preserves both source statements; archive landing page and expeditions hub unaffected.
- **TypeScript:** `tsc -b` clean (strict; TS7 — no `baseUrl`).
- **Lint:** `oxlint` clean (0 warnings after fix).
- **Production build:** `vite build` succeeds (chunk-size warning only, pre-existing).

## 9. Remaining tasks before 2.5D environment development

1. Compile scene coordinate frame spec (local reconstruction units) mapping `ScenePlacement.anchor`s to a Tranquility Base layout; keep separate from geo-coordinates.
2. Source additional positional documentation (LROC image analysis, Apollo 11 traverse maps from the Lunar Surface Journal) to upgrade flag position from `unknown` and refine EASEP/LRRR anchors if documented figures are found.
3. Consider extending the registry with further documented surface objects (TV camera, EVA overshoes/jettison bag, seismometer deployment gear) — each requires its own source verification pass.
4. Asset preparation: depth/dimension data for 3D models of the descent stage and EASEP components (from NASA technical documentation).
5. Optional: fetch NSSDCA experiment record 1969-059C-05 (lunar dust detector) to extend the EASEP description citation.
6. Future missions: add records to `ALL_MISSIONS` / `ALL_ARTIFACTS` only — no restructuring needed.
