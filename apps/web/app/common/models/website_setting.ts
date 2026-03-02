import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class WebsiteSetting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare isMaintenance: boolean

  @column()
  declare maintenanceMessage: string | null

  @column()
  declare maintenanceEndTime: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
