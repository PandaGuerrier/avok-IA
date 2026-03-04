import { HttpContext } from '@adonisjs/core/http'

export default class NoteTrackController {
  async show({ inertia }: HttpContext) {
    return inertia.render('external/note_track');
  }
}
