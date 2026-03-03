import { inject } from '@adonisjs/core'
import IAService from '#ia/services/ia_service'
import User from '#users/models/user'

@inject()
export default class GameService {
  constructor(protected ia: IAService) {}

  async init(user: User) {
    const data = await this.ia.generateData(user)

    console.log('Generated data:', data)
    return JSON.parse(data)
  }
}
