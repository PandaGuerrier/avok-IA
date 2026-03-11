import type { HttpContext } from '@adonisjs/core/http'
import Game from '#game/models/game'
import GameDto from '#game/dtos/game'

export default class NoteTrackController {
  async show({ inertia, params, auth, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    if (game.isFinished) return response.redirect(`/game/${game.uuid}/result`)

    const data = game.data as any
    return inertia.render('external/note_track', {
      game: new GameDto(game),
      notes: data.notes ?? { calendar: [], notes: [] },
    })
  }
}
