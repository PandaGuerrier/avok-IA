import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import Game from '#game/models/game'

export default class AdminGamesController {
  async index({ inertia }: HttpContext) {
    const games = await Game.query()
      .preload('user')
      .orderBy('createdAt', 'desc')

    const entries = games.map((game) => {
      const start = game.startAt?.toMillis() ?? game.createdAt.toMillis()
      const end = game.finishedAt?.toMillis() ?? null
      const durationMs = end ? Math.max(0, end - start - (game.totalPausedMs ?? 0)) : null
      const user = game.user
      return {
        uuid: game.uuid,
        username: user?.pseudo ?? (`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Inconnu'),
        userUuid: game.userUuid,
        guiltyPourcentage: game.guiltyPourcentage,
        isFinished: game.isFinished,
        durationMs,
        createdAt: game.createdAt.toISO(),
        finishedAt: game.finishedAt?.toISO() ?? null,
      }
    })

    return inertia.render('game/admin_games', { entries })
  }

  async bulkDestroy({ request, response }: HttpContext) {
    const schema = vine.compile(
      vine.object({ uuids: vine.array(vine.string()).minLength(1) })
    )
    const { uuids } = await request.validateUsing(schema)
    await Game.query().whereIn('uuid', uuids).delete()
    return response.redirect().back()
  }
}
