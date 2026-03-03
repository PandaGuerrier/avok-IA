import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Role from '#users/models/role'

export const returnToKey = 'return_to'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class RoleMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  protected redirectTo = '/'

  async handle({ auth, response }: HttpContext, next: NextFn, roles: Role[]) {
    const user = auth.user

    if (!user) response.redirect().toRoute('home.show')

    if (!roles.includes(user!.role)) {// todo: fix non-null assertion
      return response.redirect().toRoute('home.show')
    }

    return next()
  }
}
