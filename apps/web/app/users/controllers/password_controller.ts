import type { HttpContext } from '@adonisjs/core/http'

import { updatePasswordValidator } from '#dashboard/validators'
import { primaryDomain } from '#start/domains'

export default class PasswordController {
  public async show({ inertia }: HttpContext) {
    return inertia.render('users/password')
  }

  public async handle({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(updatePasswordValidator)

    const user = auth.user!

    user.merge({
      ...payload,
    })

    await user.save()

    return response.redirect().toRoute('password.show', {}, { domain: primaryDomain })
  }
}
