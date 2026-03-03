import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import type ChoiceData from '#game/types/choices'

export default class Choice extends BaseModel {
  @column({ isPrimary: true })
  declare uuid: string

  @column()
  declare gameUuid: string

  @column({
    prepare: (value: ChoiceData) => JSON.stringify(value),
  })
  declare data: ChoiceData

  @column()
  declare response: string // la réponse de l'ia à ce choix

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateUuid(model: Choice) {
    model.uuid = crypto.randomUUID()
  }
}
