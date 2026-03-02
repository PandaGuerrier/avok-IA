import type { HttpContext } from '@adonisjs/core/http'

import User from '#users/models/user'

import TokenDto from '#users/dtos/token'

import TokenPolicy from '#dashboard/policies/token_policy'

import { createTokenValidator } from '#dashboard/validators'
import { primaryDomain } from '#start/domains'

export default class TokensController {
  async index({ auth, bouncer, inertia }: HttpContext) {
    const user = auth.user!

    await bouncer.with(TokenPolicy).authorize('viewList')

    const tokens = await User.accessTokens.all(user)

    return inertia.render('users/tokens', {
      tokens: TokenDto.fromArray(tokens),
    })
  }

  async store({ auth, bouncer, request }: HttpContext) {
    const user = auth.user!

    await bouncer.with(TokenPolicy).authorize('create')

    const payload = await request.validateUsing(createTokenValidator)

    const token = await User.accessTokens.create(user, undefined, {
      name: payload.name ? payload.name : 'Secret Token',
    })

    return {
      type: token.type,
      token: token.value!.release(),
    }
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    await User.accessTokens.delete(user, params.id)

    return response.redirect().toRoute('tokens.index', {}, { domain: primaryDomain })
  }
}
