import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const IaConfigsController = () => import('#ia/controllers/ia_configs_controller')

router
  .group(() => {
    router.get('/admin/ia', [IaConfigsController, 'index']).as('admin.ia.index')
    router.post('/admin/ia', [IaConfigsController, 'store']).as('admin.ia.store')
    router.put('/admin/ia/:uuid', [IaConfigsController, 'update']).as('admin.ia.update')
    router.patch('/admin/ia/:uuid/activate', [IaConfigsController, 'activate']).as('admin.ia.activate')
    router.delete('/admin/ia/:uuid', [IaConfigsController, 'destroy']).as('admin.ia.destroy')
  })
  .use([middleware.auth()])
