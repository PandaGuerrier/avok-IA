import type { HttpContext } from '@adonisjs/core/http'
import Game from '#game/models/game'
import GameDto from '#game/dtos/game'

export default class InstagrumeController {
  async show({ inertia, params, auth, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    const data = game.data as any
    return inertia.render('external/instagrume', {
      game: new GameDto(game),
      insta: { conversations: data.insta?.conversations ?? [], posts: data.insta?.posts ?? [] },
      contacts: data.contacts ?? [],
    })
  }
}
