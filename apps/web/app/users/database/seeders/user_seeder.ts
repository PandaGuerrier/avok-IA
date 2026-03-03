import { BaseSeeder } from '@adonisjs/lucid/seeders'

import User from '#users/models/user'
import Role from '#users/models/role'

export default class UserSeeder extends BaseSeeder {
  async run() {
    await Role.createMany([
      {
        name: 'Utilisateur',
        description: 'Rôle par défaut pour les utilisateurs enregistrés',
        tag: '🙋‍♂️ Utilisateur',
        tagColor: '#3498db',
        permissions: [],
      },
      {
        name: 'Modérateur',
        description: 'Rôle pour les modérateurs avec des permissions étendues',
        tag: '🛡️ Modérateur',
        permissions: [],
      },
      {
        name: 'Administrateur',
        description: 'Rôle avec toutes les permissions sur la plateforme',
        tag: '👑 Administrateur',
        tagColor: '#e74c3c',
        permissions: [],
      },
    ])

    const admin = await User.create({
      email: 'admin@example.com',
      fullName: 'Admin User',
      password: 'admin123',
      isEmailVerified: true,
    })

    const adminRole = await Role.findByOrFail('name', 'Administrateur')
    await admin.related('role').associate(adminRole)

    await User.create({
      email: 'user@example.com',
      fullName: 'Regular User',
      password: 'user123',
      isEmailVerified: true,
    })
  }
}
