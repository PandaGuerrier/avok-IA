import { useGameStore } from '#game/ui/store/gameStore'

const r = 42
const cx = 50
const cy = 54
const circumference = Math.PI * r

export default function GuiltyWidget() {
  const percent = useGameStore((s) => s.guiltyPercentage)
  const offset = circumference * (1 - percent / 100)
  const color =
    percent > 75 ? '#ef4444' : percent > 50 ? '#f97316' : percent > 25 ? '#eab308' : '#22c55e'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="100" height="60" viewBox="0 0 100 60">
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${offset}`}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.6s ease' }}
        />
        <text x="50" y="52" textAnchor="middle" fill={color} fontSize="13" fontWeight="bold">
          {percent}%
        </text>
      </svg>
      <span className="text-[10px] text-white/40 uppercase tracking-widest">Culpabilité</span>
    </div>
  )
}
