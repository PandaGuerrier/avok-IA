import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { primaryDomain } from '#start/domains'

export default class AccountConfigurationMiddleware {
  allowedRoutes = ['/verification', '/logout', '/me/ban']

  async handle({ auth, response, request }: HttpContext, next: NextFn) {
    if (this.allowedRoutes.some((route) => request.url().includes(route))) return await next()

    if (auth.isAuthenticated) {
      const user = auth.user!
      if (!user.isEmailVerified) {
        return response.redirect().toRoute('verification.wait', {}, { domain: primaryDomain })
      }
      return await next()
    } else return await next()
  }
}
