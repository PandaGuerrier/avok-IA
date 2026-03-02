import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

import User from '#users/models/user'
import { can, PermissionActions } from '#users/utils/permission'

export default class TokenPolicy extends BasePolicy {
  create(user: User): AuthorizerResponse {
    return can(user, 'tokens', PermissionActions.CREATE)
  }

  viewList(user: User): AuthorizerResponse {
    return can(user, 'tokens', PermissionActions.READ)
  }
}
