import type { HttpContext } from '@adonisjs/core/http'
import Game from '#game/models/game'

export default class InstagrumeController {
  async show({ inertia, params, auth, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    const data = game.data as any
    return inertia.render('external/instagrume', {
      gameUuid: game.uuid,
      insta: data.insta ?? { conversations: [], posts: [] },
      contacts: data.contacts ?? [],
    })
  }
}
