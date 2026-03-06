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
      const history = (game.data as any)?.history
      const contacts = (game.data as any)?.contacts ?? []
      const suspectName = contacts[0]?.name ?? 'le suspect'
      const crimeContext = history?.content ? `Infraction: ${history.content.substring(0, 100)}...` : 'Infraction inconnue'

      const prompt = `
RÔLE : Tu es la Juge Moreau, présidente du tribunal. Tu JUGES l'accusé (l'utilisateur).

=== L'AFFAIRE ===
CONTEXTE DU CRIME : ${history?.content ?? 'Une infraction a été commise'}

QUI EST ACCUSÉ : ${auth.user!.firstName} ${auth.user!.lastName || ''}
SUSPECT PRINCIPAL DONT ON ANALYSE LES DONNÉES : ${suspectName}
(L'utilisateur doit analyser les données de ${suspectName} pour prouver son innocence)

DONNÉES À ANALYSER (accessibles dans la sidebar à gauche - réseaux sociaux) :
${JSON.stringify(game.data)}

=== TON DE LA JUGE ===
- Froide, procédurière, mais pas totalement insensible
- Tu soupçonnes l'accusé et tu l'accuses formellement
- Formes judiciaires : "${auth.user!.firstName}...", "La cour estime...", "Les preuves montrent..."
- Ton : accusateur et persuasif

=== RÔLES CLAIRS ===
TOI (Juge) : Tu accuses l'utilisateur d'être impliqué dans l'infraction concernant ${suspectName}, mais tu es compréhensive et tu lui donnes la chance de se défendre. Tu analyses les preuves qu'il présente.
L'UTILISATEUR (Accusé) : Doit se DÉFENDRE en trouvant des preuves d'innocence dans les réseaux sociaux/données disponibles à gauche

=== PREMIER MESSAGE (OUVERTURE DU PROCÈS) ===
OBLIGATOIRES :
1. Rappelle clairement l'ACCUSATION (pourquoi il est au tribunal)
2. Mentionne que ${suspectName} est impliqué(e) et que les données sont dans la SIDEBAR À GAUCHE
3. Invite l'accusé à se DÉFENDRE en présentant des preuves

NE MENTIONNE PAS "enquêteur", ni "maître" - il n'est qu'un ACCUSÉ qui doit prouver son innocence.

=== MESSAGES SUIVANTS ===
- Réponds à la DÉFENSE de l'utilisateur
- Essaie de le PIÉGER avec de fausses accusations ou des interprétations des preuves
- Propose 3 choix : 2 valides + 1 PIÈGE qui l'aggrave
- Réponses courtes uniquement (compte espaces et ponctuation!)

=== CHOIX D'ACTION ===
Propose EXACTEMENT 3 réponses possibles pour l'accusé, dont 1 PIÈGE :
- Choix 1 & 3 : Pistes de défense valides (isTrap: false)
- Choix 2 : PIÈGE qui l'incrimine davantage (isTrap: true)

EXEMPLES DE PIÈGES :
- Avouer quelque chose sans preuve
- Ignorer une incohérence dans sa défense
- Se contredire
- Faire confiance à un faux alibi

=== TITRES DES CHOIX ===
IMPORTANT : Les titres NE DOIVENT PAS révéler si c'est un piège.
Les titres doivent être NEUTRES et AMBIGUS pour que le joueur ne puisse pas identifier le piège.
Exemples de mauvais titres : "Mauvaise défense", "Option dangereuse"
Exemples de bons titres : "Analyser les fichiers supprimés", "Chercher des témoins", "Vérifier les logs"

=== POSITION DU PIÈGE ===
Le piège DOIT être ALÉATOIRE : il peut être dans n'importe lequel des 3 choix (id 1, 2 ou 3).
Pas toujours au même endroit!

=== FORMAT JSON ===
Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après :
{
  "message": "Message d'accusation du juge (réponses courtes obligatoires)",
  "nextChoices": [
    {"id": 1, "title": "Titre neutre et ambigu", "description": "Courte description", "choosen": false, "isTrap": false},
    {"id": 2, "title": "Titre neutre et ambigu", "description": "Courte description", "choosen": false, "isTrap": true},
    {"id": 3, "title": "Titre neutre et ambigu", "description": "Courte description", "choosen": false, "isTrap": false}
  ]
}
Langue: français
      `.trim()

      try {
        const raw = await this.iaService.chat([{ role: 'user', content: prompt }])
        const parsed = JSON.parse(raw)
        initialMessage = parsed.message || ''
        currentChoices = parsed.nextChoices || []

        game.currentChoices = currentChoices
        game.initialMessage = initialMessage
        await game.save()

        await game.load('proofs')
      } catch (error) {
        initialMessage = `${auth.user!.firstName}, vous comparaissez pour ${crimeContext}. Les preuves sont accessibles dans le dossier gauche. Présentez votre défense.`
        currentChoices = [
          { id: 1, title: 'Analyser les messages', description: 'Examiner les données du suspect', choosen: false, isTrap: false },
          { id: 2, title: 'Ignorer les incohérences', description: 'Se concentrer uniquement sur les preuves évidentes', choosen: false, isTrap: true },
          { id: 3, title: 'Consulter les alibis', description: 'Vérifier les déclarations du suspect', choosen: false, isTrap: false },
        ]
        game.currentChoices = currentChoices
        game.initialMessage = initialMessage
        await game.save()
      }
    }

    console.log('Initial message:', initialMessage)

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
Un accusé vient t'interroger pour prouver son innocence. Tu dois répondre EN CHARACTER, de façon naturelle et cohérente avec ton rôle.
Tu peux être coopératif, réticent, ou nerveux selon ce que tu sais — mais tu restes toi-même.

