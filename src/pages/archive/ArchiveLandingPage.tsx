import type { Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  Boxes,
  Database,
  Globe2,
} from 'lucide-react'

import { ROUTES } from '@/app/routes'
import { HudPanel } from '@/components/ui/HudPanel'
import { StatusChip } from '@/components/ui/StatusChip'

import heroImage from '@/assets/hero/as11-40-5875-large.jpg'
import panoramaImage from '@/assets/hero/jsc2008e040725-large.jpg'

/**
 * Archive landing page — the entry point of the experience.
 *
 * Imagery: NASA/JSC Apollo 11 archive photographs (public domain).
 * See ATTRIBUTIONS.md for full source details.
 */

const HERO_EASE = [0.22, 1, 0.36, 1] as const

const heroStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
}

const heroRise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: HERO_EASE },
  },
}

const FACETS = [
  {
    icon: Boxes,
    title: 'Abandoned equipment registry',
    body: 'A structured catalogue of human-made equipment that remains on the Moon and Mars, organised by expedition and site.',
  },
  {
    icon: Globe2,
    title: 'Interactive site exploration',
    body: 'Isometric 2.5D environments for surveying landing sites and locating artifacts in their terrain context.',
  },
  {
    icon: Database,
    title: 'Sourced mission data',
    body: 'Every record is grounded in verifiable, cited data. Nothing is published to the archive without source attribution.',
  },
]

export function ArchiveLandingPage() {
  return (
    <div className="flex flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* Hero — full-viewport lunar environment                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden">
        {/* Background layers */}
        <div aria-hidden="true" className="absolute inset-0">
          <img
            src={heroImage}
            alt=""
            className="animate-hero-drift h-full w-full object-cover object-[64%_30%] opacity-90 saturate-[0.35] contrast-[1.05]"
          />
          {/* Legibility gradients: darken sky for HUD text, ground the base */}
          <div className="absolute inset-0 bg-gradient-to-b from-void/85 via-void/5 to-void" />
          <div className="absolute inset-0 bg-gradient-to-r from-void/90 via-void/40 to-void/10" />
          {/* Restrained HUD texture */}
          <div className="scanline-overlay absolute inset-0 opacity-60" />
          <div className="hud-grid absolute inset-0 opacity-[0.12]" />
        </div>

        {/* Top HUD readouts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="relative flex items-start justify-between gap-4 px-6 pt-6 md:px-10 md:pt-8"
        >
          <p className="data-label flex items-center gap-2 text-cyan-signal">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 animate-signal-pulse rounded-full bg-cyan-signal"
            />
            Archive console · link established
          </p>
          <p className="data-label hidden text-right text-lunar-400 sm:block">
            EVA frame AS11-40-5875 · NASA/JSC
          </p>
        </motion.div>

        {/* Central composition */}
        <motion.div
          variants={heroStagger}
          initial="hidden"
          animate="show"
          className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-20 md:px-10"
        >
          <motion.p
            variants={heroRise}
            className="data-label mb-6 text-amber-signal"
          >
            Space archaeology archive · registry 01
          </motion.p>

          <motion.h1
            variants={heroRise}
            className="max-w-4xl text-5xl leading-[0.95] font-semibold tracking-tight text-lunar-50 uppercase sm:text-7xl lg:text-8xl"
          >
            Abandoned,
            <br />
            not forgotten
            <span className="text-amber-signal">.</span>
          </motion.h1>

          <motion.p
            variants={heroRise}
            className="mt-7 max-w-xl text-lg leading-relaxed text-lunar-200 md:text-xl"
          >
            An archive of humanity&rsquo;s footprints beyond Earth.
          </motion.p>

          <motion.div
            variants={heroRise}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to={ROUTES.apollo11}
              className="data-label group inline-flex items-center gap-3 border border-cyan-signal bg-cyan-signal px-6 py-3.5 text-void transition-colors hover:bg-cyan-signal-pale focus-visible:bg-cyan-signal-pale"
            >
              Begin expedition
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link
              to={ROUTES.expeditions}
              className="data-label inline-flex items-center gap-3 border border-charcoal-500 bg-void/40 px-6 py-3.5 text-lunar-100 backdrop-blur-sm transition-colors hover:border-cyan-signal hover:text-cyan-signal"
            >
              Explore the archive
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom HUD strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          className="relative flex items-end justify-between gap-4 px-6 pb-6 md:px-10 md:pb-8"
        >
          <p className="data-label flex items-center gap-2 text-lunar-400">
            <ArrowDown className="h-3.5 w-3.5 animate-signal-pulse" aria-hidden="true" />
            Scroll — featured expedition below
          </p>
          <p className="data-label text-right text-lunar-400 sm:hidden">
            NASA/JSC AS11-40-5875
          </p>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Featured expedition                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16 md:py-24">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="data-label mb-2 text-amber-signal">Featured expedition</p>
            <h2 className="text-2xl font-semibold tracking-tight text-lunar-50 md:text-3xl">
              Apollo 11 — Tranquility Base
            </h2>
          </div>
          <StatusChip status="in-preparation" />
        </div>

        <Link to={ROUTES.apollo11} className="group block focus-visible:outline-none">
          <HudPanel className="overflow-hidden p-0 transition-colors group-hover:border-charcoal-500">
            <div className="relative">
              <img
                src={panoramaImage}
                alt="Lunar surface panorama at Tranquility Base showing the Eagle lunar module and surrounding terrain, assembled from Apollo 11 frames AS11-40-5954 to 5961."
                className="h-52 w-full object-cover object-left opacity-85 saturate-[0.35] transition duration-700 ease-out group-hover:scale-[1.02] group-hover:opacity-100 md:h-80"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-void/40"
              />
              <p className="data-label absolute top-4 right-4 hidden bg-void/60 px-2.5 py-1 backdrop-blur-sm sm:block">
                Site panorama · NASA/JSC
              </p>
              <div className="absolute inset-x-5 bottom-5 flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-md text-sm leading-relaxed text-lunar-300">
                  The first expedition module. Survey environment under
                  construction — artifact records pending ingestion of sourced
                  data.
                </p>
                <span className="data-label inline-flex items-center gap-2 text-cyan-signal transition-colors group-hover:text-cyan-signal-pale">
                  Open module
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </div>
          </HudPanel>
        </Link>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Archive facets                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-16 md:pb-24">
        <p className="data-label mb-6 text-lunar-400">Archive capabilities</p>
        <div className="grid gap-6 md:grid-cols-3">
          {FACETS.map((facet) => (
            <HudPanel key={facet.title} className="flex flex-col gap-4">
              <facet.icon className="h-6 w-6 text-cyan-signal" aria-hidden="true" />
              <h3 className="text-base font-semibold text-lunar-100">
                {facet.title}
              </h3>
              <p className="text-sm leading-relaxed text-lunar-400">{facet.body}</p>
            </HudPanel>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Imagery & sourcing note                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-16 md:pb-20">
        <HudPanel className="flex flex-col gap-3">
          <p className="data-label text-lunar-400">Imagery &amp; sourcing</p>
          <p className="text-sm leading-relaxed text-lunar-400">
            Interface photography is drawn from the NASA Johnson Space Center
            Apollo 11 archive (public domain): frame AS11-40-5875 and panorama
            JSC2008-E-040725, assembled from frames AS11-40-5954 through
            AS11-40-5961. Images are toned for the interface; full source
            details are preserved in <code className="data-value">ATTRIBUTIONS.md</code>.
            Artistic reconstructions will be labelled as such when introduced.
          </p>
        </HudPanel>
      </section>
    </div>
  )
}
