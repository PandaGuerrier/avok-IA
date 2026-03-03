import { DateTime } from 'luxon'
import { afterFetch, afterFind, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import BaseModel from '#common/models/base_model'
import Role from '#users/models/role'

export default class User extends BaseModel {
  public static primaryKey = 'uuid'
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare uuid: string

  @column()
  declare roleUuid: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare pseudo: string

  @column()
  declare age: number

  @column()
  declare avatarPath: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  public get id() {
    return this.uuid
  }

  @afterFind()
  public static async runAfterFind(user: User) {
    if (user.roleUuid) {
      await user.load('role')
    }
  }

  @afterFetch()
  public static async runAfterFetch(users: User[]) {
    await Promise.all(
      users.map((user) => {
        if (user.roleUuid) {
          return user.load('role')
        }
      })
    )
  }

  @beforeCreate()
  public static assignUuid(user: User) {
    user.uuid = crypto.randomUUID()
  }
}
