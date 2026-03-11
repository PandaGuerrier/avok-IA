import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export const returnToKey = 'return_to'

export default class RoleMiddleware {
  protected redirectTo = '/'

  async handle({ auth, response }: HttpContext, next: NextFn, roles: string[]) {
    const user = auth.user

    if (!user) return response.redirect().toRoute('home.show')

    if (!roles.includes(user.role.name)) {
      return response.redirect().toRoute('home.show')
    }

    return next()
  }
}
