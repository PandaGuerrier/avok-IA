import { HttpContext } from '@adonisjs/core/http'
import VerificationToken from '#users/models/verification_token'

export default class VerificationController {
  async verify({ params, inertia }: HttpContext) {
    const token = params.token
    const verification = await VerificationToken.query().where('token', token).first()

    if (!verification) {
      return inertia.render('users/verification/failed')
    }

    const user = await verification.related('user').query().firstOrFail()
    user.isEmailVerified = true
    await user.save()

    await verification.delete()

    return inertia.render('users/verification/success')
  }

  async resend({ auth, response }: HttpContext) {
    const user = auth.user!

    if (user.isEmailVerified) {
      return response.redirect().back()
    }

    const token = await VerificationToken.create({
      userUuid: user.uuid,
    })

    await token.sendMail()
    return response.redirect().back()
  }
}
