import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import vine from '@vinejs/vine'
import GameService from '#game/services/game_service'
import Game from '#game/models/game'
import Proof from '#game/models/proof'
import GameDto from '#game/dtos/game'

@inject()
export default class GamesController {
  constructor(protected gameService: GameService) {}

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
    const { data, history } = await this.gameService.init(auth.user!)

    const game = await Game.create({
      data,
      userUuid: auth.user!.uuid,
      startAt: DateTime.now(),
    })

    await Promise.all([
      ...history.imageProofs.map((p) =>
        Proof.create({
          gameUuid: game.uuid,
          imageUrl: p.url,
          data: { title: p.nom, type: 'image' },
        })
      ),
      ...history.pdfProofs.map((p) =>
        Proof.create({
          gameUuid: game.uuid,
          content: p.texte,
          data: { title: p.nom, type: 'pdf' },
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
      const result = await this.gameService.generateInitialMessage(game, auth.user!)
      initialMessage = result.initialMessage
      currentChoices = result.currentChoices
      await game.load('proofs')
    }

    return inertia.render('game/start', {
      game: new GameDto(game),
      initialMessage,
      currentChoices: currentChoices ?? [],
    })
  }

  async updateGuilty({ params, auth, request, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)

    if (game.userUuid !== auth.user!.uuid) {
      return response.unauthorized()
    }

    const schema = vine.compile(
      vine.object({
        guiltyPourcentage: vine.number().min(0).max(100),
      })
    )

    const payload = await request.validateUsing(schema)
    const result = await this.gameService.updateGuiltyScore(game, payload.guiltyPourcentage)

    return response.ok(result)
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

    const { answer, guiltyDelta } = await this.gameService.interrogateContact(
      game,
      contact,
      payload.question
    )

    const { guiltyPourcentage: newGuilty } = await this.gameService.updateGuiltyScore(
      game,
      game.guiltyPourcentage + guiltyDelta
    )

    const judgeReaction = await this.gameService.getJudgeReaction({
      contactName: contact.name,
      contactRole: contact.role,
      question: payload.question,
      answer,
      guiltyDelta,
      newGuilty,
      gameData: game.data,
    })

    return response.ok({ answer, contactName: contact.name, guiltyPourcentage: newGuilty, judgeReaction })
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
