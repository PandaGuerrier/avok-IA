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
    .orderByRaw('(100 - guilty_pourcentage) DESC, finished_at ASC')
    .limit(20)

  return games.map((game, i) => new LeaderboardEntryDto(game, i + 1))
}
