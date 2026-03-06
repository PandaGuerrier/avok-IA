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
Tu es un enquêteur IA dans un jeu de déduction policière.
Tu analyses les données numériques d'un adolescent pour déterminer sa culpabilité.

Données du jeu :
${JSON.stringify(game.data)}

Historique des choix précédents :
${JSON.stringify(previousChoices)}
${selectedProofsContext}${selectedAlibisContext}

L'enquêteur vient de choisir : "${payload.data.title}" - ${payload.data.description}
${payload.data.isTrap ? '(Ce choix était un piège — l\'enquêteur s\'est trompé de piste)' : ''}

Génère une réponse narrative et 3 nouveaux choix. EXACTEMENT 1 des 3 choix doit être un piège (isTrap: true) — une option qui semble logique mais qui va dans le mauvais sens et augmentera la culpabilité. Les autres sont des pistes valides.

Le guiltyDelta doit être entre -15 et +15 (négatif = preuve d'innocence, positif = preuve de culpabilité). Si l'enquêteur utilisait de bonnes preuves et a fait un bon choix, le delta peut être plus négatif.

Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après :
{
  "message": "Réponse narrative (en français)",
  "guiltyDelta": 0,
  "nextChoices": [
    {"id": 1, "title": "Titre court", "description": "Description", "choosen": false, "isTrap": false},
    {"id": 2, "title": "Titre court", "description": "Description", "choosen": false, "isTrap": true},
    {"id": 3, "title": "Titre court", "description": "Description", "choosen": false, "isTrap": false}
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
      guiltyDelta = parsed.guiltyDelta || 0
      nextChoices = parsed.nextChoices || []
    } catch {
      iaMessage = "L'enquête continue. Analysez les prochains indices."
      guiltyDelta = 0
      nextChoices = [
        { id: 1, title: "Continuer l'analyse", description: 'Approfondir les recherches', choosen: false, isTrap: false },
        { id: 2, title: "Ignorer cet élément", description: 'Passer à autre chose', choosen: false, isTrap: true },
        { id: 3, title: "Reconsidérer les preuves", description: 'Revoir les éléments collectés', choosen: false, isTrap: false },
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
