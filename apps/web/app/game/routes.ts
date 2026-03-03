import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const GamesController = () => import('#game/controllers/games_controller')
const ChoicesController = () => import('#game/controllers/choices_controller')

router
  .group(() => {
    router.get('/game', [GamesController, 'index']).as('game.index')
    router.post('/game/create', [GamesController, 'store']).as('game.create')
    router.get('/game/:uuid/result', [GamesController, 'result']).as('game.result')
    router.get('/game/:uuid', [GamesController, 'show']).as('game.start')
    router.put('/game/:uuid', [GamesController, 'update']).as('game.update')

    router.post('/game/:uuid/choices', [ChoicesController, 'store']).as('game.choices.store')
    router.get('/game/:uuid/choices', [ChoicesController, 'index']).as('game.choices.index')
    router.get('/game/:uuid/choices/:choiceUuid', [ChoicesController, 'show']).as('game.choices.show')
  })
  .use(middleware.auth())
