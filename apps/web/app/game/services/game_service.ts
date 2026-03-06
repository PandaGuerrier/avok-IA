import { inject } from '@adonisjs/core'
import IAService from '#ia/services/ia_service'
import User from '#users/models/user'
import { histories, type HistoryScript } from '#game/config/histories'
import type DataGameType from '#game/types/data'

@inject()
export default class GameService {
  constructor(protected ia: IAService) {}

  async init(user: User): Promise<{ data: DataGameType; script: HistoryScript }> {
    const script = histories[Math.floor(Math.random() * histories.length)]
    const rawData = await this.ia.generateData(user, script)

    console.log('Generated data:', rawData)
    const data = JSON.parse(rawData) as DataGameType
    data.history = { id: script.id, content: script.content }

    return { data, script }
  }
}
