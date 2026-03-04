import { BaseModelDto } from '@adocasts.com/dto/base'
import { DateTime } from 'luxon'

export default class AlibiDto extends BaseModelDto {
  declare uuid: string
  declare gameUuid: string
  declare title: string
  declare content: string
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(alibi: any) {
    super()
    this.uuid = alibi.uuid
    this.gameUuid = alibi.gameUuid
    this.title = alibi.title
    this.content = alibi.content
    this.createdAt = alibi.createdAt
    this.updatedAt = alibi.updatedAt
  }
}
