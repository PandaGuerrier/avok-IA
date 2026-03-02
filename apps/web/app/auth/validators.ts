import vine from '@vinejs/vine'

import i18nManager from '@adonisjs/i18n/services/main'
const i18n = i18nManager.locale('fr')
vine.messagesProvider = i18n.createMessagesProvider()

export const checkEmailValidator = vine.compile(
  vine.object({
    email: vine.string().email().toLowerCase().trim(),
  })
)

export const signInValidator = vine.compile(
  vine.object({
    email: vine.string().email().toLowerCase().trim(),
    password: vine.string().minLength(1),
  })
)

export const signUpValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .toLowerCase()
      .trim()
      .unique({ table: 'users', column: 'email' }),
    password: vine.string().minLength(1).confirmed({ confirmationField: 'passwordConfirmation' }),
    fullName: vine.string().trim().maxLength(255),
    data: vine
      .object({
        account_type: vine.string().trim().maxLength(255).nullable().optional(),
        job: vine.string().trim().maxLength(255).nullable().optional(),
        project: vine.string().trim().maxLength(255).nullable().optional(),
      })
      .optional(),
    hasAcceptedTerms: vine.accepted(),
  })
)

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim().normalizeEmail({ gmail_remove_dots: false }),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    password: vine.string().minLength(1).confirmed({ confirmationField: 'passwordConfirmation' }),
  })
)
