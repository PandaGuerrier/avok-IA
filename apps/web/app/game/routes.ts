import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const GamesController = () => import('#game/controllers/games_controller')
const ChoicesController = () => import('#game/controllers/choices_controller')
const AlibisController = () => import('#game/controllers/alibis_controller')

router
  .group(() => {
    router.get('/game', [GamesController, 'index']).as('game.index')
    router.post('/game/create', [GamesController, 'store']).as('game.create')
    router.get('/game/:uuid/result', [GamesController, 'result']).as('game.result')
    router.get('/game/:uuid', [GamesController, 'show']).as('game.start')
    router.put('/game/:uuid', [GamesController, 'update']).as('game.update')

    router.post('/game/:uuid/interrogate', [GamesController, 'interrogate']).as('game.interrogate')
  //  router.post('/game/:uuid/pause', [GamesController, 'pause']).as('game.pause')
   // router.post('/game/:uuid/resume', [GamesController, 'resume']).as('game.resume')

    router.post('/game/:uuid/choices', [ChoicesController, 'store']).as('game.choices.store')
    router.post('/game/:uuid/choices/regenerate', [ChoicesController, 'regenerate']).as('game.choices.regenerate')
    router.get('/game/:uuid/choices', [ChoicesController, 'index']).as('game.choices.index')
    router.get('/game/:uuid/choices/:choiceUuid', [ChoicesController, 'show']).as('game.choices.show')

    router.get('/game/:uuid/alibis', [AlibisController, 'index']).as('game.alibis.index')
    router.post('/game/:uuid/alibis', [AlibisController, 'store']).as('game.alibis.store')
    router.put('/game/:uuid/alibis/:alibiUuid', [AlibisController, 'update']).as('game.alibis.update')
    router.delete('/game/:uuid/alibis/:alibiUuid', [AlibisController, 'destroy']).as('game.alibis.destroy')
  })
  .use(middleware.auth())
