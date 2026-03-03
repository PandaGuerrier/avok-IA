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

const SignInController = () => import('#auth/controllers/sign_in_controller')
const SignOutController = () => import('#auth/controllers/sign_out_controller')
const SignUpController = () => import('#auth/controllers/sign_up_controller')

router.get('/login', [SignInController, 'show']).use(middleware.guest()).as('auth.sign_in.show')
router.post('/login', [SignInController])
router.get('/logout', [SignOutController]).as('auth.sign_out.show')

router.get('/sign-up', [SignUpController, 'show']).use(middleware.guest()).as('auth.sign_up.show')
router.post('/sign-up', [SignUpController]).use(middleware.guest()).as('auth.sign_up.handle')

router.get('/switch/:locale', () => {}).use(middleware.switchLocale())
