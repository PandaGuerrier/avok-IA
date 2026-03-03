/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'

const HomeController = () => import('#home/controllers/home_controller')

router.get('/', [HomeController]).as('home.show')
