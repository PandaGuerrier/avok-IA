import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare uuid: string

  @column()
  declare userUuid: string

  @column()
  declare title: string

  @column()
  declare message: string

  @column()
  declare isRead: boolean

  @column()
  declare link: string | null

  @column()
  declare type: string // default, friendship, system, etc.

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(notification: Notification) {
    notification.uuid = crypto.randomUUID()
  }
}
