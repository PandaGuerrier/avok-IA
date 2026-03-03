import type ChoiceData from '#game/types/choices'
import { DateTime } from 'luxon'
import { BaseModelDto } from '@adocasts.com/dto/base'
import type Choice from '#game/models/choice'

export default class ChoiceDto extends BaseModelDto {
  declare uuid: string
  declare gameUuid: string
  declare data: ChoiceData
  declare response: string

  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(choice: Choice) {
    super()
    this.uuid = choice.uuid
    this.gameUuid = choice.gameUuid
    this.data = choice.data
    this.response = choice.response

    this.createdAt = choice.createdAt
    this.updatedAt = choice.updatedAt
  }
}
