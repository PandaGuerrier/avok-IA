import { BaseModelDto } from '@adocasts.com/dto/base'
import Role from '#users/models/role'

export default class RoleDto extends BaseModelDto {
  declare uuid: string
  declare name: string
  declare description: string
  declare permissions: string[]
  declare tag: string | null
  declare tagColor: string | null

  constructor(role?: Role) {
    super()

    if (!role) return

    this.uuid = role.uuid
    this.name = role.name
    this.description = role.description
    this.permissions = role.permissions
    this.tag = role.tag
    this.tagColor = role.tagColor
  }

  can(subject: string, action: string): boolean {
    const permissionToCheck = `${subject}:${action}`
    const managePermission = `${subject}:manage`

    return (
      this.permissions.includes(permissionToCheck) || this.permissions.includes(managePermission)
    )
  }

  static fromJson(json: any): RoleDto {
    const dto = new RoleDto()
    Object.assign(dto, json)

    return dto
  }
}
