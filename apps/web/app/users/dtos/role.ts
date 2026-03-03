import { BaseModelDto } from '@adocasts.com/dto/base'
import Role from '#users/models/role'

export default class RoleDto extends BaseModelDto {
  declare uuid: string
  declare name: string
  declare description: string

  constructor(role?: Role) {
    super()

    if (!role) return

    this.uuid = role.uuid
    this.name = role.name
    this.description = role.description
  }

  static fromJson(json: any): RoleDto {
    const dto = new RoleDto()
    Object.assign(dto, json)

    return dto
  }
}
