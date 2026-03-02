import type { HttpContext } from '@adonisjs/core/http'
import {
  deleteAccountValidator,
  updatePreferencesValidator
} from '#users/validator'
import hash from '@adonisjs/core/services/hash'
import { primaryDomain } from '#start/domains'

export default class AccountController {
  public async preferences({ auth, request, response }: HttpContext) {
    const data = await request.validateUsing(updatePreferencesValidator)
    const user = auth.user!

    user.preferences = {
      ...user.preferences,
      ...data,
      data: {
        ...user.preferences?.data,
        ...data.data,
      },
    }
    await user.save()

    return response.redirect().back()
  }

  public async deleteAccount({ auth, response, request, session }: HttpContext) {
    const { password } = await request.validateUsing(deleteAccountValidator)
    const user = auth.user!

    const isPasswordValid = await hash.verify(user.password || '', password)

    if (!isPasswordValid) {
      session.flashErrors({
        password: 'Le mot de passe est incorrect',
      })

      return response.redirect().back()
    }

    await auth.use('web').logout()
    await user.delete()

    return response.redirect().toRoute('home.show', {}, { domain: primaryDomain })
  }
}
