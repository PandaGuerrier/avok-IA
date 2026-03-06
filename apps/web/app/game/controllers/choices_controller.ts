import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import IAService from '#ia/services/ia_service'
import Game from '#game/models/game'
import Choice from '#game/models/choice'
import Proof from '#game/models/proof'
import Alibi from '#game/models/alibi'
import ChoiceDto from '#game/dtos/choice'

@inject()
export default class ChoicesController {
  constructor(protected iaService: IAService) {}

  async index({ params, auth, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    const choices = await Choice.query().where('gameUuid', params.uuid).orderBy('createdAt', 'asc')
    return response.ok({ choices: choices.map((c) => new ChoiceDto(c)) })
  }

  async show({ params, auth, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    const choice = await Choice.findByOrFail('uuid', params.choiceUuid)
    return response.ok({ choice: new ChoiceDto(choice) })
  }

  async store({ params, auth, request, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    const storeSchema = vine.compile(
      vine.object({
        data: vine.object({
          id: vine.number(),
          title: vine.string(),
          description: vine.string(),
          choosen: vine.boolean(),
          isTrap: vine.boolean().optional(),
        }),
        selectedProofUuids: vine.array(vine.string()).optional(),
        selectedAlibiUuids: vine.array(vine.string()).optional(),
      })
    )

    const payload = await request.validateUsing(storeSchema)

    await game.load('choices')

    // Charger les preuves sélectionnées pour les inclure dans le prompt
    let selectedProofsContext = ''
    if (payload.selectedProofUuids && payload.selectedProofUuids.length > 0) {
      const selectedProofs = await Proof.query()
        .where('gameUuid', game.uuid)
        .whereIn('uuid', payload.selectedProofUuids)
      if (selectedProofs.length > 0) {
        selectedProofsContext = `\nPreuves sélectionnées par l'enquêteur :\n${selectedProofs
          .map((p) => `- ${p.data?.title || 'Preuve'} : ${p.content}`)
          .join('\n')}`
      }
    }

    // Charger les alibis sélectionnés
    let selectedAlibisContext = ''
    if (payload.selectedAlibiUuids && payload.selectedAlibiUuids.length > 0) {
      const selectedAlibis = await Alibi.query()
        .where('gameUuid', game.uuid)
        .whereIn('uuid', payload.selectedAlibiUuids)
      if (selectedAlibis.length > 0) {
        selectedAlibisContext = `\nAlibis fournis par le suspect :\n${selectedAlibis
          .map((a) => `- ${a.title} : ${a.content}`)
          .join('\n')}`
      }
    }

    const previousChoices = game.choices.map((c) => ({
      title: c.data.title,
      description: c.data.description,
      response: c.response,
      isTrap: c.data.isTrap,
    }))

    const prompt = `
RÔLE : Tu es la Juge Moreau. Tu réagis à la DÉFENSE de l'ACCUSÉ qui vient de présenter une piste/argument.

CONTEXTE : Tu juges l'accusé. Il essaie de se défendre en analysant les données accessibles dans la sidebar.
DONNÉES COMPLÈTES : ${JSON.stringify(game.data)}

HISTORIQUE DE LA DÉFENSE :
${JSON.stringify(previousChoices)}
${selectedProofsContext}${selectedAlibisContext}

L'ACCUSÉ VIENT DE CHOISIR : "${payload.data.title}" - ${payload.data.description}
${payload.data.isTrap ? '(⚠️ PIÈGE CHOISI - L\'accusé s\'est trompé)' : ''}

=== TA RÉACTION ===
Tu dois JUGER sa défense et RÉPONDRE EN LE PIÉGEANT.
Si sa défense tient bien = diminue sa culpabilité. Sinon = augmente-la.

MAX 250 caractères (compte chaque lettre, espace, ponctuation).

Génère ta réaction + 3 nouveaux choix de défense pour l'accusé (1 piège, 2 valides).

=== GUILTYΔELTA ===
- Bonne défense présentée : -20 à -15 (innocence prouvée)
- Défense ambiguë : -10 à -5
- Neutre : 0
- Mauvaise/PIÈGE choisi : +5 à +10 (preuve de culpabilité)
Choix du piège ajoute +10 minimum.

=== TITRES & PIÈGE ===
Les titres DOIVENT être NEUTRES et NE PAS révéler le piège.
Le piège DOIT être ALÉATOIRE : pas toujours id 2, peut être id 1, 2 ou 3.
Les 3 titres doivent sembler également crédibles/défendables.

Réponds UNIQUEMENT en JSON valide :
{
  "message": "Réaction de la Juge (MAX 250 caractères)",
  "guiltyDelta": 0,
  "nextChoices": [
    {"id": 1, "title": "Titre neutre et ambigu", "description": "...", "choosen": false, "isTrap": false},
    {"id": 2, "title": "Titre neutre et ambigu", "description": "...", "choosen": false, "isTrap": true},
    {"id": 3, "title": "Titre neutre et ambigu", "description": "...", "choosen": false, "isTrap": false}
  ]
}
Langue: français
    `.trim()

    let iaMessage = ''
    let guiltyDelta = 0
    let nextChoices: any[] = []

    try {
      const raw = await this.iaService.chat(prompt)
      const parsed = JSON.parse(raw)
      iaMessage = parsed.message || ''
      
      // Valider et limiter le message à 250 caractères pour les messages suivants (pas le premier)
      if (game.choices.length > 0 && iaMessage.length > 250) {
        iaMessage = iaMessage.substring(0, 247) + '...'
      }
      
      guiltyDelta = parsed.guiltyDelta || 0
      nextChoices = parsed.nextChoices || []
    } catch (error) {
      iaMessage = "La cour demande à l'enquêteur de présenter des preuves tangibles. Quelle piste souhaitez-vous explorer?"
      guiltyDelta = 0
      nextChoices = [
        { id: 1, title: "Examiner les données", description: 'Analyser les informations disponibles', choosen: false, isTrap: false },
        { id: 2, title: "Accuser sans preuves", description: 'Présenter ses accusations', choosen: false, isTrap: true },
        { id: 3, title: "Consulter les témoins", description: 'Vérifier les alibis', choosen: false, isTrap: false },
      ]
    }

    const choice = await Choice.create({
      gameUuid: game.uuid,
      data: { ...payload.data, choosen: true },
      response: iaMessage,
    })

    const newGuilty = Math.max(0, Math.min(100, game.guiltyPourcentage + guiltyDelta))
    game.guiltyPourcentage = newGuilty
    game.currentChoices = nextChoices
    await game.save()

    return response.ok({
      choice: new ChoiceDto(choice),
      guiltyPourcentage: game.guiltyPourcentage,
      nextChoices,
    })
  }
}
