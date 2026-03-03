import router from '@adonisjs/core/services/router'
import GamesController from '#game/controllers/games_controller'

router.get('/game', [GamesController, 'store'])
