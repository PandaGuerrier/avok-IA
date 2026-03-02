import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import {
  afterCreate,
  afterFetch,
  afterFind,
  beforeCreate,
  belongsTo,
  column,
  hasMany,
} from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

import { attachment, attachmentManager } from '@jrmc/adonis-attachment'
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment'

import BaseModel from '#common/models/base_model'
import Role from '#users/models/role'

import ResetPasswordToken from '#users/models/reset_password_token'
import { randomUUID } from 'crypto'
import Notification from '#users/models/notification'
import type { UserPreferences } from '#users/dtos/user'

const AuthFinder = withAuthFinder(() => hash.use('argon'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  public static primaryKey = 'uuid'
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare uuid: string

  @column()
  declare roleUuid: string

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column()
  declare isEmailVerified: boolean

  @column()
  declare isFullyConfigured: boolean

  @column({ serializeAs: null })
  declare password: string | null

  @attachment({ preComputeUrl: false, variants: ['thumbnail'] })
  declare avatar: Attachment

  @column()
  declare avatarUrl: string | null

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @hasMany(() => ResetPasswordToken)
  declare resetPasswordTokens: HasMany<typeof ResetPasswordToken>

  @column()
  declare provider: string | null

  @column({
    consume: (value) => value,
    prepare: (value) => JSON.stringify(value),
  })
  declare preferences: UserPreferences

  @hasMany(() => Notification)
  declare notifications: HasMany<typeof Notification>

  public get id() {
    return this.uuid
  }

  public static async computeAvatarUrl(user: User) {
    if (!user.avatar) {
      return
    }

    const thumbnail = user.avatar.getVariant('thumbnail')

    if (thumbnail) {
      await attachmentManager.computeUrl(thumbnail)
    }
  }

  @afterFind()
  public static async runAfterFind(user: User) {
    if (user.roleUuid) {
      await user.load('role')
    }

    await this.computeAvatarUrl(user)
  }

  @afterFetch()
  public static async runAfterFetch(users: User[]) {
    await Promise.all(
      users.map((user) => {
        const promises = [this.computeAvatarUrl(user)]
        if (user.roleUuid) {
          promises.push(user.load('role'))
        }
        return Promise.all(promises)
      })
    )
  }

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @afterCreate()
  public static async assignDefault(user: User) {
    const userRole = await Role.findByOrFail('name', 'Utilisateur')
    await user.related('role').associate(userRole)
  }

  @beforeCreate()
  static generateUuid(model: User) {
    model.uuid = randomUUID()

    model.preferences = {
      onboarding_completed: false,
      data: {
        project: null,
        job: null,
        account_type: null,
        has_accepted_terms: false,
      }
    }
  }
}
