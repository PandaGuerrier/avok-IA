import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type DataGameType from '#game/types/data'
import Proof from '#game/models/proof'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Choice from '#game/models/choice'
import User from '#users/models/user'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  declare uuid: string

  @column()
  declare isFinished: boolean

  @column()
  declare userUuid: string

  @column()
  declare guiltyPourcentage: number // ia guilty pourcentage, default to 98%

  @column({
    prepare: (value: DataGameType) => JSON.stringify(value),
  })
  declare data: DataGameType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare finishedAt: DateTime | null

  @hasMany(() => Proof)
  declare proofs: HasMany<typeof Proof>

  @hasMany(() => Choice)
  declare choices: HasMany<typeof Choice> // en gros c'est des choix

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static generateUuid(model: Game) {
    model.uuid = crypto.randomUUID()
  }
}

