/**
 * The featured lunar missions (pure Moon scope per project brief).
 *
 * Every date and coordinate below is traceable to the NASA source listed
 * on the record. Apollo 11 Tranquility Base and Apollo 15 Hadley–Apennine.
 */

import { NASA_SOURCES } from './sources'
import type { LaunchStageDistinction, MissionRecord, StatusMeta } from './types'

export const LEFT_ON_LUNAR_SURFACE: StatusMeta = {
  category: 'left-on-lunar-surface',
  label: 'Left on the lunar surface',
  scienceContinues: false,
  summary: 'Still at its landing site today.',
}

export const DISCARDED_IN_FLIGHT: StatusMeta = {
  category: 'discarded-in-flight',
  label: 'Discarded during launch/flight',
  scienceContinues: false,
  summary:
    'Launch hardware, not a surface artifact — never touched the Moon.',
}

export const STILL_OPERATIONAL_STATUS: StatusMeta = {
  category: 'left-on-lunar-surface',
  label: 'Left on the lunar surface · still used by science',
  scienceContinues: true,
  summary: 'Passive instrument still returning data from the surface today.',
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

export const MISSIONS: MissionRecord[] = [
  APOLLO11_MISSION,
  APOLLO15_MISSION,
]

/**
 * Saturn V stages are launch hardware discarded in flight — NOT lunar surface artifacts.
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
