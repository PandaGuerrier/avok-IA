import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import User from '#users/models/user'
import UserDto from '#users/dtos/user'
import UserPolicy from '#dashboard/policies/user_policy'
import { createUserValidator, editUserValidator, listUserValidator } from '#dashboard/validators'
import Role from '#users/models/role'
import { primaryDomain } from '#start/domains'

export default class UsersController {
  public async index({ bouncer, inertia, request }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('viewList')

    const payload = await request.validateUsing(listUserValidator)

    const limit = payload.perPage || 10
    const page = payload.page || 1
    const querySearch = payload.q || undefined
    const roleUuids = payload.roleUuids || []

    const query = User.query()

    if (querySearch == 'bans') {
      query.where('is_banned', true)
    } else if (querySearch) {
      query.where((subquery) => {
        subquery
          .where('full_name', 'ilike', `%${querySearch}%`)
          .orWhere('email', 'ilike', `%${querySearch}%`)
      })
    }

    if (Array.isArray(roleUuids) && roleUuids.length > 0) {
      query.andWhereIn('role_id', roleUuids)
    }

    const users = await query.preload('role').preload('ban').paginate(page, limit)

    return inertia.render('dashboard/admin/users', {
      users: UserDto.fromPaginator(users),
      q: querySearch,
      selectedRoles: roleUuids,
      roles: await Role.query().orderBy('name', 'asc'),
    })
  }

  public async show({ params, inertia, auth }: HttpContext) {
    let user: User

    if (params.uuid === 'me') {
      user = await User.findByOrFail('uuid', auth.user!.uuid)
    } else {
      user = await User.findOrFail(params.uuid)
    }

    return inertia.render('dashboard/users/profile', {
      profile: new UserDto(user),
    })
  }

  public async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('create')

    const payload = await request.validateUsing(createUserValidator)

    const user = new User()
    user.merge({
      ...payload,
      password: payload.password ? payload.password : cuid(),
    })

    await user.save()

    return response.redirect().toRoute('users.index', {}, { domain: primaryDomain })
  }

  public async update({ bouncer, params, request, response }: HttpContext) {
    const user = await User.query().where('uuid', params.id).firstOrFail()

    await bouncer.with(UserPolicy).authorize('update', user)

    const payload = await request.validateUsing(editUserValidator, {
      meta: { userUuid: params.id },
    })
    user.merge({
      ...payload,
      password: payload.password ? payload.password : user.password,
    })

    await user.save()

    return response.redirect().toRoute('users.index', {}, { domain: primaryDomain })
  }

  public async destroy({ bouncer, params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    await bouncer.with(UserPolicy).authorize('delete', user)

    await user.delete()

    return response.redirect().toRoute('users.index', {}, { domain: primaryDomain })
  }
}
