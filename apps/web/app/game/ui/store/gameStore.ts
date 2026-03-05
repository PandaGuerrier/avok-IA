import { create } from 'zustand'
import { DURATION_S } from '#game/ui/utils/constants'

interface GameStore {
  gameUuid: string | null
  startTimeMs: number | null
  totalPausedMs: number
  pausedAtMs: number | null
  isPaused: boolean
  guiltyPercentage: number

  init: (data: {
    gameUuid: string
    startTimeMs: number | null
    totalPausedMs: number
    pausedAtMs: number | null
    isPaused: boolean
    guiltyPercentage: number
  }) => void
  pause: (pausedAtMs: number) => void
  resume: (newTotalPausedMs: number) => void
  updateGuilt: (percent: number) => void
  computeTimeLeft: () => number
}

export const useGameStore = create<GameStore>()((set, get) => ({
  gameUuid: null,
  startTimeMs: null,
  totalPausedMs: 0,
  pausedAtMs: null,
  isPaused: false,
  guiltyPercentage: 50,

  init: (data) => set(data),

  pause: (pausedAtMs) => set({ isPaused: true, pausedAtMs }),

  resume: (newTotalPausedMs) =>
    set({ isPaused: false, pausedAtMs: null, totalPausedMs: Math.max(0, newTotalPausedMs) }),

  updateGuilt: (percent) => set({ guiltyPercentage: percent }),

  computeTimeLeft: () => {
    const { startTimeMs, totalPausedMs, pausedAtMs, isPaused } = get()
    if (!startTimeMs) return DURATION_S
    const refMs = isPaused ? (pausedAtMs ?? Date.now()) : Date.now()
    const totalElapsedMs = refMs - startTimeMs
    const activeMs = Math.max(0, totalElapsedMs - Math.max(0, totalPausedMs))
    const elapsed = Math.floor(activeMs / 1000)
    return Math.max(0, DURATION_S - elapsed)
  },
}))
