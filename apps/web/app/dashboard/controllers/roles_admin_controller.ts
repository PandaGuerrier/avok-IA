import type { HttpContext } from '@adonisjs/core/http'
import Role from '#users/models/role'
import { AllPermissions } from '#users/utils/permission'
import { createRoleValidator, updateRoleValidator } from '#dashboard/validators'
import RolePolicy from '#dashboard/policies/role_policy'
import { primaryDomain } from '#start/domains'

export default class RolesAdminController {
  public async index({ inertia, bouncer }: HttpContext) {
    await bouncer.with(RolePolicy).authorize('viewList')
    const roles = await Role.query().orderBy('created_at', 'desc')
    return inertia.render('dashboard/admin/roles/index', { roles })
  }

  public async store({ request, response, bouncer }: HttpContext) {
    await bouncer.with(RolePolicy).authorize('create')

    const payload = await request.validateUsing(createRoleValidator)
    const role = await Role.create(payload)
    return response.redirect().toRoute('admin_roles.show', { id: role.uuid }, { domain: primaryDomain })
  }

  public async show({ inertia, params, bouncer }: HttpContext) {
    await bouncer.with(RolePolicy).authorize('view')
    const role = await Role.findByOrFail('uuid', params.id)
    return inertia.render('dashboard/admin/roles/edit', {
      role,
      availablePermissions: AllPermissions,
    })
  }

  public async update({ request, response, params, bouncer }: HttpContext) {
    await bouncer.with(RolePolicy).authorize('update')

    const role = await Role.findByOrFail('uuid', params.id)
    const payload = await request.validateUsing(updateRoleValidator)

    role.merge(payload)
    await role.save()

    return response.redirect().back()
  }

  public async destroy({ response, params, bouncer }: HttpContext) {
    await bouncer.with(RolePolicy).authorize('delete')
    const role = await Role.findByOrFail('uuid', params.id)
    await role.delete()

    return response.redirect().toRoute('admin_roles.index', {}, { domain: primaryDomain })
  }
}
