import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

import User from '#users/models/user'
import { can, PermissionActions } from '#users/utils/permission'

export default class UserPolicy extends BasePolicy {
  viewList(currentUser: User): AuthorizerResponse {
    return can(currentUser, 'user', PermissionActions.READ)
  }

  view(currentUser: User, user: User): AuthorizerResponse {
    return can(currentUser, 'user', PermissionActions.READ) || currentUser.uuid === user.uuid
  }

  create(currentUser: User): AuthorizerResponse {
    return can(currentUser, 'user', PermissionActions.CREATE)
  }

  update(currentUser: User, user: User): AuthorizerResponse {
    return can(currentUser, 'user', PermissionActions.UPDATE) || currentUser.uuid === user.uuid
  }

  delete(currentUser: User, user: User): AuthorizerResponse {
    return can(currentUser, 'user', PermissionActions.DELETE) && currentUser.uuid !== user.uuid
  }

  invite(currentUser: User): AuthorizerResponse {
    return can(currentUser, 'user', PermissionActions.CREATE)
  }
}
