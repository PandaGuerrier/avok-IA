import vine, { SimpleMessagesProvider } from '@vinejs/vine'

import i18nManager from '@adonisjs/i18n/services/main'
import db from '@adonisjs/lucid/services/db'
const i18n = i18nManager.locale('fr')
vine.messagesProvider = i18n.createMessagesProvider()

const BANNED_PSEUDOS = [
  // Sexuel
  'zizi', 'z!z!', 'bite', 'b1te', 'bitte', 'couille', 'couilles', 'cul',
  'salope', 'sal0pe', 'putain', 'pute', 'p*te', 'sexe', 'penis', 'vagin',
  'nichon', 'nichons', 'enculé', 'encule', '3ncule', 'branleur', 'branl3ur',
  'pd', 'pédé', 'pede', 'leche', 'sodomie',

  // Insultes
  'con', 'conn', 'conne', 'connard', 'connasse', 'merde', 'm3rde', 'merd3',
  'idiot', 'imbecile', 'abruti', 'cretin', 'debile', 'attardé', 'attarde',
  'batard', 'bâtard', 'fils de pute', 'fdp', 'tg', 'ta gueule', 'nique',
  'niquer', 'ntm', 'nique ta mere', 'baise', 'baiser',

  // Raciste / discriminatoire
  'nazi', 'hitler', 'nigger', 'nigga', 'negro', 'nègre', 'negre',
  'youpin', 'youpine', 'arabe', 'bounty', 'bicot', 'bougnoule',
  'chinetoque', 'feuj', 'juif', 'islamiste', 'terroriste',

  // Rôles réservés
  'admin', 'administrateur', 'moderateur', 'modérateur', 'modo',
  'root', 'superuser', 'super_user', 'staff', 'support', 'system',
  'bot', 'robot', 'anonymous', 'anonyme',
]

function isBannedPseudo(value: string): boolean {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, '')
  return BANNED_PSEUDOS.some((banned) => {
    const normalizedBanned = banned.toLowerCase().replace(/[^a-z0-9]/g, '')
    return normalized.includes(normalizedBanned)
  })
}

const isNickNameUnique = vine.createRule(async (value: unknown, _, field) => {
  if (typeof value !== 'string') return

  const nickName = await db.from('users').where('pseudo', value).first()
  if (nickName) {
    field.report('Ce pseudo est déjà utilisé.', 'isNickNameUnique', field)
  }
})

const isBannedPseudoRule = vine.createRule((value: unknown, _, field) => {
  if (typeof value !== 'string') return

  if (isBannedPseudo(value)) {
    field.report('Ce pseudo est interdit.', 'isBannedPseudo', field)
  }
})

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

    pseudo: vine
      .string()
      .minLength(1)
      .maxLength(30)
      .use(isBannedPseudoRule())
      .use(isNickNameUnique()),

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
