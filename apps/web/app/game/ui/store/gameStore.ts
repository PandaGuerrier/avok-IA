import { create } from 'zustand'
import { DURATION_S } from '#game/ui/utils/constants'

interface GameStore {
  gameUuid: string | null
  startAtMs: number | null
  resumeAtMs: number | null
  pausedAtMs: number | null
  isPaused: boolean
  guiltyPercentage: number

  init: (data: {
    gameUuid: string
    startAtMs: number | null
    resumeAtMs: number | null
    pausedAtMs: number | null
    isPaused: boolean
    guiltyPercentage: number
  }) => void
  pause: (pausedAtMs: number) => void
  resume: (resumeAtMs: number | null) => void
  updateGuilt: (percent: number) => void
  computeTimeLeft: () => number
}

export const useGameStore = create<GameStore>()((set, get) => ({
  gameUuid: null,
  startAtMs: null,
  resumeAtMs: null,
  pausedAtMs: null,
  isPaused: false,
  guiltyPercentage: 50,

  init: (data) => set(data),

  pause: (pausedAtMs) => set({ isPaused: true, pausedAtMs }),

  resume: (resumeAtMs) => set({ isPaused: false, pausedAtMs: null, resumeAtMs }),

  updateGuilt: (percent) => set({ guiltyPercentage: percent }),

  computeTimeLeft: () => {
    const { startAtMs, resumeAtMs, pausedAtMs, isPaused } = get()
    if (!startAtMs) return DURATION_S
    const refMs = isPaused ? (pausedAtMs ?? Date.now()) : Date.now()
    const baseMs = resumeAtMs ?? startAtMs
    const elapsed = Math.floor((refMs - baseMs) / 1000)
    return Math.max(0, DURATION_S - elapsed)
  },
}))
