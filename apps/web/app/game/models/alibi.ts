import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Game from '#game/models/game'

export default class Alibi extends BaseModel {
  @column({ isPrimary: true })
  declare uuid: string

  @column()
  declare gameUuid: string

  @column()
  declare title: string

  @column()
  declare content: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>

  @beforeCreate()
  static generateUuid(model: Alibi) {
    model.uuid = crypto.randomUUID()
  }
}
