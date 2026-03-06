import { useEffect, useReducer } from 'react'
import { formatTime } from '#game/ui/utils/utils'
import { useGameStore } from '#game/ui/store/gameStore'

export default function TimerWidget() {
  const isPaused = useGameStore((s) => s.isPaused)
  const startAtMs = useGameStore((s) => s.startAtMs)
  const resumeAtMs = useGameStore((s) => s.resumeAtMs)
  const computeElapsed = useGameStore((s) => s.computeElapsed)

  // Re-render every 500ms to keep the display accurate
  const [, tick] = useReducer((x: number) => x + 1, 0)
  useEffect(() => {
    if (isPaused) return
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [isPaused, startAtMs, resumeAtMs, tick])

  const seconds = computeElapsed()

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="font-mono font-bold text-lg"
        style={{ color: isPaused ? 'rgba(255,255,255,0.4)' : '#22d3ee' }}
      >
        {formatTime(seconds)}
      </span>
      <span className="text-[10px] text-gray-600 dark:text-white/40 uppercase tracking-widest">
        {isPaused ? 'En pause' : 'Chronomètre'}
      </span>
    </div>
  )
}
