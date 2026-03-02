import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'

import User from '#users/models/user'

import UserPolicy from '#dashboard/policies/user_policy'

import { inviteUserValidator } from '#dashboard/validators'
import { primaryDomain } from '#start/domains'

export default class InviteController {
  public async handle({ bouncer, request, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('invite')

    const payload = await request.validateUsing(inviteUserValidator)

    const user = await User.create({
      email: payload.email,
      roleUuid: payload.roleUuid,
    })

    await user.save()
    await emitter.emit('user:registered', {
      user: user,
    })

    return response.redirect().toRoute('users.index', {}, { domain: primaryDomain })
  }
}
