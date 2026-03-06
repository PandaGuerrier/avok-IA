import HttpService from '#core/services/http_service'
import env from '#start/env'
import User from '#users/models/user'

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

export default class IAService {
  declare httpService: HttpService
  declare model: string

  constructor() {
    this.httpService = new HttpService(env.get('IA_API_URL')!, {
      Authorization: `Bearer ${env.get('IA_API_KEY')}`,
    })

    this.model = 'openai/gpt-oss-120b'
  }

  async chat(messages: ChatMessage[]) {
    const response = await this.httpService.post<IAResponse>('/chat/completions', {
      model: this.model,
      messages,
    })

    return response.choices[0].message.content
  }

  async generateData(_user: User, affaireContent: string, staticPosts?: { postId: number; content: string }[]) {
    const response = await this.httpService.post<IAResponse>('/chat/completions', {
      model: this.model,
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'system',
          content: `Tu es un générateur de données pour un jeu de déduction policière. Tu dois produire un objet JSON strictement conforme à la structure ci-dessous.

        ## AFFAIRE
        ${affaireContent}

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

        {
          "contacts": [
            { "id": 1, "name": "Lucas Martin", "role": "meilleur ami" },
            { "id": 2, "name": "Sophie Dupont", "role": "petite amie" },
            { "id": 3, "name": "M. Lefebvre", "role": "professeur principal" },
            { "id": 4, "name": "Maman", "role": "mère" }
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
        - contacts : 4 à 5 personnes
        - insta.conversations : 1 conversation par contact (même conversationId que l'id du contact), 6 à 10 messages chacune
        - insta.posts : ${staticPosts && staticPosts.length > 0 ? `exactement ${staticPosts.length} post(s) (les postId sont fixés, génère uniquement les commentaires)` : '2 à 3 posts'}
        - mails : 6 à 12 mails (mélange spam + utiles)
        - notes.calendar : 4 à 5 jours de la semaine avec 2 à 4 événements chacun
        - notes.notes : 4 à 6 notes

        Réponds UNIQUEMENT avec le JSON, sans texte avant ni après. Langue : français.`,
        },
      ],
    })

    return response.choices[0].message.content
  }
}
