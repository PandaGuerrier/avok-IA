import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import GameService from '#game/services/game_service'
import IAService from '#ia/services/ia_service'
import Game from '#game/models/game'
import Proof from '#game/models/proof'
import GameDto from '#game/dtos/game'

@inject()
export default class GamesController {
  constructor(
    protected gameService: GameService,
    protected iaService: IAService
  ) {}

  async index({ auth, inertia }: HttpContext) {
    const games = await Game.query()
      .where('userUuid', auth.user!.uuid)
      .orderBy('createdAt', 'desc')
      .limit(10)

    return inertia.render('game/index', {
      games: games.map((g) => ({
        uuid: g.uuid,
        isFinished: g.isFinished,
        guiltyPourcentage: g.guiltyPourcentage,
        createdAt: g.createdAt,
      })),
    })
  }

  async store({ auth, response }: HttpContext) {
    const defaultData = await this.gameService.init(auth.user!)

    const game = await Game.create({
      data: defaultData,
      userUuid: auth.user!.uuid,
    })

    return response.redirect().toRoute('game.start', { uuid: game.uuid })
  }

  async show({ params, auth, response, inertia }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)

    if (game.userUuid !== auth.user!.uuid) {
      return response.unauthorized()
    }

    await game.load('choices')
    await game.load('proofs')
    await game.load('user')

    let initialMessage = ''
    let currentChoices: any[] = []

    if (game.choices.length === 0) {
      const prompt = `
Tu es un enquêteur IA dans un jeu de déduction policière.
Tu analyses les données numériques d'un adolescent pour déterminer sa culpabilité.

Voici les données du jeu :
${JSON.stringify(game.data)}

C'est le début de l'enquête. Génère un message d'introduction et 3 choix d'action. EXACTEMENT 1 des 3 choix doit être un piège (isTrap: true) qui mènera l'enquêteur sur une fausse piste.

Génère aussi 2 à 3 preuves initiales tirées des données.

Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après :
{
  "message": "Message d'introduction (en français)",
  "nextChoices": [
    {"id": 1, "title": "Titre court", "description": "Description", "choosen": false, "isTrap": false},
    {"id": 2, "title": "Titre court", "description": "Description", "choosen": false, "isTrap": true},
    {"id": 3, "title": "Titre court", "description": "Description", "choosen": false, "isTrap": false}
  ],
  "newProofs": [
    {"title": "Titre de la preuve", "content": "Contenu détaillé", "type": "instagram|mail|note|calendar"}
  ]
}
Langue: français
      `.trim()

      try {
        const raw = await this.iaService.chat(prompt)
        const parsed = JSON.parse(raw)
        initialMessage = parsed.message || ''
        currentChoices = parsed.nextChoices || []

        // Sauvegarder les preuves initiales
        for (const p of parsed.newProofs || []) {
          await Proof.create({
            gameUuid: game.uuid,
            content: p.content,
            data: { title: p.title, type: p.type },
          })
        }

        // Recharger les preuves après insertion
        await game.load('proofs')
      } catch {
        initialMessage = "Bienvenue dans l'enquête. Analysez les données pour déterminer la culpabilité."
        currentChoices = [
          { id: 1, title: 'Analyser les messages', description: 'Examiner les conversations Instagram', choosen: false, isTrap: false },
          { id: 2, title: 'Ignorer les alibis', description: 'Se concentrer uniquement sur les charges', choosen: false, isTrap: true },
          { id: 3, title: 'Lire les mails', description: 'Consulter la boîte mail', choosen: false, isTrap: false },
        ]
      }
    } else {
      // Partie en cours — reconstruire les derniers choix depuis le dernier message de l'IA
      // (les currentChoices sont vides, la page reconstruit depuis choices)
    }

    return inertia.render('game/start', {
      game: new GameDto(game),
      initialMessage,
      currentChoices,
    })
  }

  async update({ params, auth, request, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)

    if (game.userUuid !== auth.user!.uuid) {
      return response.unauthorized()
    }

    const updateSchema = vine.compile(
      vine.object({
        guiltyPourcentage: vine.number().min(0).max(100).optional(),
        isFinished: vine.boolean().optional(),
      })
    )

    const payload = await request.validateUsing(updateSchema)

    if (payload.guiltyPourcentage !== undefined) {
      game.guiltyPourcentage = payload.guiltyPourcentage
    }
    if (payload.isFinished !== undefined) {
      game.isFinished = payload.isFinished
    }

    await game.save()
    return response.ok({ game: { uuid: game.uuid, guiltyPourcentage: game.guiltyPourcentage, isFinished: game.isFinished } })
  }

  async result({ params, auth, response, inertia }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)

    if (game.userUuid !== auth.user!.uuid) {
      return response.unauthorized()
    }

    await game.load('choices')
    await game.load('proofs')
    await game.load('user')

    return inertia.render('game/result', {
      game: new GameDto(game),
    })
  }
}
