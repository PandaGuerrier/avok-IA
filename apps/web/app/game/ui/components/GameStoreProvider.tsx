import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { router } from '@inertiajs/react'
import { useGameStore } from '#game/ui/store/gameStore'
import PauseOverlay from '#game/ui/components/PauseOverlay'
import { getXsrfToken } from '#game/ui/utils/utils'
import { Button } from '@workspace/ui/components/button'
import { Play } from 'lucide-react'

export interface GameStoreInfo {
  uuid: string
  startAt: unknown
  guiltyPourcentage: number | null
}

export default function GameStoreProvider({
  game,
  children,
}: {
  game: GameStoreInfo
  children: ReactNode
}) {
  const init = useGameStore((s) => s.init)
  const start = useGameStore((s) => s.start)
  const isPaused = useGameStore((s) => s.isPaused)
  const startAtMs = useGameStore((s) => s.startAtMs)
  const resume = useGameStore((s) => s.resume)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    init({
      gameUuid: game.uuid,
      startAtMs: game.startAt ? new Date(game.startAt as string).getTime() : null,
      guiltyPercentage: game.guiltyPourcentage ?? 50,
    })
  }, [init, game])

  async function handleStart() {
    setStarting(true)
    try {
      const res = await fetch(`/game/${game.uuid}/start`, {
        method: 'PATCH',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': getXsrfToken() },
      })
      if (res.ok) {
        const json = await res.json()
        start(json.startAtMs)
      }
    } catch (error) {
      console.error('Start failed:', error)
    } finally {
      setStarting(false)
    }
  }

  async function handleResume() {
    try {
      const res = await fetch(`/game/${game.uuid}/resume`, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': getXsrfToken() },
      })
      if (res.ok) {
        const json = await res.json()
        resume(json.resumeAtMs ?? null)
        router.reload()
      }
    } catch (error) {
      console.error('Resume failed:', error)
    }
  }

  return (
    <>
      {isPaused ? <PauseOverlay onResume={handleResume} /> : children}
      {startAtMs === null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 text-center px-8 py-10 rounded-3xl bg-white/10 dark:bg-white/5 border border-white/20 shadow-2xl max-w-sm w-full">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-2xl scale-150" />
              <Play className="relative w-16 h-16 text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Prêt à commencer ?</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Le chronomètre démarrera dès que vous cliquerez sur le bouton.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleStart}
              disabled={starting}
              className="w-full text-base font-bold"
            >
              {starting ? 'Démarrage…' : 'Commencer'}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
