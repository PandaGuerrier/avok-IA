import { AnimatePresence, motion } from 'framer-motion'
import type { LeaderboardEntry } from '#game/ui/store/leaderboardStore'

interface Props {
  entries: LeaderboardEntry[]
}

const MEDALS = ['🥇', '🥈', '🥉']

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

export default function LeaderboardCards({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-4xl text-center text-muted-foreground py-32">
        Aucune partie terminée pour l'instant.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {entries.map((entry) => {
          const uid = `${entry.username}-${entry.finishedAt}`
          return (
            <motion.div
              key={uid}
              layoutId={uid}
              layout="position"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex items-center gap-6 rounded-2xl border bg-card px-8 py-5"
            >
              <span className="text-3xl w-16 text-center">
                {entry.rank <= 3 ? MEDALS[entry.rank - 1] : (
                  <span className="font-bold text-muted-foreground">#{entry.rank}</span>
                )}
              </span>
              <span className="text-3xl font-semibold flex-1">{entry.username}</span>
              <span className="text-3xl font-bold text-primary">{entry.guiltyPourcentage}%</span>
              <span className="text-xl text-muted-foreground w-28 text-right">
                {formatDuration(entry.durationMs)}
              </span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
