import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

import User from '#users/models/user'
import { can, PermissionActions } from '#users/utils/permission'

export default class RolePolicy extends BasePolicy {
  viewList(currentUser: User): AuthorizerResponse {
    return can(currentUser, 'role', PermissionActions.READ)
  }

  create(currentUser: User): AuthorizerResponse {
    return can(currentUser, 'role', PermissionActions.CREATE)
  }

  delete(currentUser: User): AuthorizerResponse {
    return can(currentUser, 'role', PermissionActions.DELETE)
  }

  view(currentUser: User): AuthorizerResponse {
    return can(currentUser, 'role', PermissionActions.READ)
  }

  update(currentUser: User): AuthorizerResponse {
    return can(currentUser, 'role', PermissionActions.UPDATE)
  }
}
