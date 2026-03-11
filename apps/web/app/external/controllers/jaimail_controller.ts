import type { HttpContext } from '@adonisjs/core/http'
import Game from '#game/models/game'
import GameDto from '#game/dtos/game'

export default class JaimailController {
  async show({ inertia, params, auth, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    if (game.isFinished) return response.redirect(`/game/${game.uuid}/result`)

    const data = game.data as any
    return inertia.render('external/jaimail', {
      game: new GameDto(game),
      mails: data.mails ?? [],
    })
  }
}
