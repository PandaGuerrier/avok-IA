import vine, { SimpleMessagesProvider } from '@vinejs/vine'

import i18nManager from '@adonisjs/i18n/services/main'
const i18n = i18nManager.locale('fr')
vine.messagesProvider = i18n.createMessagesProvider()

const signUpValidatorMessages = new SimpleMessagesProvider({
  required: 'Le champ {{ field }} est obligatoire.',
  string: 'Le champ {{ field }} doit être une chaîne de caractères.',
  number: 'Le champ {{ field }} doit être un nombre.',
  file: 'Le champ {{ field }} doit être un fichier valide.',

  'firstName.minLength': 'Le prénom est requis.',
  'firstName.maxLength': 'Le prénom ne peut pas dépasser {{ max }} caractères.',

  'lastName.minLength': 'Le nom est requis.',
  'lastName.maxLength': 'Le nom ne peut pas dépasser {{ max }} caractères.',

  'pseudo.minLength': 'Le pseudo est requis.',
  'pseudo.maxLength': 'Le pseudo ne peut pas dépasser {{ max }} caractères.',

  'age.min': "L'âge doit être d'au moins {{ min }} an.",
  'age.max': "L'âge ne peut pas dépasser {{ max }} ans.",
  'age.number': "L'âge doit être un nombre entier.",

  'avatar.file.size': "L'avatar ne peut pas dépasser 5 Mo.",
  'avatar.file.extnames': "L'avatar doit être au format PNG.",
})

export const signUpValidator = vine.compile(
  vine.object({
    firstName: vine.string().minLength(1).maxLength(100),

    lastName: vine.string().minLength(1).maxLength(100),

    pseudo: vine.string().minLength(1).maxLength(50),

    age: vine.number().min(1).max(120),

    avatar: vine
      .file({
        size: '5mb',
        extnames: ['png'],
      })
      .optional(),
  })
)

signUpValidator.messagesProvider = signUpValidatorMessages
