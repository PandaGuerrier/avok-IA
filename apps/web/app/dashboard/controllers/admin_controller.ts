import type { HttpContext } from '@adonisjs/core/http'
import AdminPolicy from '#dashboard/policies/admin_policy'
import WebsiteSetting from '#common/models/website_setting'
import { editWebsiteSettingsValidator } from '#dashboard/validators'
import { DateTime } from 'luxon'


export default class AdminController {
  public async handle({ request, response, bouncer }: HttpContext) {
    await bouncer.with(AdminPolicy).authorize('update')

    const data = await request.validateUsing(editWebsiteSettingsValidator)
    const settings = await WebsiteSetting.query().firstOrFail()
    const date = data.maintenanceEndTime

    if (date === undefined) {
      data.maintenanceEndTime = null
    } else if (typeof date === 'string') {
      data.maintenanceEndTime = new Date(date)
    }

    settings.merge({
      ...data,
      maintenanceEndTime: data.maintenanceEndTime
        ? DateTime.fromJSDate(data.maintenanceEndTime)
        : null,
    })

    await settings.save()
    return response.redirect().toRoute('admin.settings.show')
  }

  public async show({ bouncer, inertia }: HttpContext) {
    await bouncer.with(AdminPolicy).authorize('view')
    return inertia.render('dashboard/admin/index')
  }
}
