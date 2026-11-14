import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, SignalHigh } from 'lucide-react'

/** Fallback view for unknown routes. */
export function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="grid min-h-[50vh] place-items-center px-6"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <SignalHigh className="h-8 w-8 text-amber-signal" aria-hidden="true" />
        <p className="data-label text-amber-signal">Signal lost — route unknown</p>
        <p className="max-w-md text-lunar-400">
          The requested address does not match any registered module in the
          archive.
        </p>
        <Link
          to="/"
          className="data-label inline-flex items-center gap-2 border border-charcoal-600 px-5 py-3 text-lunar-100 transition-colors hover:border-cyan-signal-dim hover:text-cyan-signal"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Return to archive
        </Link>
      </div>
    </motion.div>
  )
}
