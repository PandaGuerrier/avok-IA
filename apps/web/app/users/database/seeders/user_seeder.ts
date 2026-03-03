import { BaseSeeder } from '@adonisjs/lucid/seeders'

import User from '#users/models/user'
import Role from '#users/models/role'

export default class UserSeeder extends BaseSeeder {
  async run() {
    const [userRole, adminRole] = await Role.createMany([
      {
        name: 'Utilisateur',
        description: 'Peut accéder au jeu uniquement.',
      },
      {
        name: 'Administrateur',
        description: 'Accès complet au dashboard et à la gestion de la plateforme.',
      },
    ])

    await User.create({
      firstName: 'Lucas',
      lastName: 'Martin',
      pseudo: 'lmartin',
      age: 22,
      roleUuid: userRole.uuid,
    })

    await User.create({
      firstName: 'Sophie',
      lastName: 'Bernard',
      pseudo: 'sbernard',
      age: 28,
      roleUuid: adminRole.uuid,
    })
  }
}
