import { HttpContext } from '@adonisjs/core/http'

export default class JaimailController {
  async show({ inertia }: HttpContext) {
    return inertia.render('external/jaimail');
  }
}
