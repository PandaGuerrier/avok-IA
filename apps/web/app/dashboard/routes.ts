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

const DashboardController = () => import('#dashboard/controllers/dashboard_controller')
const UsersController = () => import('#dashboard/controllers/users_controller')
const InviteController = () => import('#dashboard/controllers/invite_controller')
const SettingsController = () => import('#dashboard/controllers/admin_controller')
const RolesAdminController = () => import('#dashboard/controllers/roles_admin_controller')

router
  .group(() => {
    router.get('/', [DashboardController]).as('dashboard.show')

    router.group(() => {
      router
        .resource('/users', UsersController)
        .only(['index', 'store', 'update', 'destroy'])
        .use('*', middleware.auth())
        .as('users')

      router.post('/users/invite', [InviteController])
    })

    router.get('/users/:uuid', [UsersController, 'show'])

    router
      .group(() => {
        router.get('/', [SettingsController, 'show']).as('admin.settings.show')
        router.put('/', [SettingsController]).as('admin.settings.update')
      })
      .prefix('/admin/settings')

    router.resource('/admin/roles', RolesAdminController).as('admin.roles')
  })
  .prefix('/dashboard')
  .middleware([middleware.auth()])
