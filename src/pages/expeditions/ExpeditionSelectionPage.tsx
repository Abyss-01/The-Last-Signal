import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Ban, Moon, Radar } from 'lucide-react'

import { HudPanel } from '@/components/ui/HudPanel'
import { StatusChip } from '@/components/ui/StatusChip'
import { EXPEDITIONS } from '@/data/expeditions'

/** Expedition selection — choose which site module to enter. */
export function ExpeditionSelectionPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10"
    >
      <header className="flex flex-col gap-3 pt-6">
        <p className="data-label text-amber-signal">Expedition selection</p>
        <h1 className="text-3xl font-semibold text-lunar-50 sm:text-4xl">
          Registered expeditions
        </h1>
        <p className="max-w-2xl text-lunar-300">
          Each expedition is a self-contained survey module. Modules appear here
          once their survey environments are ready for exploration.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {EXPEDITIONS.map((expedition) => (
          <HudPanel key={expedition.id} className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Moon className="h-6 w-6 text-cyan-signal" aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-semibold text-lunar-100">
                    {expedition.name}
                  </h2>
                  <p className="data-value text-sm text-lunar-400">
                    {expedition.region}
                  </p>
                </div>
              </div>
              <StatusChip status={expedition.status} />
            </div>

            <p className="text-sm leading-relaxed text-lunar-400">
              {expedition.description}
            </p>

            <div className="hairline mt-auto flex items-center justify-between border-t pt-4">
              <span className="data-label flex items-center gap-2 text-lunar-400">
                <Radar className="h-3.5 w-3.5" aria-hidden="true" />
                Survey environment not yet deployed
              </span>
              <Link
                to={expedition.path}
                className="data-label inline-flex items-center gap-2 text-cyan-signal transition-colors hover:text-cyan-signal-pale"
              >
                Open module
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </HudPanel>
        ))}

        <HudPanel className="flex flex-col gap-4 border-dashed">
          <div className="flex items-center gap-3">
            <Ban className="h-6 w-6 text-lunar-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-lunar-400">
              Further expeditions
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-lunar-400">
            Additional site modules will be registered here as their survey
            data is prepared and verified.
          </p>
        </HudPanel>
      </div>
    </motion.div>
  )
}
