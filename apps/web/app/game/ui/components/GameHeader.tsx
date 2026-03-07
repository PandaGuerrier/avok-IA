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
    <div className="shrink-0 grid grid-cols-3 items-center px-4 py-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3 backdrop-blur-sm">
      {/* Left — dossier ID */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Dossier #{gameUuid.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Center — accusation + widgets */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <ShieldX className="w-4 h-4 text-destructive" />
          <span className="text-xs font-bold text-destructive uppercase tracking-widest">
            Vous êtes accusé
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div id="tour-guilty">
            <GuiltyWidget />
          </div>
          <div id="tour-timer">
            <TimerWidget />
          </div>
        </div>
      </div>

      {/* Right — placeholder pour équilibre */}
      <div />
    </div>
  )
}
