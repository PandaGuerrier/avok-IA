import { useEffect } from 'react'
import usePageProps from '#common/ui/hooks/use_page_props'
import { useLeaderboardStore, type LeaderboardEntry } from '#game/ui/store/leaderboardStore'
import { useLeaderboardSse } from '#game/ui/hooks/use_leaderboard_sse'
import LeaderboardCards from '#game/ui/components/LeaderboardTable'
import { Trophy } from 'lucide-react'

interface Props {
  entries: LeaderboardEntry[]
}

export default function LeaderboardPage() {
  const { entries: ssrEntries } = usePageProps<Props>()
  const { entries, connected, setEntries } = useLeaderboardStore()

  useEffect(() => {
    setEntries(ssrEntries)
  }, [])

  useLeaderboardSse()

  return (
    <div className="min-h-screen bg-background flex flex-col p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <Trophy className="w-12 h-12 text-yellow-500" />
          <h1 className="text-6xl font-bold tracking-tight">Classement</h1>
        </div>
        <span className={`h-4 w-4 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      {/* Cards */}
      <LeaderboardCards entries={entries} />
    </div>
  )
}
