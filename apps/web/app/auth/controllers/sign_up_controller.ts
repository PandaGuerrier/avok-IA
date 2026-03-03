import { HttpContext } from '@adonisjs/core/http'
import { afterAuthRedirectRoute } from '#config/auth'

import User from '#users/models/user'

import { signUpValidator } from '#auth/validators'
import emitter from '@adonisjs/core/services/emitter'

export default class SignUpController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/sign_up')
  }

  async handle({ auth, request, response }: HttpContext) {
    console.log('SignUpController.handle called', request.raw())
    const { email, password } = await request.validateUsing(signUpValidator)
    const fullName = this.#formatFullname(email)

    const user = await User.create({ fullName, email, password })
    await auth.use('web').login(user)

    await emitter.emit('user:registered', { user })

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }

  #formatFullname(email: string): string {
    const namePart = email.split('@')[0]
    const nameSegments = namePart.split('.').map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    return nameSegments.join(' ')
  }
}
