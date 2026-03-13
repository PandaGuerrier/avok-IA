import { inject } from '@adonisjs/core'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import fs from 'node:fs/promises'
import path from 'node:path'
import transmit from '@adonisjs/transmit/services/main'
import IAService from '#ia/services/ia_service'
import User from '#users/models/user'
import Game from '#game/models/game'
import type DataGameType from '#game/types/data'
import { getLeaderboardEntries } from '#game/controllers/leaderboard_controller'

export interface HistoryPreuve {
  nom: string
  type: 'image' | 'pdf'
  texte?: string
}

export interface HistoryPost {
  postId: number
  content: string
}

export interface HistoryJson {
  content: string
  // Format v1
  preuves?: HistoryPreuve[]
  posts?: HistoryPost[]
  // Format v2
  instagram_posts?: string[]
  images?: string[]
  pdf?: string[]
}

export interface StaticPost {
  postId: number
  content: string
  imageUrl: string
  username?: string
}

export interface LoadedHistory {
  id: string
  json: HistoryJson
  imageProofs: { nom: string; url: string }[]
  pdfProofs: { nom: string; texte: string }[]
  staticPosts: StaticPost[]
}

/**
 * Parse a v2 instagram_post string like:
 * "@chloe.smn : Selfie... Légende : « caption » (Posté le...)"
 */
function parseInstagramPostString(postStr: string, index: number, picked: string): StaticPost {
  const usernameMatch = postStr.match(/^@([\w.]+)/)
  const username = usernameMatch ? `@${usernameMatch[1]}` : undefined
  const captionMatch = postStr.match(/«\s*(.*?)\s*»/)
  const content = captionMatch ? captionMatch[1] : postStr
  const imageUrl = username ? `/images/histories/${picked}/Posts/${username}.png` : ''
  return { postId: index + 1, content, imageUrl, username }
}

@inject()
export default class GameService {
  constructor(protected ia: IAService) {}

