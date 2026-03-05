import { useState } from 'react'
import type { ReactNode } from 'react'
import { useGameStore } from '#game/ui/store/gameStore'

export interface GameStoreInfo {
  uuid: string
  startTime: unknown
  totalPausedMs: number | null
  pausedAt: unknown | null
  isPaused: boolean | null
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

  useState(() => {
    init({
      gameUuid: game.uuid,
      startTimeMs: game.startTime ? new Date(game.startTime as string).getTime() : null,
      totalPausedMs: game.totalPausedMs ?? 0,
      pausedAtMs:
        game.isPaused && game.pausedAt
          ? new Date(game.pausedAt as string).getTime()
          : null,
      isPaused: game.isPaused ?? false,
      guiltyPercentage: game.guiltyPourcentage ?? 50,
    })
  })

  return <>{children}</>
}
