import { useEffect, useReducer } from 'react'
import { formatTime } from '#game/ui/utils/utils'
import { useGameStore } from '#game/ui/store/gameStore'

const r = 42
const cx = 50
const cy = 50
const circumference = 2 * Math.PI * r

export default function TimerWidget() {
  const isPaused = useGameStore((s) => s.isPaused)
  const startAtMs = useGameStore((s) => s.startAtMs)
  const resumeAtMs = useGameStore((s) => s.resumeAtMs)
  const computeElapsed = useGameStore((s) => s.computeElapsed)

  const [, tick] = useReducer((x: number) => x + 1, 0)
  useEffect(() => {
    if (isPaused) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isPaused, startAtMs, resumeAtMs, tick])

  const seconds = computeElapsed()
  const secs = seconds % 60

  // Arc des secondes (sweep 0→60 puis reset)
  const offset = circumference * (1 - secs / 60)

  const color = isPaused ? 'rgba(255,255,255,0.25)' : '#22d3ee'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[60px] h-[60px] flex items-center justify-center">
        <svg width="60" height="60" viewBox="0 0 100 100">
          {/* Ring de fond */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className="stroke-black/10 dark:stroke-white/10"
          />
          {/* Pilule */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${offset}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: isPaused ? 'none' : 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
          />
        </svg>

        {/* Temps en HTML pour lisibilité maximale */}
        <span
          className="absolute font-mono font-bold text-[11px] leading-none tabular-nums"
          style={{ color, transition: 'color 0.4s ease' }}
        >
          {formatTime(seconds)}
        </span>
      </div>

      <span className="text-[10px] text-gray-600 dark:text-white/40 uppercase tracking-widest">
        {isPaused ? 'En pause' : 'Chronomètre'}
      </span>
    </div>
  )
}
