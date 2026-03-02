import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

import User from '#users/models/user'
import { can, PermissionActions } from '#users/utils/permission'

export default class AdminPolicy extends BasePolicy {
  view(currentUser: User): AuthorizerResponse {
    return can(currentUser, 'website_settings', PermissionActions.MANAGE)
  }

  update(currentUser: User): AuthorizerResponse {
    return can(currentUser, 'website_settings', PermissionActions.MANAGE)
  }
}
