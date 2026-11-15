/**
 * The four featured missions (context.md §4 — exact scope, no additions).
 *
 * Every date and coordinate below is traceable to the NASA source listed
 * on the record. Apollo 15's landing coordinates are the published
 * Hadley–Apennine site values; Pathfinder and Opportunity use the
 * coordinates given in the project brief and flagged to their precision.
 */

import { NASA_SOURCES } from './sources'
import type { LaunchStageDistinction, MissionRecord, StatusMeta } from './types'

export const LEFT_ON_LUNAR_SURFACE: StatusMeta = {
  category: 'left-on-lunar-surface',
  label: 'Left on the lunar surface',
  scienceContinues: false,
  summary: 'Still at its landing site today.',
}

export const LEFT_ON_MARTIAN_SURFACE: StatusMeta = {
  category: 'left-on-martian-surface',
  label: 'Left on the Martian surface',
  scienceContinues: false,
  summary: 'Still at its landing/traverse site today.',
}

export const DISCARDED_IN_FLIGHT: StatusMeta = {
  category: 'discarded-in-flight',
  label: 'Discarded during launch/flight',
  scienceContinues: false,
  summary:
    'Launch hardware, not a surface artifact — never touched the Moon or Mars.',
}

export const STILL_OPERATIONAL_STATUS: StatusMeta = {
  category: 'left-on-lunar-surface',
  label: 'Left on the lunar surface · still used by science',
  scienceContinues: true,
  summary: 'Passive instrument still returning data from the surface.',
}

export const APOLLO11_MISSION: MissionRecord = {
  id: 'apollo-11',
  name: 'Apollo 11',
  era: '1969',
  body: 'moon',
  site: 'Mare Tranquillitatis — Tranquility Base',
  siteCoordinate: {
    latitude: 0.67416,
    longitude: 23.47314,
    dms: '0°40′26.69″N, 23°28′22.69″E',
    referenceFrame:
      'DE 421 mean Earth/polar rotation axis reference frame; derived from Lunar Reconnaissance Orbiter imagery (NSSDCA)',
    precision: 'site',
    note: 'Documented landing-site datum. Locates the landing point, not every object individually.',
  },
  keyDates: [
    { label: 'Saturn V launch', date: '16 July 1969, Kennedy Space Center' },
    { label: 'Lunar landing', date: '20 July 1969, 20:17:40 UT' },
    { label: 'Surface EVA', date: '21 July 1969, 02:39–05:11 UT' },
    { label: 'Ascent-stage liftoff', date: '21 July 1969, 17:54:01 UT' },
  ],
  summary:
    'The first crewed lunar landing. The Lunar Module "Eagle" touched down at 20:17:40 UT on 20 July 1969; its descent stage remains at Tranquility Base as the site datum while the ascent stage departed — its fate unknown.',
  sources: [
    NASA_SOURCES.apollo11LmEasep,
    NASA_SOURCES.apollo11LunarPage,
    NASA_SOURCES.lroImagery,
  ],
}

export const APOLLO15_MISSION: MissionRecord = {
  id: 'apollo-15',
  name: 'Apollo 15',
  era: '1971',
  body: 'moon',
  site: 'Hadley–Apennine, Mare Imbrium',
  siteCoordinate: {
    latitude: 26.1322,
    longitude: 3.63386,
    dms: '26°07′55.99″N, 3°38′01.90″E',
    referenceFrame: 'Mean Earth/polar axis (published Hadley–Apennine landing-site coordinates)',
    precision: 'site',
    note: 'Documented Hadley–Apennine landing site. LRV final parking position is referenced to the Falcon LM, not independently surveyed here.',
  },
  keyDates: [
    { label: 'Lunar landing', date: '30 July 1971, 22:16:29 UT' },
    { label: 'Three EVAs', date: '31 July – 2 August 1971' },
    { label: 'LRV parked for the last time', date: '2 August 1971' },
    { label: 'Ascent-stage liftoff', date: '2 August 1971, 17:11:22 UT' },
  ],
  summary:
    'Fourth crewed lunar landing and the first to carry a Lunar Roving Vehicle, which let the crew traverse roughly 27.9 km across three EVAs of the Hadley–Apennine region.',
  sources: [NASA_SOURCES.apollo15LunarPage],
}

