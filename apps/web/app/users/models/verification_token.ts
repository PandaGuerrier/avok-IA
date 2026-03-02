import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#users/models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomBytes } from 'crypto'
import WelcomeNotification from '#users/mails/welcome_notification'
import mail from '@adonisjs/mail/services/main'

export default class VerificationToken extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare token: string

  @column()
  declare userUuid: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateToken(verifToken: VerificationToken) {
    verifToken.token = randomBytes(32).toString('hex')
  }

  async sendMail() {
    // @ts-ignore
    await this.load('user')
    await mail.send(new WelcomeNotification(this.user, this.token))
  }
}
