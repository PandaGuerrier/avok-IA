import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'

export default class IaConfig extends BaseModel {
  static table = 'ia_configs'

  @column({ isPrimary: true })
  declare uuid: string

  @column()
  declare name: string

  @column()
  declare endpoint: string

  @column()
  declare apiKey: string

  @column()
  declare model: string

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateUuid(config: IaConfig) {
    config.uuid = crypto.randomUUID()
  }
}
