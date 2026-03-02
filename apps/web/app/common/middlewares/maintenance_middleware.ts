import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import WebsiteSetting from '#common/models/website_setting'
import { can, PermissionActions } from '#users/utils/permission'


export default class MaintenanceMiddleware {
  async handle({ request, response, auth  }: HttpContext, next: NextFn) {
    const settings = await WebsiteSetting.query().firstOrFail()

    if (settings.isMaintenance) {
      const allowedRoutes = [
        '/logout',
        '/maintenance',
        '/login',
        '/newsletter/subscribe',
        'newsletter',
        'cgu',
        'mentions-legales',
        'politique-confidentialite',
      ]

      if (auth.isAuthenticated) {
        const user = auth.user!
        if (can(user, 'website_settings', PermissionActions.MANAGE)) {
          return await next()
        }
      }

      if (allowedRoutes.some((route) => request.url().includes(route))) {
        return await next()
      }

      return response.redirect().toRoute('maintenance.show')
    }

    return await next()
  }
}
