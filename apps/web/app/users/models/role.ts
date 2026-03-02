import { DateTime } from 'luxon'
import { beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import User from '#users/models/user'
import BaseModel from '#common/models/base_model'
import { Permission } from '#users/utils/permission'

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  declare uuid: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column({
    prepare: (value: (Permission | string)[]) => {
      if (!value || !Array.isArray(value)) return JSON.stringify([])
      const formatted = value.map((p) => (typeof p === 'string' ? p : `${p.subject}:${p.action}`))
      return JSON.stringify([...new Set(formatted)])
    },

    consume: (value: any): string[] => {
      if (!value) return []
      if (Array.isArray(value)) {
        return value
      }
      try {
        return typeof value === 'string' ? JSON.parse(value) : value
      } catch (e) {
        return typeof value === 'string' ? [value] : []
      }
    },
  })
  declare permissions: string[]

  @column()
  declare tag: string | null

  @column()
  declare tagColor: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @beforeCreate()
  public static assignUuid(role: Role) {
    role.uuid = crypto.randomUUID()
  }
}
