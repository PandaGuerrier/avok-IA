import { BaseSeeder } from '@adonisjs/lucid/seeders'

import User from '#users/models/user'
import Role from '#users/models/role'
import { AllPermissions, getPermissions, PermissionActions } from '#users/utils/permission'

export default class UserSeeder extends BaseSeeder {
  async run() {
    await Role.createMany([
      {
        name: 'Utilisateur',
        description: 'Rôle par défaut pour les utilisateurs enregistrés',
        tag: '🙋‍♂️ Utilisateur',
        tagColor: '#3498db',
        permissions: getPermissions(
          ['post'],
          [PermissionActions.READ]
        ).map((perm) => perm.id),
      },
      {
        name: 'Modérateur',
        description: 'Rôle pour les modérateurs avec des permissions étendues',
        tag: '🛡️ Modérateur',
        permissions: getPermissions(
          ['post', 'survey', 'channel', 'user'],
          [
            PermissionActions.MANAGE,
            PermissionActions.CREATE,
            PermissionActions.READ,
            PermissionActions.UPDATE,
            PermissionActions.DELETE,
          ]
        ).map((perm) => perm.id),
      },
      {
        name: 'Administrateur',
        description: 'Rôle avec toutes les permissions sur la plateforme',
        tag: '👑 Administrateur',
        tagColor: '#e74c3c',
        permissions: AllPermissions.map((perm) => perm.id),
      },
    ])

    const admin = await User.create({
      email: 'jules.lofficial@efrei.net',
      fullName: 'Jules Lofficial',
      password: '123',
      isEmailVerified: true,
    })

    const adminRole = await Role.findByOrFail('name', 'Administrateur')
    await admin.related('role').associate(adminRole)

    await User.create({
      email: 'memver@efrei.net',
      fullName: 'Member',
      password: '123',
      isEmailVerified: true,
    })
  }
}
