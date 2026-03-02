/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import VerificationController from '#users/controllers/verification_controller'
import AccountController from '#users/controllers/account_controller'
import { throttle } from '#start/limiter'
import { primaryDomain } from '#start/domains'

const ProfileController = () => import('#users/controllers/profile_controller')
const PasswordController = () => import('#users/controllers/password_controller')
const TokensController = () => import('#users/controllers/tokens_controller')
const NotificationsController = () => import('#users/controllers/notifications_controller')
router
  .group(() => {
    router
      .get('/settings', ({ response }) => {
        return response.redirect().toRoute('profile.show', {}, { domain: primaryDomain })
      })
      .middleware(middleware.auth())
      .as('settings.index')

    router.put('/settings/profile', [ProfileController]).middleware(middleware.auth())
    router
      .get('/settings/profile', [ProfileController, 'show'])
      .middleware(middleware.auth())
      .as('profile.show')

    router
      .resource('/settings/tokens', TokensController)
      .only(['index', 'destroy'])
      .middleware('*', middleware.auth())
      .as('tokens')

    router.post('/api/tokens', [TokensController, 'store']).middleware(middleware.auth())

    router.put('/settings/password', [PasswordController]).middleware(middleware.auth())
    router
      .get('/settings/password', [PasswordController, 'show'])
      .middleware(middleware.auth())
      .as('password.show')

    router
      .group(() => {
        router.on('/wait').renderInertia('users/verification/wait').as('verification.wait')
        router.get('/:token', [VerificationController, 'verify']).as('verification.token')
        router
          .post('/resend', [VerificationController, 'resend'])
          .use(throttle)
          .as('verification.resend')
      })
      .prefix('/verification')
      .middleware(middleware.auth())

    router
      .group(() => {
        router
          .put('/preferences', [AccountController, 'preferences'])
          .as('account.preferences.update')
      })
      .prefix('/account')
      .middleware(middleware.auth())

    router
      .group(() => {
        router
          .group(() => {
            router
              .post('/:uuid/read', [NotificationsController, 'read'])
              .as('users.notifications.read')

            router
              .delete('/:uuid', [NotificationsController, 'destroy'])
              .as('users.notifications.destroy')
          })
          .prefix('/notifications')

        router.delete('/me/delete', [AccountController, 'deleteAccount']).as('account.delete')
      })
      .prefix('/users')
      .middleware(middleware.auth())

  })
.domain(primaryDomain)
