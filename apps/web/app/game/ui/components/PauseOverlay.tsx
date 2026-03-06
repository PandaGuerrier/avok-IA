import { Pause, Play } from 'lucide-react'

export default function PauseOverlay({ onResume }: { onResume: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-lg">
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/15 rounded-2xl p-10 flex flex-col items-center gap-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-cyan-500/15 dark:bg-cyan-500/10 border border-cyan-500/40 dark:border-cyan-500/30 flex items-center justify-center">
          <Pause className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-black dark:text-white">Enquête en pause</p>
          <p className="text-sm text-gray-600 dark:text-white/40 mt-1">Le chronomètre est arrêté</p>
        </div>
        <button
          onClick={onResume}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 font-semibold hover:bg-cyan-500/30 hover:border-cyan-500/60 transition-all"
        >
          <Play className="w-4 h-4" />
          Reprendre l'enquête
        </button>
      </div>
    </div>
  )
}
