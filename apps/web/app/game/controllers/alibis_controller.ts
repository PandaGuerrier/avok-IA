import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import Game from '#game/models/game'
import Alibi from '#game/models/alibi'
import AlibiDto from '#game/dtos/alibi'

export default class AlibisController {
  async index({ params, auth, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    const alibis = await Alibi.query().where('gameUuid', params.uuid).orderBy('createdAt', 'asc')
    return response.ok({ alibis: alibis.map((a) => new AlibiDto(a)) })
  }

  async store({ params, auth, request, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    const schema = vine.compile(
      vine.object({
        title: vine.string().maxLength(255),
        content: vine.string(),
      })
    )

    const payload = await request.validateUsing(schema)

    const alibi = await Alibi.create({
      gameUuid: game.uuid,
      title: payload.title,
      content: payload.content,
    })

    return response.created({ alibi: new AlibiDto(alibi) })
  }

  async update({ params, auth, request, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    const alibi = await Alibi.findByOrFail('uuid', params.alibiUuid)

    const schema = vine.compile(
      vine.object({
        title: vine.string().maxLength(255).optional(),
        content: vine.string().optional(),
      })
    )

    const payload = await request.validateUsing(schema)

    if (payload.title !== undefined) alibi.title = payload.title
    if (payload.content !== undefined) alibi.content = payload.content

    await alibi.save()
    return response.ok({ alibi: new AlibiDto(alibi) })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    const alibi = await Alibi.findByOrFail('uuid', params.alibiUuid)
    await alibi.delete()

    return response.noContent()
  }
}