export const PATHFINDER_MISSION: MissionRecord = {
  id: 'mars-pathfinder',
  name: 'Mars Pathfinder',
  era: '1996–1997',
  body: 'mars',
  site: 'Ares Vallis, Chryse Planitia region',
  siteCoordinate: {
    latitude: 19.13,
    longitude: -33.22,
    dms: '19°07′48″N, 33°13′12″W',
    referenceFrame: 'Areocentric coordinates of the Ares Vallis landing ellipse (published Pathfinder site values)',
    precision: 'site',
    note: 'Documented Pathfinder landing site. Sojourner is referenced to the lander, not independently surveyed here.',
  },
  keyDates: [
    { label: 'Launch', date: '4 December 1996, 06:58 UT (Delta II)' },
    { label: 'Airbag landing', date: '4 July 1997, 16:56:55 UT (Earth-received)' },
    { label: 'Sojourner egress', date: '6 July 1997' },
    { label: 'Final contact', date: '27 September 1997, after 83 sols' },
  ],
  summary:
    'A low-cost lander that arrived at Ares Vallis inside airbags on 4 July 1997, opened its petals, deployed ramps for Sojourner — the first rover to operate on Mars — and was renamed the Carl Sagan Memorial Station.',
  sources: [NASA_SOURCES.marsPathfinder],
}

export const OPPORTUNITY_MISSION: MissionRecord = {
  id: 'mer-opportunity',
  name: 'Mars Exploration Rover: Opportunity (MER-B)',
  era: '2003–2019',
  body: 'mars',
  site: 'Meridiani Planum — Perseverance Valley, Endeavour Crater rim',
  siteCoordinate: {
    latitude: -1.946,
    longitude: 354.473,
    dms: '1°56′46″S, 354°28′24″E',
    referenceFrame: 'Areocentric coordinates of the Opportunity landing/traverse record (published MER-B site values)',
    precision: 'site',
    note: 'Documented Opportunity landing record. The rover drove 45.16 km; its final position in Perseverance Valley is referenced to the mission record, not an independent survey.',
  },
  keyDates: [
    { label: 'Launch', date: '7 July 2003, 11:18 p.m. EDT (Delta II)' },
    { label: 'Landing', date: '25 January 2004, 05:05 UT (Earth-received)' },
    { label: 'Prime mission complete', date: '90 sols after landing' },
    { label: 'Last contact', date: '10 June 2018, during a global dust storm' },
    { label: 'Mission concluded', date: '13 February 2019' },
  ],
  summary:
    'Built for a 90-sol prime mission, Opportunity drove 45.16 km across Meridiani Planum over 5,352 sols — nearly fifteen years — until a global dust storm silenced it in June 2018.',
  sources: [NASA_SOURCES.opportunityRover],
}

export const MISSIONS: MissionRecord[] = [
  APOLLO11_MISSION,
  APOLLO15_MISSION,
  PATHFINDER_MISSION,
  OPPORTUNITY_MISSION,
]

/**
 * Saturn V stages are launch hardware discarded in flight — NOT lunar or
 * Martian surface artifacts (context.md working rule 5).
 */
export const SATURN_V_STAGE_DISTINCTIONS: LaunchStageDistinction[] = [
  {
    stage: 'S-IC · first stage',
    role: 'Five F-1 engines lifted Apollo 11 off pad 39A and burned for about 2.5 minutes.',
    fate: 'Jettisoned during ascent; it fell back and was lost in the Atlantic Ocean.',
    status: DISCARDED_IN_FLIGHT,
  },
  {
    stage: 'S-II · second stage',
    role: 'Five J-2 engines carried the stack onward through the upper atmosphere.',
    fate: 'Jettisoned during ascent; it reentered the atmosphere and fell into the Atlantic Ocean.',
    status: DISCARDED_IN_FLIGHT,
  },
  {
    stage: 'S-IVB · third stage',
    role: 'Fired twice: once to reach orbit, then for translunar injection.',
    fate: 'After translunar injection, Apollo 11’s S-IVB entered orbit around the Sun — it never reached the lunar surface.',
    status: DISCARDED_IN_FLIGHT,
  },
]
