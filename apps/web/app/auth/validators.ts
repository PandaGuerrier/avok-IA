import vine from '@vinejs/vine'

import i18nManager from '@adonisjs/i18n/services/main'
const i18n = i18nManager.locale('fr')
vine.messagesProvider = i18n.createMessagesProvider()

export const signUpValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .toLowerCase()
      .trim()
      .unique({ table: 'users', column: 'email' })
      .regex(/^[a-z-]+\.[a-z-]+@efrei\.(?:net|fr)$/),
    password: vine.string().minLength(1).confirmed({ confirmationField: 'passwordConfirmation' }),
    hasAcceptedTerms: vine.accepted(),
  })
)

export const signInValidator = vine.compile(
  vine.object({
    email: vine.string().email().toLowerCase().trim(),
    password: vine.string().minLength(1),
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
