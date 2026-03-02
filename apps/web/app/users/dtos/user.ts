import { BaseModelDto } from '@adocasts.com/dto/base'

import User from '#users/models/user'
import RoleDto from '#users/dtos/role'

export interface UserPreferences {
  onboarding_completed: boolean,
  data: {
    project: string | null,
    job: string | null,
    account_type: string | null, // company, student, independent, etc.
    has_accepted_terms: boolean,
  }
}

export default class UserDto extends BaseModelDto {
  declare uuid: string
  declare roleUuid: string
  declare role: RoleDto
  declare fullName: string | null
  declare email: string
  declare avatarUrl: string | null
  declare avatar: any | null
  declare preferences: UserPreferences
  declare isFullyConfigured: boolean
  declare provider: string | null
  declare isEmailVerified: boolean | null

  declare createdAt: string
  declare updatedAt: string

  constructor(user?: User) {
    super()

    if (!user) return

    this.uuid = user.uuid
    this.roleUuid = user.roleUuid
    this.fullName = user.fullName
    this.email = user.email
    this.createdAt = user.createdAt.toISO()!
    this.updatedAt = user.updatedAt ? user.updatedAt.toISO()! : ''
    this.preferences = user.preferences
    this.role = new RoleDto(user.role)

    this.isEmailVerified = user.isEmailVerified
    this.isFullyConfigured = user.isFullyConfigured
    this.provider = user.provider

    const thumbnail = user.avatar?.getVariant('thumbnail')?.url
    this.avatarUrl = thumbnail ? thumbnail : user.avatarUrl

    this.avatar = user.avatar
  }

  toJSON(): any {
    return {
      ...this,
    }
  }

  static fromJson(json: any): UserDto {
    const dto = new UserDto()
    Object.assign(dto, json)

    if (json.role) {
      dto.role = RoleDto.fromJson(json.role)
    }

    return dto
  }
}
