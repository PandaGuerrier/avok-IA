import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { router } from '@inertiajs/react'
import { useGameStore } from '#game/ui/store/gameStore'
import PauseOverlay from '#game/ui/components/PauseOverlay'
import { getXsrfToken } from '#game/ui/utils/utils'

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
  const isPaused = useGameStore((s) => s.isPaused)
  const resume = useGameStore((s) => s.resume)

  useEffect(() => {
    init({
      gameUuid: game.uuid,
      startAtMs: game.startAt ? new Date(game.startAt as string).getTime() : null,
      guiltyPercentage: game.guiltyPourcentage ?? 50,
    })
  }, [init, game])

  async function handleResume() {
    try {
      const res = await fetch(`/game/${game.uuid}/resume`, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': getXsrfToken() },
      })
      if (res.ok) {
        const json = await res.json()
        resume(json.resumeAtMs ?? null)
        // Reload the page to sync server state
        router.reload()
      }
    } catch (error) {
      console.error('Resume failed:', error)
    }
  }

  return <>{isPaused ? <PauseOverlay onResume={handleResume} /> : children}</>
}
