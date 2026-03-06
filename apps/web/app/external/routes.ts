import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const NoteTrackController = () => import('#external/controllers/notetrack_controller')
const InstagrumeController = () => import('#external/controllers/instagrume_controller')
const JaimailController = () => import('#external/controllers/jaimail_controller')

router
  .group(() => {
    router.get('/game/:uuid/notetrack', [NoteTrackController, 'show']).as('external.note-track.show')
    router.get('/game/:uuid/instagrume', [InstagrumeController, 'show']).as('external.instagrume.show')
    router.get('/game/:uuid/jaimail', [JaimailController, 'show']).as('external.jaimail.show')
  })
  .use(middleware.auth())