=== CONTEXTE DE L'AFFAIRE ===
Voici les données numériques de l'adolescent (messages Instagram, mails, agenda, notes scolaires) :
${JSON.stringify(game.data)}

=== AVANCEMENT DE L'INTERROGATOIRE ===
Étapes précédentes :
${choicesSummary || 'Aucune étape pour l\'instant.'}

Preuves collectées :
${proofsSummary || 'Aucune preuve pour l\'instant.'}

Niveau de culpabilité actuel : ${game.guiltyPourcentage}%

=== QUESTION POSÉE ===
"${payload.question}"

=== RÈGLES ===
- Ta réponse en 2-3 phrases, en français, comme si tu étais vraiment cette personne.
- Ne cite pas les données brutes, intègre-les naturellement.
- Si ta réponse AIDE l'accusé à prouver son innocence (alibi confirmé, contradiction révélée) : guiltyDelta négatif (-15 à -5).
- Si ta réponse est vague, ambiguë ou ne l'aide pas : guiltyDelta nul (0).
- Si ta réponse l'INCRIMINE davantage (tu contredis son alibi, tu révèles quelque chose de compromettant) : guiltyDelta positif (+5 à +15).

=== FORMAT DE RÉPONSE OBLIGATOIRE ===
Réponds UNIQUEMENT en JSON valide :
{
  "answer": "Ta réponse en tant que ${contact.name} (2-3 phrases)",
  "guiltyDelta": 0
}
`.trim()

    let answer = ''
    let guiltyDelta = 0
    try {
      const raw = await this.iaService.chat([{ role: 'user', content: prompt }])
      const parsed = JSON.parse(raw)
      answer = parsed.answer || ''
      guiltyDelta = parsed.guiltyDelta || 0
    } catch {
      answer = "Je... je ne sais pas trop quoi vous dire. C'est une situation difficile pour moi."
      guiltyDelta = 0
    }

    const newGuilty = Math.max(0, Math.min(100, game.guiltyPourcentage + guiltyDelta))
    game.guiltyPourcentage = newGuilty
    await game.save()

    // Réaction de la Juge au témoignage
    const judgePrompt = `
Tu es la Juge Moreau. Un accusé vient d'appeler le témoin ${contact.name} (${contact.role}) à la barre.

CONTEXTE DE L'AFFAIRE :
${JSON.stringify(game.data)}

QUESTION POSÉE PAR L'ACCUSÉ : "${payload.question}"

RÉPONSE DU TÉMOIN ${contact.name} : "${answer}"

CULPABILITÉ ACTUELLE : ${newGuilty}% (${guiltyDelta < 0 ? `ce témoignage a fait baisser la culpabilité de ${Math.abs(guiltyDelta)}%` : guiltyDelta > 0 ? `ce témoignage a fait monter la culpabilité de ${guiltyDelta}%` : 'ce témoignage n\'a pas changé la culpabilité'})

Réagis à ce témoignage EN TANT QUE JUGE, de façon compréhensive. Réponse courte (1-2 phrases) en français, en utilisant des formules judiciaires. Adapte ta réaction selon l'impact du témoignage sur la culpabilité :
- Si le témoignage aide l'accusé : tu restes sceptique, tu cherches la faille ("La cour note ce témoignage, mais...")
- S'il l'incrimine : tu t'engouffres dedans ("Voilà qui confirme les soupçons de la cour...")
- S'il est neutre : tu tranches court ("La cour en prend note.")

Réponds en une seule phrase directe, sans JSON.
`.trim()

    let judgeReaction = ''
    try {
      judgeReaction = await this.iaService.chat([{ role: 'user', content: judgePrompt }])
      if (judgeReaction.length > 200) judgeReaction = judgeReaction.substring(0, 197) + '...'
    } catch {
      judgeReaction = 'La cour prend note de ce témoignage.'
    }

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
