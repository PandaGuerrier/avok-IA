import app from '@adonisjs/core/services/app'
import { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'crypto'

import { signUpValidator } from '#auth/validators'
import User from '#users/models/user'
import Role from '#users/models/role'

export default class SignUpController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/sign_up')
  }

  async handle({ auth, request, response }: HttpContext) {
    const { avatar, ...data } = await request.validateUsing(signUpValidator)

    const firstName = data.firstName.toLowerCase()
    const lastName = data.lastName.toLowerCase()

    const userExist = await User.query()
      .where('first_name', firstName)
      .where('last_name', lastName)
      .first()

    if (userExist) {
      await auth.use('web').login(userExist)
      return response.redirect('/game')
    }

    let avatarPath: string | null = null

    if (avatar) {
      const fileName = `${randomUUID()}.png`
      await avatar.move(app.publicPath('uploads/avatars'), { name: fileName })
      avatarPath = `uploads/avatars/${fileName}`
    }

    const userRole = await Role.findByOrFail('name', 'Utilisateur')

    const user = await User.create({
      ...data,
      firstName,
      lastName,
      avatarPath,
      roleUuid: userRole.uuid,
    })

    await auth.use('web').login(user)

    return response.redirect('/game')
  }
}
