import { useEffect, useReducer } from 'react'
import { DURATION_S } from '#game/ui/utils/constants'
import { formatTime } from '#game/ui/utils/utils'
import { useGameStore } from '#game/ui/store/gameStore'

const r = 36
const cx = 44
const cy = 44
const circumference = 2 * Math.PI * r

export default function TimerWidget() {
  const isPaused = useGameStore((s) => s.isPaused)
  const startAtMs = useGameStore((s) => s.startAtMs)
  const resumeAtMs = useGameStore((s) => s.resumeAtMs)
  const computeTimeLeft = useGameStore((s) => s.computeTimeLeft)

  // Re-render every 500ms to keep the display accurate
  const [, tick] = useReducer((x: number) => x + 1, 0)
  useEffect(() => {
    if (isPaused) return
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [isPaused, startAtMs, resumeAtMs, tick])

  const seconds = computeTimeLeft()
  const offset = circumference * (1 - seconds / DURATION_S)
  const color = seconds < 60 ? '#ef4444' : seconds < 120 ? '#f97316' : '#22d3ee'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={isPaused ? 'rgba(255,255,255,0.3)' : color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${offset}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.4s ease' }}
        />
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fill={isPaused ? 'rgba(255,255,255,0.4)' : color}
          fontSize="13"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {formatTime(seconds)}
        </text>
      </svg>
      <span className="text-[10px] text-white/40 uppercase tracking-widest">
        {isPaused ? 'En pause' : 'Temps restant'}
      </span>
    </div>
  )
}
