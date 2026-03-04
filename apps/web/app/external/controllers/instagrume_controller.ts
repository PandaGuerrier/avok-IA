import { HttpContext } from '@adonisjs/core/http'

export default class InstagrumeController {
  async show({ inertia }: HttpContext) {
    return inertia.render('external/instagrume');
  }
}
