import { BaseModelDto } from '@adocasts.com/dto/base'

export default class ProofDto extends BaseModelDto {
  declare uuid: string
  declare gameUuid: string
  declare imageUrl: string | null
  declare content: string | null
  declare data: any | null

  constructor(proof: any) {
    super()
    this.uuid = proof.uuid
    this.gameUuid = proof.gameUuid
    this.imageUrl = proof.imageUrl
    this.content = proof.content
    this.data = proof.data
  }
}