  async loadRandom(): Promise<LoadedHistory> {
    const historiesPath = app.publicPath('images/histories')

    const entries = await fs.readdir(historiesPath, { withFileTypes: true })
    const dirs = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort((a, b) => Number(a) - Number(b))

    if (dirs.length === 0) throw new Error('Aucune histoire trouvée dans public/histories/')

    const picked = dirs[Math.floor(Math.random() * dirs.length)]
    const folderPath = path.join(historiesPath, picked)

    const json = JSON.parse(
      await fs.readFile(path.join(folderPath, 'histoire.json'), 'utf-8')
    ) as HistoryJson

    // ── Proofs ───────────────────────────────────────────────────────────────

    // v1 format: preuves[]
    const imageProofs: { nom: string; url: string }[] = (json.preuves ?? [])
      .filter((p) => p.type === 'image')
      .map((p) => ({ nom: p.nom, url: `/images/histories/${picked}/${p.nom}.png` }))

    const pdfProofs: { nom: string; texte: string }[] = (json.preuves ?? [])
      .filter((p) => p.type === 'pdf')
      .map((p) => ({ nom: p.nom, texte: p.texte ?? '' }))

    // v2 format: images[] + pdf[]
    for (const img of json.images ?? []) {
      const nom = img.replace(/\.(png|jpg|webp)$/i, '')
      imageProofs.push({ nom, url: `/images/histories/${picked}/${img}` })
    }
    ;(json.pdf ?? []).forEach((texte, i) => {
      pdfProofs.push({ nom: `Document ${i + 1}`, texte })
    })

    // ── Static posts ──────────────────────────────────────────────────────────

    let staticPosts: StaticPost[] = []

    if (json.instagram_posts && json.instagram_posts.length > 0) {
      // v2 format: parse @username + caption from string
      staticPosts = json.instagram_posts.map((postStr, i) =>
        parseInstagramPostString(postStr, i, picked)
      )
    } else if (json.posts && json.posts.length > 0) {
      // v1 format: assign images from Posts/ folder by index
      let postFiles: string[] = []
      try {
        postFiles = (await fs.readdir(path.join(folderPath, 'Posts')))
          .filter((f) => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp'))
          .sort()
      } catch {
        // No Posts/ folder
      }

      staticPosts = json.posts.map((p, i) => ({
        postId: p.postId,
        content: p.content,
        imageUrl: postFiles[i] ? `/images/histories/${picked}/Posts/${postFiles[i]}` : '',
      }))
    }

    return { id: picked, json, imageProofs, pdfProofs, staticPosts }
  }

  async init(user: User): Promise<{ data: DataGameType; history: LoadedHistory }> {
    const history = await this.loadRandom()

    const staticPostsForIA = history.staticPosts.map((p) => ({
      postId: p.postId,
      content: p.content,
    }))

    const rawData = await this.ia.generateData(user, history, staticPostsForIA)
    const cleaned = rawData.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const data = JSON.parse(cleaned) as DataGameType

    data.history = { id: history.id, content: history.json.content }

    // Merge static posts (fixed content + imageUrl) with IA-generated comments
    if (history.staticPosts.length > 0) {
      const aiPosts = data.insta?.posts ?? []
      data.insta.posts = history.staticPosts.map((staticPost, i) => ({
        postId: staticPost.postId,
        content: staticPost.content,
        imageUrl: staticPost.imageUrl,
        username: staticPost.username,
        comments: aiPosts[i]?.comments ?? [],
      }))
    }

    return { data, history }
  }

  // ── Game logic ───────────────────────────────────────────────────────────────

  /**
   * Met à jour le score de culpabilité. Si <= 50%, marque la partie comme terminée (victoire).
   */
  async updateGuiltyScore(
    game: Game,
    score: number
  ): Promise<{ guiltyPourcentage: number; isFinished: boolean }> {
    const wasFinished = game.isFinished
    game.guiltyPourcentage = Math.max(0, Math.min(100, score))
    if (game.guiltyPourcentage <= 50) {
      game.isFinished = true
      if (!wasFinished) {
        game.finishedAt = DateTime.now()
      }
    }
    await game.save()

    if (!wasFinished && game.isFinished) {
      try {
        const entries = await getLeaderboardEntries()
        await transmit.broadcast('leaderboard', { entries: JSON.parse(JSON.stringify(entries)) })
      } catch (e) {
        console.error('[leaderboard] broadcast error', e)
      }
    }

    return { guiltyPourcentage: game.guiltyPourcentage, isFinished: game.isFinished }
  }

  /**
   * Génère le message initial de la Juge Moreau et les premiers choix. Sauvegarde en base.
   */
  async generateInitialMessage(
    game: Game,
    user: User
  ): Promise<{ initialMessage: string; currentChoices: any[] }> {
    console.log("Gén du message pour : ", user.firstName, user.lastName, "avec l'affaire : ", (game.data as any)?.history)
    const history = (game.data as any)?.history
    const crimeContext = history?.content
      ? `Infraction: ${history.content.substring(0, 100)}...`
      : 'Infraction inconnue'

    const prompt = `
RÔLE : Tu es la Juge Moreau, présidente du tribunal. Tu JUGES l'accusé (l'utilisateur).

=== L'AFFAIRE ===
CONTEXTE DU CRIME : ${history?.content ?? 'Une infraction a été commise'}

QUI EST ACCUSÉ : ${user.firstName} ${user.lastName || ''} age: ${user.age || 'inconnu'} ans

DONNÉES À ANALYSER (accessibles sur le coté gauche - réseaux sociaux) :
${JSON.stringify(game.data)}

=== TON DE LA JUGE ===
- Bienveillante et pédagogue — tu veux que l'accusé puisse se défendre correctement
- Tu présumes l'innocence et encourages l'accusé à présenter ses arguments
- Formes judiciaires : "${user.firstName}...", "La cour estime...", "La défense peut..."
- Ton : doux et encourageant — tu veux que la vérité éclate, pas une condamnation

=== RÔLES CLAIRS ===
TOI (Juge) : Tu accuses l'utilisateur d'être impliqué dans l'infraction, mais tu es compréhensive et tu lui donnes la chance de se défendre. Tu analyses les preuves qu'il présente.
L'UTILISATEUR (Accusé) : Doit se DÉFENDRE en trouvant des preuves d'innocence dans les réseaux sociaux/données disponibles à gauche

=== PREMIER MESSAGE (OUVERTURE DU PROCÈS) ===
OBLIGATOIRES :
1. Rappelle clairement l'ACCUSATION (pourquoi il est au tribunal)
2. Les données sont dans les réseaux sociaux à gauche, il doit les analyser pour trouver des preuves d'innocence
3. Invite l'accusé à se DÉFENDRE en présentant des preuves
4. Utilise son nom pour l'accuser ("M./Mme ${user.lastName}") ou "Vous, ${user.firstName}" pour renforcer le côté accusateur

NE MENTIONNE PAS "enquêteur", ni "maître" - il n'est qu'un ACCUSÉ qui doit prouver son innocence.

=== CHOIX D'ACTION ===
Propose EXACTEMENT 3 réponses possibles pour l'accusé, toutes valides (aucun piège) :
Les titres doivent être NEUTRES et variés — différentes stratégies de défense.
Au moins 1 choix doit clairement aider l'accusé à faire baisser la culpabilité.

Ou quand il y a des alibis: "Utiliser l'alibi de X", "Utiliser l'alibi de Y", "Présenter une preuve supplémentaire"

=== FORMAT JSON ===
Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après :
{
  "message": "Message d'accusation du juge (réponses courtes obligatoires)",
  "nextChoices": [
    {"id": 1, "title": "Titre", "description": "Courte description", "choosen": false, "isTrap": false},
    {"id": 2, "title": "Titre", "description": "Courte description", "choosen": false, "isTrap": true},
    {"id": 3, "title": "v", "description": "Courte description", "choosen": false, "isTrap": false}
  ]
}
Langue: français
    `.trim()

    try {
      const raw = await this.ia.chat([{ role: 'user', content: prompt }])
      const parsed = JSON.parse(raw)
      const initialMessage = parsed.message || ''
      const currentChoices = parsed.nextChoices || []
      game.currentChoices = currentChoices
      game.initialMessage = initialMessage
      await game.save()
      return { initialMessage, currentChoices }
    } catch {
      const initialMessage = `${user.firstName}, vous comparaissez pour ${crimeContext}. Les preuves sont accessibles dans le dossier gauche. Présentez votre défense.`
      const currentChoices = [
        { id: 1, title: 'Analyser les messages', description: 'Examiner les données du suspect', choosen: false, isTrap: false },
        { id: 2, title: 'Ignorer les incohérences', description: 'Se concentrer uniquement sur les preuves évidentes', choosen: false, isTrap: true },
        { id: 3, title: 'Consulter les alibis', description: 'Vérifier les déclarations du suspect', choosen: false, isTrap: false },
      ]
      game.currentChoices = currentChoices
      game.initialMessage = initialMessage
      await game.save()
      return { initialMessage, currentChoices }
    }
  }

  /**
   * Interroge un contact et retourne sa réponse + l'impact sur la culpabilité.
   */
  async interrogateContact(
    game: Game,
    contact: { name: string; role: string },
    question: string
  ): Promise<{ answer: string; guiltyDelta: number }> {
    const choicesSummary = game.choices
      .map((c) => `- ${c.data.title} : ${c.response || ''}`)
      .join('\n')
    const proofsSummary = game.proofs
      .map((p) => `- ${p.data?.title || 'Preuve'} : ${p.content}`)
      .join('\n')

    const guiltyRules = `- guiltyDelta TOUJOURS négatif : entre -30 et -15 (la culpabilité ne peut qu'baisser).
- Ta réponse aide clairement l'accusé : -15 à -10
- Ta réponse est vague ou partielle : -9 à -5
- Minimum absolu : -5`

    const prompt = `
Tu es ${contact.name}, ${contact.role} de l'adolescent faisant l'objet d'une enquête policière.
Un accusé vient t'interroger pour prouver son innocence. Tu dois répondre EN CHARACTER, de façon naturelle et cohérente avec ton rôle.

=== CONTEXTE DE L'AFFAIRE ===
${JSON.stringify(game.data)}

=== AVANCEMENT DE L'INTERROGATOIRE ===
Étapes précédentes :
${choicesSummary || "Aucune étape pour l'instant."}

Preuves collectées :
${proofsSummary || "Aucune preuve pour l'instant."}

Niveau de culpabilité actuel : ${game.guiltyPourcentage}%

=== QUESTION POSÉE ===
"${question}"

=== RÈGLES ===
- Ta réponse en 2-3 phrases, en français, comme si tu étais vraiment cette personne.
${guiltyRules}

=== FORMAT DE RÉPONSE OBLIGATOIRE ===
Réponds UNIQUEMENT en JSON valide :
{
  "answer": "Ta réponse en tant que ${contact.name} (2-3 phrases)",
  "guiltyDelta": 0
}
    `.trim()

    try {
      const raw = await this.ia.chat([{ role: 'user', content: prompt }])
      const parsed = JSON.parse(raw)
      let guiltyDelta: number = parsed.guiltyDelta || -5
      // Toujours négatif, entre -5 et -15
      guiltyDelta = Math.max(-15, Math.min(guiltyDelta, -5))
      return { answer: parsed.answer || '', guiltyDelta }
    } catch {
      return {
        answer: "Je... je ne sais pas trop quoi vous dire. C'est une situation difficile pour moi.",
        guiltyDelta: -2,
      }
    }
  }

  /**
   * Génère la réaction de la Juge Moreau suite à un témoignage.
   */
  async getJudgeReaction(params: {
    contactName: string
    contactRole: string
    question: string
    answer: string
    guiltyDelta: number
    newGuilty: number
    gameData: unknown
  }): Promise<string> {
    const { contactName, contactRole, question, answer, guiltyDelta, newGuilty, gameData } = params

    const deltaDescription =
      guiltyDelta < 0
        ? `ce témoignage a fait baisser la culpabilité de ${Math.abs(guiltyDelta)}%`
        : guiltyDelta > 0
          ? `ce témoignage a fait monter la culpabilité de ${guiltyDelta}%`
          : "ce témoignage n'a pas changé la culpabilité"

    const prompt = `
Tu es la Juge Moreau. Un accusé vient d'appeler le témoin ${contactName} (${contactRole}) à la barre.

CONTEXTE DE L'AFFAIRE :
${JSON.stringify(gameData)}

QUESTION POSÉE PAR L'ACCUSÉ : "${question}"
RÉPONSE DU TÉMOIN ${contactName} : "${answer}"
CULPABILITÉ ACTUELLE : ${newGuilty}% (${deltaDescription})

Réagis en tant que Juge (1 phrase, formules judiciaires, sans JSON).
- Témoignage favorable à l'accusé → tu l'accueilles positivement ("La cour prend note de cet élément favorable...")
- Témoignage neutre → encourageant ("La cour remercie le témoin et invite l'accusé à poursuivre sa défense.")
- Dans tous les cas : ton bienveillant, tu ne retournes jamais un témoignage contre l'accusé.
    `.trim()

    try {
      const reaction = await this.ia.chat([{ role: 'user', content: prompt }])
      return reaction.length > 200 ? reaction.substring(0, 197) + '...' : reaction
    } catch {
      return 'La cour prend note de ce témoignage.'
    }
  }
}
