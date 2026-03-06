import UserDto from '#users/dtos/user'
import type DataGameType from '#game/types/data'
import { DateTime } from 'luxon'
import Game from '#game/models/game'
import ChoiceDto from '#game/dtos/choice'
import ProofDto from '#game/dtos/proof'
import AlibiDto from '#game/dtos/alibi'
import type ChoiceData from '#game/types/choices'
import { BaseModelDto } from '@adocasts.com/dto/base'

export default class GameDto extends BaseModelDto {
  declare uuid: string
  declare isFinished: boolean
  declare user: UserDto
  declare guiltyPourcentage: number
  declare data: DataGameType

  declare choices: ChoiceDto[]
  declare proofs: ProofDto[]
  declare alibis: AlibiDto[]

  declare createdAt: DateTime
  declare updatedAt: DateTime
  declare finishedAt: DateTime | null

  declare startAt: DateTime | null
  declare resumeAt: DateTime | null
  declare isPaused: boolean
  declare startAt: DateTime | null
  declare pausedAt: DateTime | null
  declare totalPausedMs: number
  declare currentChoices: ChoiceData[] | null

  constructor(game: Game) {
    super()
    this.uuid = game.uuid
    this.isFinished = game.isFinished

    this.user = new UserDto(game.user)
    this.guiltyPourcentage = game.guiltyPourcentage
    this.data = game.data

    this.choices = game.choices ? game.choices.map((choice) => new ChoiceDto(choice)) : []
    this.proofs = game.proofs ? game.proofs.map((proof) => new ProofDto(proof)) : []
    this.alibis = game.alibis ? game.alibis.map((alibi) => new AlibiDto(alibi)) : []

    this.createdAt = game.createdAt
    this.updatedAt = game.updatedAt
    this.finishedAt = game.finishedAt
    this.startAt = game.startAt

    this.startAt = game.startAt ?? null
    this.resumeAt = game.resumeAt ?? null
    this.isPaused = game.isPaused ?? false
    this.pausedAt = game.pausedAt ?? null
    this.totalPausedMs = game.totalPausedMs ?? 0
    this.currentChoices = game.currentChoices ?? null
  }
}
