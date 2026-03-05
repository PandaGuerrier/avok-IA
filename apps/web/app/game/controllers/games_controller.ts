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
      startAt: DateTime.now(),
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

    let initialMessage = game.initialMessage || ''
    let currentChoices = game.currentChoices

    if (game.choices.length === 0 && !game.currentChoices) {
      const history = (game.data as any)?.history
      const contacts = (game.data as any)?.contacts ?? []
      const suspectName = contacts[0]?.name ?? 'le suspect'

      const prompt = `
Tu joues le rôle de la Juge Moreau, présidente du tribunal dans un jeu de déduction policière.
Tu t'adresses directement à l'enquêteur chargé du dossier.

Contexte de l'affaire :
${history?.content ?? JSON.stringify(game.data)}

Données numériques saisies du suspect (Instagram, mails, agenda, notes) :
${JSON.stringify(game.data)}

L'enquêteur s'appelle : ${auth.user!.firstName}
Le suspect principal : ${suspectName}

Génère le message d'ouverture de la juge qui :
1. Salue l'enquêteur par son prénom de façon formelle
2. Présente brièvement l'affaire : qui est le suspect, quel est le crime présumé
3. Précise que les preuves matérielles sont disponibles dans le "dossier preuves" (bouton en haut à gauche)
4. Mentionne que l'enquêteur peut consulter les réseaux sociaux et données du suspect dans la sidebar
5. Invite à commencer l'analyse avec les 3 premières pistes proposées
Style : formel, sérieux, ton judiciaire. 3-4 phrases. Commence directement par "Maître [prénom]," ou "Enquêteur [prénom],".

Génère aussi 3 premiers choix d'action. EXACTEMENT 1 des 3 doit être un piège (isTrap: true).

Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après :
{
  "message": "Message de la juge en français",
  "nextChoices": [
    {"id": 1, "title": "Titre court", "description": "Description", "choosen": false, "isTrap": false},
    {"id": 2, "title": "Titre court", "description": "Description", "choosen": false, "isTrap": true},
    {"id": 3, "title": "Titre court", "description": "Description", "choosen": false, "isTrap": false}
  ]
}
Langue: français
      `.trim()

      try {
        const raw = await this.iaService.chat(prompt)
        const parsed = JSON.parse(raw)
        initialMessage = parsed.message || ''
        currentChoices = parsed.nextChoices || []

        game.currentChoices = currentChoices
        game.initialMessage = initialMessage
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
        game.initialMessage = initialMessage
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

    let resumeAtMs: number | null = null

    if (game.pausedAt && (game.startAt || game.resumeAt)) {
      const nowMs = Date.now()
      const pausedAtMs = game.pausedAt.toMillis()
      const baseMs = game.resumeAt?.toMillis() ?? game.startAt!.toMillis()
      const pauseDuration = Math.max(0, nowMs - pausedAtMs)
      resumeAtMs = baseMs + pauseDuration
      game.resumeAt = DateTime.fromMillis(resumeAtMs)
    }

    game.isPaused = false
    game.pausedAt = null
    await game.save()

    return response.ok({ resumeAtMs })
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
