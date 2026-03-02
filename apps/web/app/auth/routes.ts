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
import { primaryDomain } from '#start/domains'

const AuthStartController = () => import('#auth/controllers/auth_start_controller')
const SignOutController = () => import('#auth/controllers/sign_out_controller')
const ForgotPasswordController = () => import('#auth/controllers/forgot_password_controller')
const ResetPasswordController = () => import('#auth/controllers/reset_password_controller')

router
  .group(() => {
    router
      .get('/auth/start', [AuthStartController, 'show'])
      .use(middleware.guest())
      .as('auth.start.show')
    router.post('/auth/check-email', [AuthStartController, 'checkEmail']).use(middleware.guest())
    router.post('/auth/login', [AuthStartController, 'login']).as('auth.login')
    router
      .post('/auth/register', [AuthStartController, 'register'])
      .use(middleware.guest())
      .as('auth.register')

    // Backwards compatibility redirects
    router.get('/login', ({ response }) => response.redirect('/auth/start')).use(middleware.guest())
    router
      .get('/sign-up', ({ response }) => response.redirect('/auth/start'))
      .use(middleware.guest())

    // Logout
    router.get('/logout', [SignOutController]).as('auth.sign_out.show')

    // Forgot / Reset password
    router
      .get('/forgot-password', [ForgotPasswordController, 'show'])
      .as('auth.forgot_password.show')
      .use(middleware.guest())
    router.post('/forgot-password', [ForgotPasswordController]).as('auth.forgot_password.handle')
    router
      .get('/reset-password/:token', [ResetPasswordController, 'show'])
      .use(middleware.guest())
      .as('auth.reset_password.show')
    router
      .post('/reset-password/:token', [ResetPasswordController])
      .use(middleware.guest())
      .as('auth.reset_password.handle')

    // Locale switch
    router.get('/switch/:locale', () => {}).use(middleware.switchLocale())
  })
.domain(primaryDomain)
