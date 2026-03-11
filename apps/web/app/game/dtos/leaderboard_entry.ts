import { BaseModelDto } from '@adocasts.com/dto/base'
import Game from '#game/models/game'

export default class LeaderboardEntryDto extends BaseModelDto {
  declare rank: number
  declare username: string
  declare score: number
  declare guiltyPourcentage: number
  declare durationMs: number
  declare finishedAt: string

  constructor(game: Game, rank: number) {
    super()
    const user = game.user
    this.rank = rank
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    this.username = user.pseudo ?? (fullName || 'Inconnu')
    this.score = 100 - game.guiltyPourcentage
    this.guiltyPourcentage = game.guiltyPourcentage
    const start = game.startAt?.toMillis() ?? game.createdAt.toMillis()
    const end = game.finishedAt!.toMillis()
    this.durationMs = Math.max(0, end - start - (game.totalPausedMs ?? 0))
    this.finishedAt = game.finishedAt!.toISO()!
  }
}
