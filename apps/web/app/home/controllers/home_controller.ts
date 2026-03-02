import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  public async handle({ inertia }: HttpContext) {
    return inertia.render('home/index')
  }
}
