import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import type DataGameType from '#game/types/data'
import Proof from '#game/models/proof'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Choice from '#game/models/choice'

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
    consume: (value: string) => JSON.parse(value),
  })
  declare data: DataGameType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Proof)
  declare proofs: HasMany<typeof Proof>

  @hasMany(() => Choice)
  declare choices: HasMany<typeof Choice> // en gros c'est des choix

  @beforeCreate()
  static generateUuid(model: Game) {
    model.uuid = crypto.randomUUID()
  }
}

