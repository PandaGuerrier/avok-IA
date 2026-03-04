import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
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
    const { data, script } = await this.gameService.init(auth.user!)

    const game = await Game.create({
      data,
      userUuid: auth.user!.uuid,
      startTime: DateTime.now(),
    })

    await Promise.all([
      ...script.images.map((label, i) =>
        Proof.create({
          gameUuid: game.uuid,
          imageUrl: `/images/histories/${script.id}/img-${i + 1}.png`,
          data: { title: label, type: 'image' },
        })
      ),
      ...script.pdf.map((pdfText, i) =>
        Proof.create({
          gameUuid: game.uuid,
          content: pdfText,
          data: { title: `Document ${i + 1}`, type: 'pdf' },
        })
      ),
    ])

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
    await game.load('alibis')

    let initialMessage = ''
    let currentChoices = game.currentChoices

    if (game.choices.length === 0 && !game.currentChoices) {
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
}
Langue: français
      `.trim()

      try {
        const raw = await this.iaService.chat(prompt)
        const parsed = JSON.parse(raw)
        initialMessage = parsed.message || ''
        currentChoices = parsed.nextChoices || []

        game.currentChoices = currentChoices
        await game.save()

        await game.load('proofs')
      } catch {
        initialMessage = "Bienvenue dans l'enquête. Analysez les données pour déterminer la culpabilité."
        currentChoices = [
          { id: 1, title: 'Analyser les messages', description: 'Examiner les conversations Instagram', choosen: false, isTrap: false },
          { id: 2, title: 'Ignorer les alibis', description: 'Se concentrer uniquement sur les charges', choosen: false, isTrap: true },
          { id: 3, title: 'Lire les mails', description: 'Consulter la boîte mail', choosen: false, isTrap: false },
        ]
        game.currentChoices = currentChoices
        await game.save()
      }
    }

    return inertia.render('game/start', {
      game: new GameDto(game),
      initialMessage,
      currentChoices: currentChoices ?? [],
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

  async pause({ params, auth, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)

    if (game.userUuid !== auth.user!.uuid) {
      return response.unauthorized()
    }

    game.isPaused = true
    game.pausedAt = DateTime.now()
    await game.save()

    return response.ok({ isPaused: game.isPaused, pausedAt: game.pausedAt })
  }

  async resume({ params, auth, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)

    if (game.userUuid !== auth.user!.uuid) {
      return response.unauthorized()
    }

    if (game.pausedAt) {
      const additionalMs = DateTime.now().diff(game.pausedAt).milliseconds
      game.totalPausedMs = (game.totalPausedMs ?? 0) + additionalMs
    }

    game.isPaused = false
    game.pausedAt = null
    await game.save()

    return response.ok({ isPaused: game.isPaused, totalPausedMs: game.totalPausedMs })
  }

  async interrogate({ params, auth, request, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)

    if (game.userUuid !== auth.user!.uuid) {
      return response.unauthorized()
    }

    const schema = vine.compile(
      vine.object({
        contactId: vine.number(),
        question: vine.string().minLength(1),
      })
    )

    const payload = await request.validateUsing(schema)

    const contacts = (game.data as any)?.contacts ?? []
    const contact = contacts.find((c: any) => c.id === payload.contactId)

    if (!contact) {
      return response.notFound({ error: 'Contact introuvable' })
    }

    await game.load('choices')
    await game.load('proofs')

    const choicesSummary = game.choices.map((c) => `- ${c.data.title} : ${c.response || ''}`).join('\n')
    const proofsSummary = game.proofs.map((p) => `- ${p.data?.title || 'Preuve'} : ${p.content}`).join('\n')

    const prompt = `
Tu es ${contact.name}, ${contact.role} de l'adolescent faisant l'objet d'une enquête policière.
Un enquêteur vient t'interroger. Tu dois répondre EN CHARACTER, de façon naturelle et cohérente avec ton rôle et ce que tu sais.
Tu peux être coopératif, réticent, ou nerveux selon ce que tu sais — mais tu restes toi-même.

=== CONTEXTE DE L'AFFAIRE ===
Voici les données numériques de l'adolescent (messages Instagram, mails, agenda, notes scolaires) qui ont été récupérées dans l'enquête. Tu connais cet adolescent et certains de ces éléments te sont familiers :
${JSON.stringify(game.data)}

=== CE QUE L'ENQUÊTEUR A DÉCOUVERT ===
Étapes de l'enquête (décisions prises et réponses reçues) :
${choicesSummary || 'Aucune étape pour l\'instant.'}

Preuves collectées :
${proofsSummary || 'Aucune preuve pour l\'instant.'}

Niveau de culpabilité actuel estimé par l'enquêteur : ${game.guiltyPourcentage}%

=== QUESTION DE L'ENQUÊTEUR ===
"${payload.question}"

Réponds en 2-3 phrases maximum, en français, comme si tu étais vraiment cette personne. Ne cite pas les données brutes, intègre-les naturellement dans ta réponse.
`.trim()

    let answer = ''
    try {
      answer = await this.iaService.chat(prompt)
    } catch {
      answer = "Je... je ne sais pas trop quoi vous dire. C'est une situation difficile pour moi."
    }

    return response.ok({ answer, contactName: contact.name })
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
