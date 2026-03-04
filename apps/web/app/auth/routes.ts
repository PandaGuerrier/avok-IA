/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const SignOutController = () => import('#auth/controllers/sign_out_controller')
const SignUpController = () => import('#auth/controllers/sign_up_controller')

router.get('/logout', [SignOutController]).as('auth.sign_out.show')

router.get('/ready', [SignUpController, 'show']).use(middleware.auth()).as('auth.sign_up.show')
router.post('/sign-up', [SignUpController]).as('auth.sign_up.handle')

router.get('/switch/:locale', () => {}).use(middleware.switchLocale())
