import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'

export default class Proof extends BaseModel {
  @column({ isPrimary: true })
  declare uuid: string

  @column()
  declare gameUuid: string

  @column()
  declare imageUrl: string | null

  @column()
  declare content: string | null

  @column()
  declare data: any | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateUuid(model: Proof) {
    model.uuid = crypto.randomUUID()
  }
}
