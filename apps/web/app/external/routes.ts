import router from '@adonisjs/core/services/router'

const NoteTrackController = () => import('#external/controllers/notetrack_controller')
const InstagrumeController = () => import('#external/controllers/instagrume_controller')
const JaimailController = () => import('#external/controllers/jaimail_controller')

router.group(() => {
  router.get('/note-track', [NoteTrackController, 'show']).as('external.note-track.show')
  router.get('/instagrume', [InstagrumeController, 'show']).as('external.instagrume.show')
  router.get('/jaimail', [JaimailController, 'show']).as('external.jaimail.show')
})
