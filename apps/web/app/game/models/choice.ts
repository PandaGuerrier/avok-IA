import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type ChoiceData from '#game/types/choices'

export default class Choice extends BaseModel {
  @column({ isPrimary: true })
  declare uuid: string

  @column()
  declare gameUuid: string

  @column({
    prepare: (value: ChoiceData) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare data: ChoiceData

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
