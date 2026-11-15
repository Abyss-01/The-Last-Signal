/**
 * Verified NASA primary sources used across the project.
 *
 * Every factual claim in `missions.ts` / `artifacts.ts` traces back to one
 * of these records. Only URLs of NASA archives, mission pages, NSSDCA
 * experiment records, LROC imagery and JPL archives are used.
 */

import type { PrimarySourceRecord } from './types'

export const NASA_SOURCES = {
  apollo11LmEasep: {
    id: 'nssdca-apollo11-lm',
    title: 'Apollo 11 Lunar Module / EASEP (NSSDCA/COSPAR ID 1969-059C)',
    publisher: 'NASA Space Science Data Coordinated Archive (NSSDCA)',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',
  },
  apollo11LunarPage: {
    id: 'nssdca-apollo11-page',
    title: 'Apollo 11 (NSSDCA Lunar Science archive page)',
    publisher: 'NASA Space Science Data Coordinated Archive (NSSDCA)',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo11.html',
  },
  apollo11Lrrr: {
    id: 'nssdca-apollo11-lrrr',
    title: 'Laser Ranging Retroreflector (NSSDCA Experiment ID 1969-059C-04, S078)',
    publisher: 'NASA Space Science Data Coordinated Archive (NSSDCA)',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-04',
  },
  jplLunarLaserRanging: {
    id: 'jpl-llr-2019',
    title: 'The Apollo Experiment That Keeps on Giving (JPL News, 24 July 2019)',
    publisher: 'NASA Jet Propulsion Laboratory, California Institute of Technology',
    url: 'https://www.jpl.nasa.gov/news/the-apollo-experiment-that-keeps-on-giving/',
  },
  apollo15LunarPage: {
    id: 'nssdca-apollo15-page',
    title: 'Apollo 15 (NSSDCA Lunar Science archive page)',
    publisher: 'NASA Space Science Data Coordinated Archive (NSSDCA)',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo15.html',
  },
  marsPathfinder: {
    id: 'nasa-mars-pathfinder',
    title: 'Mars Pathfinder (NASA Mars exploration archive)',
    publisher: 'NASA / Jet Propulsion Laboratory',
    url: 'https://mars.nasa.gov/mars-pathfinder/',
  },
  opportunityRover: {
    id: 'nasa-mer-opportunity',
    title: 'Mars Exploration Rover: Opportunity (NASA Mars exploration archive)',
    publisher: 'NASA / Jet Propulsion Laboratory',
    url: 'https://mars.nasa.gov/mer/mission/rover-opportunity/',
  },
  nasaHistory: {
    id: 'nasa-history',
    title: 'NASA History (mission summaries and chronologies)',
    publisher: 'NASA',
    url: 'https://www.nasa.gov/history/',
  },
  lroImagery: {
    id: 'lro-imagery',
    title: 'Lunar Reconnaissance Orbiter imagery (LROC, Arizona State University)',
    publisher: 'NASA / GSFC / Arizona State University',
    url: 'https://lunar.gsfc.nasa.gov/',
  },
  nasa3dResources: {
    id: 'nasa-3d-resources',
    title: 'NASA 3D Resources (models and usage terms)',
    publisher: 'NASA',
    url: 'https://science.nasa.gov/3d-resources/',
  },
} satisfies Record<string, PrimarySourceRecord>

/** Convenience list for the broadsheet's sources ledger footer. */
export const SOURCE_LEDGER: PrimarySourceRecord[] = Object.values(NASA_SOURCES)
