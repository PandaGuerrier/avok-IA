import type { HttpContext } from '@adonisjs/core/http'
import Game from '#game/models/game'

export default class InstagrumeController {
  async show({ inertia, params, auth, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    const data = game.data as any
    return inertia.render('external/instagrume', {
      game: {
        uuid: game.uuid,
        startAt: game.startAt,
        resumeAt: game.resumeAt,
        pausedAt: game.pausedAt,
        isPaused: game.isPaused ?? false,
        guiltyPourcentage: game.guiltyPourcentage ?? 50,
      },
      insta: data.insta ?? { conversations: [], posts: [] },
      contacts: data.contacts ?? [],
    })
  }
}
