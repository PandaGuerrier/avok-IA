import { HttpContext } from '@adonisjs/core/http'
import { afterAuthRedirectRoute } from '#config/auth'
import limiter from '@adonisjs/limiter/services/main'
import { Limiter } from '@adonisjs/limiter'

import { returnToKey } from '#auth/middleware/auth_middleware'

import User from '#users/models/user'
import emitter from '@adonisjs/core/services/emitter'

import { checkEmailValidator, signInValidator, signUpValidator } from '#auth/validators'

function isSafeInternalPath(path?: string | null): path is string {
  if (!path) return false
  if (!path.startsWith('/') || path.startsWith('//')) return false
  return !path.includes('\\');

}

export default class AuthStartController {
  private loginLimiter: Limiter

  constructor() {
    this.loginLimiter = limiter.use({
      requests: 5,
      duration: '1 min',
      blockDuration: '1 min',
    })
  }

  async show({ inertia }: HttpContext) {
    return inertia.render('auth/start')
  }

  async checkEmail({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(checkEmailValidator)
    const user = await User.findBy('email', email)

    return response.json({ exists: !!user })
  }

  async login({ auth, request, response, session, i18n }: HttpContext) {
    const { email, password } = await request.validateUsing(signInValidator)

    const returnTo = session.pull(returnToKey, null)
    session.regenerate()

    const key = `login_${request.ip()}_${email}`

    const [errors, user] = await this.loginLimiter.penalize(key, () => {
      return User.verifyCredentials(email, password)
    })

    if (errors) {
      session.flashErrors({
        E_TOO_MANY_REQUESTS: i18n.t('errors.E_TOO_MANY_REQUESTS'),
      })
      return response.redirect().toRoute('auth.start.show')
    }

    await auth.use('web').login(user)

    const safeReturnTo = isSafeInternalPath(returnTo) ? returnTo : null

    if (safeReturnTo) {
      return response.redirect().toPath(safeReturnTo)
    }

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }

  async register({ auth, request, response }: HttpContext) {
    const { email, password, fullName, data, hasAcceptedTerms } =
      await request.validateUsing(signUpValidator)

    const user = await User.create({
      fullName,
      email,
      password,
      isFullyConfigured: true,
    })

    user.preferences = {
      onboarding_completed: true,
      data: {
        project: data?.project ?? null,
        job: data?.job ?? null,
        account_type: data?.account_type ?? null,
        has_accepted_terms: hasAcceptedTerms === true,
      },
    }
    await user.save()

    await auth.use('web').login(user)
    await emitter.emit('user:registered', { user })

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
