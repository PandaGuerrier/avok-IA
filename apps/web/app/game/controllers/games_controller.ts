import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import GameService from '#game/services/game_service'

@inject()
export default class GamesController {
  constructor(protected gameService: GameService) {}

  async store({ request, auth, response }: HttpContext) {
    const defaultData = await this.gameService.init(auth.user!)

    return response.ok(defaultData)
  }

}
