import { PermissionActions, PermissionSubject } from '#users/utils/permission'
import UserDto from '#users/dtos/user'

export function userCan(user: UserDto, subject: PermissionSubject, action: PermissionActions): boolean {
  if (!user?.role?.permissions) return false

  const permissions = user.role.permissions as string[]
  return permissions.some((p) => p === `${subject}:${action}` || p === `${subject}:manage`)
}
