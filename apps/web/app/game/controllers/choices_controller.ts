import { PassThrough } from 'node:stream'
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import IAService from '#ia/services/ia_service'
import Game from '#game/models/game'
import Choice from '#game/models/choice'
import Proof from '#game/models/proof'
import Alibi from '#game/models/alibi'
import ChoiceDto from '#game/dtos/choice'

const STREAM_DELIMITER = '---META---'

@inject()
export default class ChoicesController {
  constructor(protected iaService: IAService) {}

  async regenerate({ params, auth, request, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    const schema = vine.compile(
      vine.object({
        selectedProofUuids: vine.array(vine.string()).optional(),
        selectedAlibiUuids: vine.array(vine.string()).optional(),
      })
    )
    const payload = await request.validateUsing(schema)

    await game.load('choices')

    let selectedProofsContext = ''
    if (payload.selectedProofUuids?.length) {
      const selectedProofs = await Proof.query()
        .where('gameUuid', game.uuid)
        .whereIn('uuid', payload.selectedProofUuids)
      if (selectedProofs.length > 0) {
        selectedProofsContext = `\nPreuves actuellement sélectionnées :\n${selectedProofs
          .map((p) => `- ${p.data?.title || 'Preuve'} : ${p.content}`)
          .join('\n')}`
      }
    }

    let selectedAlibisContext = ''
    if (payload.selectedAlibiUuids?.length) {
      const selectedAlibis = await Alibi.query()
        .where('gameUuid', game.uuid)
        .whereIn('uuid', payload.selectedAlibiUuids)
      if (selectedAlibis.length > 0) {
        selectedAlibisContext = `\nAlibis actuellement sélectionnés :\n${selectedAlibis
          .map((a) => `- ${a.title} : ${a.content}`)
          .join('\n')}`
      }
    }

    const systemMessage = `Tu es la Juge Moreau. Tu interroges un accusé dans un jeu de déduction policière.

L'ACCUSÉ (la personne que tu juges) : ${auth.user!.firstName} ${auth.user!.lastName || ''}
IMPORTANT : Les personnages dans les données ci-dessous (contacts, Instagram, mails...) sont des tiers — PAS l'accusé. L'accusé est ${auth.user!.firstName}, les autres sont des témoins/suspects à analyser.

DONNÉES COMPLÈTES DE L'AFFAIRE :
${JSON.stringify(game.data)}

=== RÈGLES ===
- Tu dois proposer 3 nouvelles alternatives de défense pour ${auth.user!.firstName}, toutes valides (aucun piège).
- Les titres doivent être NEUTRES et variés — différentes stratégies de défense.
- Les choix doivent être cohérents avec l'état actuel de l'interrogatoire et les alibis/preuves sélectionnés.

=== FORMAT DE RÉPONSE OBLIGATOIRE ===
Réponds UNIQUEMENT en JSON valide :
{
  "nextChoices": [
    {"id": 1, "title": "Titre neutre", "description": "...", "choosen": false, "isTrap": false},
    {"id": 2, "title": "Titre neutre", "description": "...", "choosen": false, "isTrap": true},
    {"id": 3, "title": "Titre neutre", "description": "...", "choosen": false, "isTrap": false}
  ]
}
Langue : français`.trim()

    const historyMessages = game.choices.flatMap((c) => [
      { role: 'user' as const, content: `L'accusé a présenté : "${c.data.title}"${c.data.description ? ` — ${c.data.description}` : ''}` },
      { role: 'assistant' as const, content: JSON.stringify({ message: c.response, guiltyDelta: 0, nextChoices: [] }) },
    ])

    const currentUserContent = [
      "L'accusé demande de nouvelles options de défense.",
      `Culpabilité actuelle : ${game.guiltyPourcentage}%.`,
      selectedProofsContext,
      selectedAlibisContext,
      'Génère 3 nouvelles alternatives cohérentes avec la situation.',
    ]
      .filter(Boolean)
      .join('\n')

    const messages = [
      { role: 'system' as const, content: systemMessage },
      ...historyMessages,
      { role: 'user' as const, content: currentUserContent },
    ]

    try {
      const raw = await this.iaService.chat(messages)
      // Strip potential markdown code blocks from IA response
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
      const parsed = JSON.parse(cleaned)
      const nextChoices = parsed.nextChoices || parsed.choices || []
      if (!Array.isArray(nextChoices) || nextChoices.length === 0) {
        throw new Error('Empty or invalid nextChoices in IA response')
      }
      game.currentChoices = nextChoices
      await game.save()
      return response.ok({ nextChoices })
    } catch (err) {
      console.error('[regenerate] IA error:', err)
      return response.internalServerError({ error: 'Impossible de générer de nouveaux choix.' })
    }
  }

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
          description: vine.string().optional(),
          choosen: vine.boolean(),
          isTrap: vine.boolean().optional(),
        }),
        selectedProofUuids: vine.array(vine.string()).optional(),
        selectedAlibiUuids: vine.array(vine.string()).optional(),
      })
    )

    const payload = await request.validateUsing(storeSchema)

    await game.load('choices')

    // Charger les preuves sélectionnées
    let selectedProofsContext = ''
    if (payload.selectedProofUuids && payload.selectedProofUuids.length > 0) {
      const selectedProofs = await Proof.query()
        .where('gameUuid', game.uuid)
        .whereIn('uuid', payload.selectedProofUuids)
      if (selectedProofs.length > 0) {
        selectedProofsContext = `\nPreuves présentées par l'accusé :\n${selectedProofs
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
        selectedAlibisContext = `\nAlibis fournis par l'accusé :\n${selectedAlibis
          .map((a) => `- ${a.title} : ${a.content}`)
          .join('\n')}`
      }
    }

    // ── Calcul du temps écoulé pour adapter la difficulté ─────────────────────
    const startMs = game.startAt?.toMillis() ?? game.createdAt.toMillis()
    const elapsedMin = (Date.now() - startMs - (game.totalPausedMs ?? 0)) / 60_000
    const isEarlyGame = elapsedMin < 5

    const judgePersonality = isEarlyGame
      ? `- Ton : intransigeant et implacable — tu ne cèdes rien sans preuve béton
- Tu contre-attaques chaque argument, même les bons, en cherchant la faille
- Tu rappelles systématiquement les charges les plus lourdes après chaque réplique
- Tu ignores les alibis vagues et les déclarations sans preuve matérielle`
      : `- Ton : sceptique et exigeant — tu remets en cause chaque argument
- Tu demandes des preuves concrètes et ne te laisses pas convaincre facilement
- Tu rappelles les éléments à charge entre chaque réponse`

    const guiltyRules = isEarlyGame
      ? `=== GUILTYDELTA (TOUJOURS NÉGATIF MAIS FAIBLE) ===
- Preuve directe et irréfutable : -10 à -7
- Argument pertinent avec preuve : -6 à -5
- Argument sans preuve concrète : -5
- La juge est très difficile à ébranler en début de procès — les baisses sont minimes
- JAMAIS 0 ou positif`
      : `=== GUILTYDELTA (TOUJOURS NÉGATIF) ===
- Preuve directe et irréfutable : -15 à -10
- Argument pertinent avec preuve : -9 à -6
- Argument sans preuve concrète : -5
- JAMAIS 0 ou positif`

    // ── Construction de l'historique conversationnel ──────────────────────────
    // Message système : contexte fixe de l'affaire + règles de réponse
    const systemMessage = `Tu es la Juge Moreau. Tu interroges un accusé dans un jeu de déduction policière.

L'ACCUSÉ (la personne que tu juges) : ${auth.user!.firstName} ${auth.user!.lastName || ''}
IMPORTANT : Les personnages dans les données ci-dessous (contacts, Instagram, mails...) sont des tiers — PAS l'accusé. L'accusé est ${auth.user!.firstName}, les autres sont des témoins/suspects à analyser.

DONNÉES COMPLÈTES DE L'AFFAIRE :
${JSON.stringify(game.data)}

=== PERSONNALITÉ DE LA JUGE (${isEarlyGame ? 'phase initiale — intransigeante' : 'phase avancée — exigeante'}) ===
${judgePersonality}
- Réponse courte uniquement.
- Génère toujours 3 nouveaux choix de défense, tous valides (aucun piège).

${guiltyRules}

=== FORMAT DE RÉPONSE OBLIGATOIRE ===
Réponds UNIQUEMENT en JSON valide, sans texte avant ni après :
{
  "message": "Réaction de la Juge (MAX 250 caractères)",
  "guiltyDelta": -10,
  "nextChoices": [
    {"id": 1, "title": "Titre neutre", "description": "...", "choosen": false, "isTrap": false},
    {"id": 2, "title": "Titre neutre", "description": "...", "choosen": false, "isTrap": false},
    {"id": 3, "title": "Titre neutre", "description": "...", "choosen": false, "isTrap": false}
  ]
}

isTrap est toujours false.
Langue : français`.trim()

    // Paires user/assistant pour chaque échange précédent (historique complet)
    const historyMessages = game.choices.flatMap((c) => [
      {
        role: 'user' as const,
        content: `L'accusé présente : "${c.data.title}" — ${c.data.description}`,
      },
      {
        role: 'assistant' as const,
        // On stocke la réponse texte ; on reconstruit un JSON minimal pour cohérence de format
        content: JSON.stringify({ message: c.response, guiltyDelta: 0, nextChoices: [] }),
      },
    ])

    // Message utilisateur actuel : le nouveau choix + preuves/alibis sélectionnés
    const currentUserContent = [
      `L'accusé présente : "${payload.data.title}"${payload.data.description ? ` — ${payload.data.description}` : ''}`,
      selectedProofsContext,
      selectedAlibisContext,
    ]
      .filter(Boolean)
      .join('\n')

    const messages = [
      { role: 'system' as const, content: systemMessage },
      ...historyMessages,
      { role: 'user' as const, content: currentUserContent },
    ]

    let iaMessage = ''
    let guiltyDelta = 0
    let nextChoices: any[] = []

    try {
      const raw = await this.iaService.chat(messages)
      const parsed = JSON.parse(raw)
      iaMessage = parsed.message || ''
      if (iaMessage.length > 250) {
        iaMessage = iaMessage.substring(0, 247) + '...'
      }
      guiltyDelta = parsed.guiltyDelta || -5
      nextChoices = parsed.nextChoices || []
    } catch (error) {
      console.error('[store] IA error:', error)
      iaMessage = "La cour prend note de cet argument. L'accusé peut continuer sa défense."
      guiltyDelta = -5
      nextChoices = [
        { id: 1, title: 'Présenter un alibi', description: 'Faire appel à un témoin de confiance', choosen: false, isTrap: false },
        { id: 2, title: 'Analyser les données', description: 'Examiner les informations disponibles', choosen: false, isTrap: false },
        { id: 3, title: 'Contester les preuves', description: 'Remettre en cause les éléments à charge', choosen: false, isTrap: false },
      ]
    }

    // Garantie : le delta est toujours négatif (chaque action aide l'accusé)
    guiltyDelta = Math.min(guiltyDelta, -5)

    const choice = await Choice.create({
      gameUuid: game.uuid,
      // @ts-ignore
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

  async storeStream({ params, auth, request, response }: HttpContext) {
    const game = await Game.findByOrFail('uuid', params.uuid)
    if (game.userUuid !== auth.user!.uuid) return response.unauthorized()

    const storeSchema = vine.compile(
      vine.object({
        data: vine.object({
          id: vine.number(),
          title: vine.string(),
          description: vine.string().optional(),
          choosen: vine.boolean(),
          isTrap: vine.boolean().optional(),
        }),
        selectedProofUuids: vine.array(vine.string()).optional(),
        selectedAlibiUuids: vine.array(vine.string()).optional(),
      })
    )

    const payload = await request.validateUsing(storeSchema)
    await game.load('choices')

    // Load selected proofs context
    let selectedProofsContext = ''
    if (payload.selectedProofUuids?.length) {
      const selectedProofs = await Proof.query()
        .where('gameUuid', game.uuid)
        .whereIn('uuid', payload.selectedProofUuids)
      if (selectedProofs.length > 0) {
        selectedProofsContext = `\nPreuves présentées par l'accusé :\n${selectedProofs
          .map((p) => `- ${p.data?.title || 'Preuve'} : ${p.content}`)
          .join('\n')}`
      }
    }

    // Load selected alibis context
    let selectedAlibisContext = ''
    if (payload.selectedAlibiUuids?.length) {
      const selectedAlibis = await Alibi.query()
        .where('gameUuid', game.uuid)
        .whereIn('uuid', payload.selectedAlibiUuids)
      if (selectedAlibis.length > 0) {
        selectedAlibisContext = `\nAlibis fournis par l'accusé :\n${selectedAlibis
          .map((a) => `- ${a.title} : ${a.content}`)
          .join('\n')}`
      }
    }

    const startMs = game.startAt?.toMillis() ?? game.createdAt.toMillis()
    const elapsedMin = (Date.now() - startMs - (game.totalPausedMs ?? 0)) / 60_000
    const isEarlyGame = elapsedMin < 5

    const judgePersonality = isEarlyGame
      ? `- Ton : intransigeant et implacable — tu ne cèdes rien sans preuve béton
- Tu contre-attaques chaque argument, même les bons, en cherchant la faille
- Tu rappelles systématiquement les charges les plus lourdes après chaque réplique
- Tu ignores les alibis vagues et les déclarations sans preuve matérielle`
      : `- Ton : sceptique et exigeant — tu remets en cause chaque argument
- Tu demandes des preuves concrètes et ne te laisses pas convaincre facilement
- Tu rappelles les éléments à charge entre chaque réponse`

    const guiltyRules = isEarlyGame
      ? `=== GUILTYDELTA (TOUJOURS NÉGATIF MAIS FAIBLE) ===
- Preuve directe et irréfutable : -10 à -7
- Argument pertinent avec preuve : -6 à -5
- Argument sans preuve concrète : -5
- La juge est très difficile à ébranler en début de procès — les baisses sont minimes
- JAMAIS 0 ou positif`
      : `=== GUILTYDELTA (TOUJOURS NÉGATIF) ===
- Preuve directe et irréfutable : -15 à -10
- Argument pertinent avec preuve : -9 à -6
- Argument sans preuve concrète : -5
- JAMAIS 0 ou positif`

    const systemMessage = `Tu es la Juge Moreau. Tu interroges un accusé dans un jeu de déduction policière.

L'ACCUSÉ (la personne que tu juges) : ${auth.user!.firstName} ${auth.user!.lastName || ''}
IMPORTANT : Les personnages dans les données ci-dessous (contacts, Instagram, mails...) sont des tiers — PAS l'accusé. L'accusé est ${auth.user!.firstName}, les autres sont des témoins/suspects à analyser.

DONNÉES COMPLÈTES DE L'AFFAIRE :
${JSON.stringify(game.data)}

=== PERSONNALITÉ DE LA JUGE (${isEarlyGame ? 'phase initiale — intransigeante' : 'phase avancée — exigeante'}) ===
${judgePersonality}
- Réponse courte uniquement.
- Génère toujours 3 nouveaux choix de défense, tous valides (aucun piège).

${guiltyRules}

=== FORMAT DE RÉPONSE OBLIGATOIRE ===
Réponds avec ce format EXACT en deux parties séparées par ${STREAM_DELIMITER} :
[Ta réaction en texte libre, MAX 250 caractères]
${STREAM_DELIMITER}
{"guiltyDelta": -10, "nextChoices": [{"id":1,"title":"Titre neutre","description":"...","choosen":false,"isTrap":false},{"id":2,"title":"Titre neutre","description":"...","choosen":false,"isTrap":false},{"id":3,"title":"Titre neutre","description":"...","choosen":false,"isTrap":false}]}

isTrap est toujours false.
Langue : français`.trim()

    const historyMessages = game.choices.flatMap((c) => [
      { role: 'user' as const, content: `L'accusé présente : "${c.data.title}" — ${c.data.description}` },
      { role: 'assistant' as const, content: c.response },
    ])

    const currentUserContent = [
      `L'accusé présente : "${payload.data.title}"${payload.data.description ? ` — ${payload.data.description}` : ''}`,
      selectedProofsContext,
      selectedAlibisContext,
    ]
      .filter(Boolean)
      .join('\n')

    const messages = [
      { role: 'system' as const, content: systemMessage },
      ...historyMessages,
      { role: 'user' as const, content: currentUserContent },
    ]

    const passThrough = new PassThrough()
    response.header('Content-Type', 'text/event-stream')
    response.header('Cache-Control', 'no-cache, no-transform')
    response.header('Connection', 'keep-alive')
    response.header('X-Accel-Buffering', 'no')

    const sendEvent = (data: object) => {
      if (!passThrough.destroyed) {
        passThrough.write(`data: ${JSON.stringify(data)}\n\n`)
      }
    }

    ;(async () => {
      let accumulated = ''
      let delimFound = false
      let streamed = 0

      try {
        for await (const chunk of this.iaService.streamChat(messages)) {
          accumulated += chunk

          if (!delimFound) {
            const delimIdx = accumulated.indexOf(STREAM_DELIMITER)
            if (delimIdx !== -1) {
              delimFound = true
              const textBefore = accumulated.slice(0, delimIdx)
              const remaining = textBefore.slice(streamed).trimStart()
              if (remaining) sendEvent({ type: 'chunk', content: remaining })
            } else {
              // Stream up to a safe position (keep last DELIM.length chars buffered)
              const safeEnd = Math.max(streamed, accumulated.length - STREAM_DELIMITER.length)
              if (safeEnd > streamed) {
                const newContent = accumulated.slice(streamed, safeEnd)
                if (newContent) {
                  sendEvent({ type: 'chunk', content: newContent })
                  streamed = safeEnd
                }
              }
            }
          }
        }

        // Parse metadata after stream ends
        let iaMessage = ''
        let guiltyDelta = -5
        let nextChoices: any[] = []

        const delimIdx = accumulated.indexOf(STREAM_DELIMITER)
        if (delimIdx !== -1) {
          iaMessage = accumulated.slice(0, delimIdx).trim()
          const metaStr = accumulated.slice(delimIdx + STREAM_DELIMITER.length).trim()
          const cleaned = metaStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
          try {
            const meta = JSON.parse(cleaned)
            guiltyDelta = meta.guiltyDelta ?? -5
            nextChoices = meta.nextChoices ?? []
          } catch {
            // Use defaults
          }
        } else {
          // Fallback: try parsing the whole thing as JSON
          iaMessage = accumulated.trim()
          try {
            const parsed = JSON.parse(accumulated)
            iaMessage = parsed.message || accumulated
            guiltyDelta = parsed.guiltyDelta ?? -5
            nextChoices = parsed.nextChoices ?? []
          } catch {
            // Keep raw text as message
          }
        }

        if (iaMessage.length > 250) iaMessage = iaMessage.substring(0, 247) + '...'
        guiltyDelta = Math.min(guiltyDelta, -5)

        const choice = await Choice.create({
          gameUuid: game.uuid,
          // @ts-ignore
          data: { ...payload.data, choosen: true },
          response: iaMessage,
        })

        const newGuilty = Math.max(0, Math.min(100, game.guiltyPourcentage + guiltyDelta))
        game.guiltyPourcentage = newGuilty
        game.currentChoices = nextChoices
        await game.save()

        sendEvent({
          type: 'done',
          choice: new ChoiceDto(choice),
          guiltyPourcentage: game.guiltyPourcentage,
          nextChoices,
        })
      } catch (err) {
        console.error('[storeStream] error:', err)
        sendEvent({ type: 'error' })
      } finally {
        passThrough.end()
      }
    })()

    return response.stream(passThrough)
  }
}
