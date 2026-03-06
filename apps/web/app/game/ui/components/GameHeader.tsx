import { ShieldX } from 'lucide-react'
import GuiltyWidget from './GuiltyWidget'
import TimerWidget from './TimerWidget'

interface GameHeaderProps {
  gameUuid: string
  proofsCount: number
  alibisCount: number
  onProofsClick: () => void
  onAlibisToggle: () => void
  onInterrogateClick: () => void
}

export default function GameHeader({
  gameUuid,
}: GameHeaderProps) {
  return (
    <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3 backdrop-blur-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <ShieldX className="w-4 h-4 text-destructive" />
        <span className="text-xs font-semibold text-destructive uppercase tracking-widest">
          Dossier #{gameUuid.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Center — widgets self-connected to store */}
      <div className="flex items-center gap-6 w-1/2 justify-center">
        <div id="tour-guilty">
          <GuiltyWidget />
        </div>
        <div id="tour-timer">
          <TimerWidget />
        </div>
      </div>

      {/* Right */}
    </div>
  )
}
