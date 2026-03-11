import { useEffect } from 'react'
import { Transmit } from '@adonisjs/transmit-client'
import { useLeaderboardStore, type LeaderboardEntry } from '#game/ui/store/leaderboardStore'

export function useLeaderboardSse() {
  const { setEntries, setConnected } = useLeaderboardStore()

  useEffect(() => {
    const transmit = new Transmit({ baseUrl: window.location.origin })
    const sub = transmit.subscription('leaderboard')

    sub.onMessage<{ entries: LeaderboardEntry[] }>((data) => {
      setEntries(data.entries)
    })

    sub.create().then(() => setConnected(true)).catch(console.error)

    return () => {
      sub.delete()
      setConnected(false)
    }
  }, [])
}
