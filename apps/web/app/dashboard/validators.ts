import vine from '@vinejs/vine'

import User from '#users/models/user'

import { baseSearchValidator } from '#common/validators/search'

export const createRoleValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().minLength(3).maxLength(1000),
    tag: vine.string().trim().minLength(3).maxLength(100),
    tagColor: vine.string().trim().maxLength(60).optional(),
  })
)

export const updateRoleValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().minLength(3).maxLength(1000).optional(),
    tag: vine.string().trim().minLength(3).maxLength(100).optional(),
    permissions: vine.array(vine.string()).optional(),
    tagColor: vine.string().trim().maxLength(60).optional(),
  })
)

export const createUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(255),
    email: vine.string().email().toLowerCase().trim().unique({ table: 'users', column: 'email' }),
    roleUuid: vine.string().uuid().exists({ table: 'roles', column: 'uuid' }),
    password: vine
      .string()
      .minLength(1)
      .maxLength(255)
      .confirmed({ confirmationField: 'passwordConfirmation' })
      .optional(),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    //  fullName: vine.string().trim().minLength(3).maxLength(255),
    avatar: vine
      .file({
        extnames: ['png', 'jpg', 'jpeg', 'gif'],
        size: 1024 * 2048,
      })
      .nullable(),
  })
)

export const listUserValidator = vine.compile(
  vine.object({
    ...baseSearchValidator.getProperties(),
    roleUuids: vine.array(vine.number().exists({ table: 'roles', column: 'uuid' })).optional(),
  })
)

export const createTokenValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255).optional(),
  })
)

export const inviteUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().toLowerCase().trim().unique({ table: 'users', column: 'email' }),
    description: vine.string().trim().optional(),
    roleUuid: vine.string().uuid().exists({ table: 'roles', column: 'uuid' }),
  })
)

export const updatePasswordValidator = vine.compile(
  vine.object({
    password: vine
      .string()
      .minLength(1)
      .maxLength(255)
      .confirmed({ confirmationField: 'passwordConfirmation' }),
  })
)

export const editUserValidator = vine.withMetaData<{ userUuid: string }>().compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(255),
    email: vine
      .string()
      .email()
      .toLowerCase()
      .trim()
      .unique(async (_, value, field) => {
        const row = await User.query()
          .where('email', value)
          .whereNot('uuid', field.meta.userUuid)
          .first()
        return !row
      }),
    roleUuid: vine.string().exists({ table: 'roles', column: 'uuid' }),
    password: vine
      .string()
      .minLength(1)
      .maxLength(255)
      .confirmed({ confirmationField: 'passwordConfirmation' })
      .optional(),
  })
)

export const editWebsiteSettingsValidator = vine.compile(
  vine.object({
    isMaintenance: vine.boolean().optional(),
    maintenanceMessage: vine.string().trim().optional(),
    maintenanceEndTime: vine.date().optional().nullable(),
  })
)
