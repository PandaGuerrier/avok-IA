import { FileSearch, StickyNote, Users, ShieldX } from 'lucide-react'
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
  proofsCount,
  alibisCount,
  onProofsClick,
  onAlibisToggle,
  onInterrogateClick,
}: GameHeaderProps) {
  return (
    <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-2 border-b border-white/10 bg-white/3 backdrop-blur-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <ShieldX className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
          Dossier #{gameUuid.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Center — widgets self-connected to store */}
      <div className="flex items-center gap-6">
        <GuiltyWidget />
        <TimerWidget />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={onProofsClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
        >
          <FileSearch className="w-3.5 h-3.5" />
          <span>Preuves</span>
          {proofsCount > 0 && (
            <span className="bg-cyan-500/20 text-cyan-400 rounded-full px-1.5 text-[10px]">
              {proofsCount}
            </span>
          )}
        </button>

        <button
          onClick={onAlibisToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 hover:text-purple-400 hover:border-purple-500/30 transition-all"
        >
          <StickyNote className="w-3.5 h-3.5" />
          <span>Alibis</span>
          {alibisCount > 0 && (
            <span className="bg-purple-500/20 text-purple-400 rounded-full px-1.5 text-[10px]">
              {alibisCount}
            </span>
          )}
        </button>

        <button
          onClick={onInterrogateClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 hover:text-amber-400 hover:border-amber-500/30 transition-all"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Interroger</span>
        </button>
      </div>
    </div>
  )
}
