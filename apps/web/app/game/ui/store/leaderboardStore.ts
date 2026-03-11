import { create } from 'zustand'

export interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  guiltyPourcentage: number
  durationMs: number
  finishedAt: string
}

interface LeaderboardStore {
  entries: LeaderboardEntry[]
  connected: boolean
  setEntries: (entries: LeaderboardEntry[]) => void
  setConnected: (v: boolean) => void
}

export const useLeaderboardStore = create<LeaderboardStore>()((set) => ({
  entries: [],
  connected: false,
  setEntries: (entries) => set({ entries }),
  setConnected: (connected) => set({ connected }),
}))
