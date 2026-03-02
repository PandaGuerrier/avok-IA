import vine from '@vinejs/vine'

export const updatePreferencesValidator = vine.compile(
  vine.object({
    onboarding_completed: vine.boolean().optional(),
    data: vine.object({
      project: vine.string().trim().maxLength(255).nullable(),
      job: vine.string().trim().maxLength(255).nullable(),
      account_type: vine.string().trim().maxLength(255).nullable(),
      has_accepted_terms: vine.boolean().optional(),
    }).optional(),
  })
)

export const createBanValidator = vine.compile(
  vine.object({
    reason: vine.string().trim().maxLength(1000),
    expiresAt: vine.string().nullable(),
    userUuid: vine.string().uuid(),
    deletePosts: vine.boolean().optional(),
  })
)

export const deleteAccountValidator = vine.compile(
  vine.object({
    password: vine.string(),
  })
)

