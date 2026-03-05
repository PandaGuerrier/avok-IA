import { useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Pause, ArrowLeft } from 'lucide-react'
import { useGameStore } from '#game/ui/store/gameStore'

function getXsrfToken(): string {
  return decodeURIComponent(
    document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || ''
  )
}

export default function GamePauseBanner({ gameUuid }: { gameUuid: string }) {
  const { isPaused, gameUuid: storeUuid, pause } = useGameStore()

  useEffect(() => {
    const shouldPause = storeUuid === gameUuid && !isPaused
    if (!shouldPause) return

    pause(Date.now())
    fetch(`/game/${gameUuid}/pause`, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': getXsrfToken() },
    }).catch(() => {})
  }, [])

  // Only block the page if the Zustand store knows about this game (i.e. user came from the game page)
  if (storeUuid !== gameUuid) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050510]/95 backdrop-blur-md pointer-events-auto">
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(6,182,212,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-6 text-center px-8">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.15)]">
          <Pause className="w-8 h-8 text-cyan-400" />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-bold text-white tracking-tight">Enquête en pause</p>
          <p className="text-sm text-white/40 max-w-xs">
            Le chronomètre est suspendu. Revenez au tribunal pour continuer.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.visit(`/game/${gameUuid}`)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-semibold text-sm hover:bg-cyan-500/25 hover:border-cyan-500/60 transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tribunal
        </button>
      </div>
    </div>
  )
}
