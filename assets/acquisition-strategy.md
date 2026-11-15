# Asset Acquisition Strategy

Project: The Last Signal — complete rebuild with real 3D models for 7 artifacts.
Three options analyzed per object. Sources: 1) NASA 3D Resources / Quest platform,
2) verified public GLTF/GLB repositories, 3) research/pending reconstructions.

## Target objects
| # | Object | Body | Model priority | Status |
|---|--------|------|---------------|--------|
| 1 | Eagle Descent Stage | Moon | High | Research |
| 2 | Lunar Laser Ranging Retroreflector | Moon | High | Research |
| 3 | Passive Seismic Experiment | Moon | Med | Research |
| 4 | Lunar Roving Vehicle | Moon | High | Research |
| 5 | Mars Pathfinder Lander | Mars | High | Research |
| 6 | Sojourner Rover | Mars | High | Research |
| 7 | Opportunity Rover | Mars | High | Research |

## Acquisition protocol per object
1. Attempt NASA 3D Resources / Quest platform first (authentic, official).
2. Fall back to reputable GLTF/GLB repositories with clear licensing.
3. If exact model unavailable: create clearly-labelled illustrative
   reconstruction based on engineering documentation; label as
   "illustrative reconstruction", never claim exact replica.
4. Verify provenance, license/attribution, geometry quality, texture,
   file size, scale, render reliability.
5. Use GLB/GLTF wherever practical. Compress geometry/textures.
   Use KTX2 where supported.

## Known public-domain sources (to verify at fetch time)
- NASA 3D Resources (3d.arc.nasa.gov / quest.arc.nasa.gov)
- Sketchfab (CC-BY / CC0 tags)
- NASA JPL / GSFC GLTF exports
- Reputable 3D asset sites

## Retention
All acquired assets land in `src/assets/models/<object-id>/`.
Licenses and attribution recorded in `ATTRIBUTIONS.md`.
