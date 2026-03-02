import type { HttpContext } from '@adonisjs/core/http'
import WebsiteSetting from '#common/models/website_setting'
import { primaryDomain } from '#start/domains'

export default class HomeController {
  public async handle({ inertia }: HttpContext) {
    return inertia.render('home/index')
  }

  public async maintenance({ inertia, response }: HttpContext) {
    const settings = await WebsiteSetting.query().firstOrFail()
    if (!settings.isMaintenance) {
      return response.redirect().toRoute('home.show', {}, { domain: primaryDomain })
    }

    return inertia.render('home/maintenance', {
      settings,
    })
  }

  public async mentionsLegales({ inertia }: HttpContext) {
    return inertia.render('home/legal/mentions_legales')
  }

  public async cgu({ inertia }: HttpContext) {
    return inertia.render('home/legal/cgu')
  }

  public async privacy({ inertia }: HttpContext) {
    return inertia.render('home/legal/privacy')
  }
}
