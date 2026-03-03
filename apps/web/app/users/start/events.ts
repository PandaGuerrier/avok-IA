import emitter from '@adonisjs/core/services/emitter'

emitter.on('user:registered', async function (_data) {
  // Welcome event - email verification removed
})
