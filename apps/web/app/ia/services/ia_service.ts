import env from '#start/env'
import User from '#users/models/user'
import IaConfig from '#ia/models/ia_config'
import { LoadedHistory } from '#game/services/game_service'

export interface IAResponse extends Response {
  choices: {
    message: {
      content: string
    }
  }[]
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ResolvedConfig {
  url: string
  key: string
  model: string
}

export default class IAService {
  private static async loadConfig(): Promise<ResolvedConfig> {
    const config = await IaConfig.query().where('isActive', true).first()
    return {
      url: config?.endpoint ?? env.get('IA_API_URL')!,
      key: config?.apiKey ?? env.get('IA_API_KEY')!,
      model: config?.model ?? 'o3-mini',
    }
  }

  async chat(messages: ChatMessage[]) {
    const { url, key, model } = await IAService.loadConfig()

    const response = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        reasoning_effort: 'low',
        messages,
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`IA chat failed: ${response.status} ${text}`)
    }

    const data = (await response.json()) as IAResponse
    return data.choices[0].message.content
  }

  async *streamChat(messages: ChatMessage[]): AsyncGenerator<string> {
    const { url, key, model } = await IAService.loadConfig()

    console.log('loaded config', { url, model })

    const response = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        reasoning_effort: 'low',
        messages,
        stream: true,
      }),
    })

    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => '')
      throw new Error(`Stream failed: ${response.status} ${text}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let remainder = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        remainder += decoder.decode(value, { stream: true })
        const lines = remainder.split('\n')
        remainder = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (!trimmed.startsWith('data: ')) continue
          try {
            const data = JSON.parse(trimmed.slice(6))
            const content = data.choices?.[0]?.delta?.content
            if (content) yield content
          } catch {
            // Skip malformed lines
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  async generateData(user: User, history: LoadedHistory, staticPosts?: { postId: number; content: string }[]) {
    const { url, key, model } = await IAService.loadConfig()

    console.log('Generating data with config:', { url, model })

    const response = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        response_format: {
          type: 'json_object',
        },
        reasoning_effort: 'low',
        messages: [
          {
            role: 'system',
            content: `Tu es un générateur de données pour un jeu où un adolescent est accusé d'un crime. Tu dois produire un objet JSON strictement conforme à la structure ci-dessous.

        ## AFFAIRE
        ${history.json.content}

        ## RÈGLES IMPORTANTES
        - La personne est ACCUSÉE, pas coupable. Les données doivent refléter cela (pas de preuve irréfutable de culpabilité, alibis possibles, etc.).
        - Toutes les données doivent être cohérentes avec l'affaire décrite ci-dessus.
        - Les conversations Instagram doivent contenir des indices sur l'affaire (lieux mentionnés, horaires, objets, alibi).
        - Le "conversationId" de chaque conversation DOIT correspondre à l'"id" du contact associé (conversationId 1 = contact id 1).
        - Chaque conversation doit contenir entre 6 et 10 messages (alternance isMine: true / false).
        - Les mails doivent mélanger spam et mails utiles (tickets de transport, confirmations de présence, messages d'amis).
        - Le calendrier utilise UNIQUEMENT les valeurs anglaises : "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday".
        ${staticPosts && staticPosts.length > 0 ? `- Les posts Instagram sont FIXES (fournis ci-dessous). Tu dois UNIQUEMENT générer les commentaires pour chaque post, en respectant les postId. Ne change pas le contenu des posts.\n        - POSTS FIXES :\n        ${staticPosts.map((p) => `  Post ${p.postId}: "${p.content}"`).join('\n        ')}` : '- imageUrl des posts Instagram : laisser une chaîne vide "".'}

        ## STRUCTURE JSON EXACTE À RESPECTER
        # C'est un exemple de structure à respecter, les données doivent être différentes et cohérentes avec l'affaire décrite ci-dessus :
        {
          "contacts": [
            { "id": 1, "name": "Lucas Martin", "role": "meilleur ami" },
            ... (4 à 5 contacts au total, avec des rôles variés : famille, amis, collègues du collège, etc.)
          ],
          "insta": {
            "conversations": [
              {
                "conversationId": 1,
                "messages": [
                  { "id": 1, "content": "Ça va ? T'es où là ?", "isMine": false },
                  { "id": 2, "content": "Je suis à la biblio, j'bosse un peu", "isMine": true },
                  { "id": 3, "content": "Ah ok, à quelle heure tu finis ?", "isMine": false },
                  { "id": 4, "content": "Vers 18h je pense", "isMine": true },
                  { "id": 5, "content": "On se retrouve après ?", "isMine": false },
                  { "id": 6, "content": "Ouais bonne idée, je t'appelle", "isMine": true }
                ]
              },
              {
                "conversationId": 2,
                "messages": [
                  { "id": 1, "content": "T'as pensé à ce qu'on a dit hier ?", "isMine": false },
                  { "id": 2, "content": "Oui mais je sais pas trop...", "isMine": true },
                  { "id": 3, "content": "T'inquiète, personne saura rien", "isMine": false },
                  { "id": 4, "content": "C'est risqué quand même", "isMine": true }
                ]
              }
            ],
            "posts": [
              {
                "postId": 1,
                "content": "Belle journée avec les potes 🌞",
                "imageUrl": "",
                "comments": [
                  { "id": 1, "content": "Trop bien !", "author": "lucas_m" },
                  { "id": 2, "content": "Jaloux 😅", "author": "sophie_d" }
                ]
              }
            ]
          },
          "mails": [
            {
              "mailId": 1,
              "subject": "Confirmation billet — Match de foot 12 mars",
              "content": "Votre billet pour le match du 12 mars à 19h00 au Stade Municipal est confirmé. Rangée C, Place 14.",
              "sender": "billets@stademunicipal.fr",
              "isRead": true
            },
            {
              "mailId": 2,
              "subject": "Vous avez gagné un iPhone 15 !!",
              "content": "Félicitations ! Cliquez ici pour réclamer votre prix...",
              "sender": "noreply@promo-wins.com",
              "isRead": false
            }
          ],
          "notes": {
            "calendar": [
              {
                "date": "monday",
                "events": [
                  { "id": 1, "title": "Mathématiques", "description": "Salle 204 — M. Bernard" },
                  { "id": 2, "title": "Français", "description": "Salle 108 — Mme Leconte" },
                  { "id": 3, "title": "Entraînement foot", "description": "Stade municipal — 18h30" }
                ]
              },
              {
                "date": "tuesday",
                "events": [
                  { "id": 4, "title": "Histoire-Géo", "description": "Salle 301 — M. Lefebvre" },
                  { "id": 5, "title": "Sciences", "description": "Salle 110 — Mme Rousseau" }
                ]
              }
            ],
            "notes": [
              { "coef": 2, "note": 14.5, "date": "2024-02-10T00:00:00.000Z" },
              { "coef": 1, "note": 8.0, "date": "2024-02-15T00:00:00.000Z" },
              { "coef": 3, "note": 11.5, "date": "2024-02-20T00:00:00.000Z" }
            ]
          }
        }

        ## QUANTITÉS MINIMALES
        - contacts : 7 à 9 personnes
        - insta.conversations : 1 conversation par contact (même conversationId que l'id du contact), 10 à 15 messages chacune, essaye de varier les accusations (un coup on accuse l'utilisateur, un coup on parle de l'affaire sans accuser, un coup on parle d'autre chose, un autre coup on fait bien comprendre qu'il n'est pas du tout et qu'il a un superbe alibi etc.)
        - insta.posts : ${staticPosts && staticPosts.length > 0 ? `exactement ${staticPosts.length} post(s) (les postId sont fixés, génère uniquement les commentaires)` : '2 à 3 posts'}
        - mails : 6 à 12 mails (mélange spam + utiles)
        - notes.calendar : 4 à 5 jours de la semaine avec 2 à 4 événements chacun
        - notes.notes : 4 à 6 notes

        insta.conversations :
        Le isMine: false, parle avec les données de l'utilisateur (donc utiliser le prénom de l'utilisateur et faire référence à des éléments de l'affaire). Le isMine: true, parle au nom de l'utilisateur (donc utiliser "je", "moi", etc. et faire référence à des éléments de l'affaire, et dire le prénom de la personne en face).

        ## DONNÉES DE L'UTILISATEUR
        - Prénom de l'utilisateur : ${user.firstName}
        - Nom de l'utilisateur : ${user.lastName}
        - Âge de l'utilisateur : ${user.age}

        Détermine son genre (masculin, féminin, autre) et adapte les conversations en conséquence (ex : "je suis allé au foot" vs "je suis allée au foot", etc.).


        ## AFFAIRE
        - Histoire de l'affaire : ${history.json.content}
        - L'accusé est ${user.firstName} ${user.lastName}, un adolescent de ${user.age} ans. Prends en compte son âge et adapte les conversations, les événements du calendrier, les mails, etc. en conséquence (ex : pas de mails professionnels, pas de rendez-vous médicaux, etc.).
        - Dans les conversations Instagrume, seul ${user.firstName} ${user.lastName} est accusé au tribunal, pas les contacts. Les conversations doivent refléter cela (pas de preuve irréfutable de culpabilité, alibis possibles, etc.). Ne parle pas de culpabilité des contacts (ou autres personnes), même si certains peuvent émettre des doutes ou des soupçons. Les conversations doivent être réalistes pour des adolescents (ex : pas de discussions sur des sujets d'adultes, pas de langage trop soutenu, etc.).

        Réponds UNIQUEMENT avec le JSON, sans texte avant ni après. Langue : français.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`IA generateData failed: ${response.status} ${text}`)
    }

    const data = (await response.json()) as IAResponse
    return data.choices[0].message.content
  }
}
