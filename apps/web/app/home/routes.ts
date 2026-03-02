/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { primaryDomain } from '#start/domains'

const HomeController = () => import('#home/controllers/home_controller')

router
  .group(() => {
    router.get('/', [HomeController]).as('home.show')
    router.get('/maintenance', [HomeController, 'maintenance']).as('maintenance.show')
    router.get('/mentions-legales', [HomeController, 'mentionsLegales']).as('legal.mentions')
    router.get('/cgu', [HomeController, 'cgu']).as('legal.cgu')
    router.get('/politique-confidentialite', [HomeController, 'privacy']).as('legal.privacy')
  })
  .domain(primaryDomain)
