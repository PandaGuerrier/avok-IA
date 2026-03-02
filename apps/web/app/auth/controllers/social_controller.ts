//import type { HttpContext } from '@adonisjs/core/http'

export default class SocialController {
  /*async redirect({ ally, params }: HttpContext) {
    const driverInstance = ally.use(params.provider)

    return driverInstance.redirect()
  }

  async callback({ ally, auth, params, response, session }: HttpContext) {
    const social = ally.use(params.provider)

    if (social.accessDenied()) {
      session.flash('errors', 'auth.social.error.access_denied')

      return response.redirect().toRoute('auth.start.show')
    }

    if (social.stateMisMatch()) {
      session.flash('errors', 'auth.social.error.state_mismatch')

      return response.redirect().toRoute('auth.start.show')
    }

    if (social.hasError()) {
      session.flash('errors', 'auth.social.error.uknown')

      return response.redirect().toRoute('auth.start.show')
    }

    const socialUser = await social.user()

    let user = await User.findBy('email', socialUser.email)

    if (!user) {
      user = await User.create({
        fullName: socialUser.name,
        email: socialUser.email,
        password: null,
        avatarUrl: socialUser.avatarUrl,
      })
    }

    await auth.use('web').login(user)

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }*/
}
