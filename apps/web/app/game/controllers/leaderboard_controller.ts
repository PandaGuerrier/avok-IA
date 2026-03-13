import type { HttpContext } from '@adonisjs/core/http'
import Game from '#game/models/game'
import LeaderboardEntryDto from '#game/dtos/leaderboard_entry'

export default class LeaderboardController {
  async index({ inertia }: HttpContext) {
    const entries = await getLeaderboardEntries()
    return inertia.render('game/leaderboard', { entries })
  }
}

export async function getLeaderboardEntries(): Promise<LeaderboardEntryDto[]> {
  const games = await Game.query()
    .where('is_finished', true)
    .whereNotNull('finished_at')
    .preload('user')

  const entries = games
    .map((game) => {
      const start = game.startAt?.toMillis() ?? game.createdAt.toMillis()
      const end = game.finishedAt!.toMillis()
      const durationMs = Math.max(0, end - start - (game.totalPausedMs ?? 0))
      return { game, durationMs }
    })
    .sort((a, b) => a.durationMs - b.durationMs)
    .slice(0, 20)

  return entries.map(({ game }, i) => new LeaderboardEntryDto(game, i + 1))
}
