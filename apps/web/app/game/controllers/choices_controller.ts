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
- Tu dois proposer 3 nouvelles alternatives de défense pour ${auth.user!.firstName} (1 piège ALÉATOIRE, 2 valides).
- Les titres DOIVENT être NEUTRES et NE PAS révéler le piège.
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

    // ── Construction de l'historique conversationnel ──────────────────────────
    // Message système : contexte fixe de l'affaire + règles de réponse
    const systemMessage = `Tu es la Juge Moreau. Tu interroges un accusé dans un jeu de déduction policière.

L'ACCUSÉ (la personne que tu juges) : ${auth.user!.firstName} ${auth.user!.lastName || ''}
IMPORTANT : Les personnages dans les données ci-dessous (contacts, Instagram, mails...) sont des tiers — PAS l'accusé. L'accusé est ${auth.user!.firstName}, les autres sont des témoins/suspects à analyser.

DONNÉES COMPLÈTES DE L'AFFAIRE :
${JSON.stringify(game.data)}

=== RÈGLES ===
- Tu dois JUGER la défense de ${auth.user!.firstName} et répondre en le challengeant.
- Si sa défense tient bien : diminue la culpabilité. Sinon : augmente-la.
- MAX 250 caractères pour ton message (compte chaque lettre, espace, ponctuation).
- Génère toujours 3 nouveaux choix de défense (1 piège ALÉATOIRE, 2 valides).
- Les titres DOIVENT être NEUTRES et NE PAS révéler le piège.
- Le piège peut être id 1, 2 ou 3 (aléatoire, pas toujours le même).

=== GUILTYΔELTA ===
- Bonne défense avec preuve/alibi solide : -20 à -15
- Défense ambiguë : -10 à -5
- Neutre : 0
- Mauvaise défense : +5 à +10
- Piège choisi : +10 minimum

=== FORMAT DE RÉPONSE OBLIGATOIRE ===
Réponds UNIQUEMENT en JSON valide, sans texte avant ni après :
{
  "message": "Réaction de la Juge (MAX 250 caractères)",
  "guiltyDelta": 0,
  "nextChoices": [
    {"id": 1, "title": "Titre neutre", "description": "...", "choosen": false, "isTrap": false},
    {"id": 2, "title": "Titre neutre", "description": "...", "choosen": false, "isTrap": true},
    {"id": 3, "title": "Titre neutre", "description": "...", "choosen": false, "isTrap": false}
  ]
}
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
      payload.data.isTrap ? '(⚠️ C\'est un piège — l\'accusé s\'est trompé)' : '',
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
      guiltyDelta = parsed.guiltyDelta || 0
      nextChoices = parsed.nextChoices || []
    } catch (error) {
      console.error('[store] IA error:', error)
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
