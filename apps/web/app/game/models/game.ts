import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type DataGameType from '#game/types/data'
import Proof from '#game/models/proof'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Choice from '#game/models/choice'
import User from '#users/models/user'
import Alibi from '#game/models/alibi'
import type ChoiceData from '#game/types/choices'

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

  @column.dateTime({ columnName: 'start_time' })
  declare startAt: DateTime | null

  @column.dateTime({ columnName: 'resumed_at' })
  declare resumeAt: DateTime | null

  @column()
  declare isPaused: boolean

  @column.dateTime()
  declare pausedAt: DateTime | null

  @column()
  declare totalPausedMs: number

  @column({
    prepare: (value: ChoiceData[] | null) => (value ? JSON.stringify(value) : null),
  })
  declare currentChoices: ChoiceData[] | null

  @hasMany(() => Proof)
  declare proofs: HasMany<typeof Proof>

  @hasMany(() => Choice)
  declare choices: HasMany<typeof Choice>

  @hasMany(() => Alibi)
  declare alibis: HasMany<typeof Alibi>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static generateUuid(model: Game) {
    model.uuid = crypto.randomUUID()
  }
}

