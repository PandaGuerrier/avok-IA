import HttpService from '#core/services/http_service'
import env from '#start/env'
import User from '#users/models/user'
import { GameSchema } from '#game/types/data'
import UserDto from '#users/dtos/user'
import type { HistoryScript } from '#game/config/histories'

export interface IAResponse extends Response {
  choices: {
    message: {
      content: string
    }
  }[]
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

  async chat(prompt: string) {
    const response = await this.httpService.post<IAResponse>('/chat/completions', {
      model: this.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // todo

    console.log(response)
    return response.choices[0].message.content
  }

  async generateData(user: User, script: HistoryScript) {
    const emptyData = GameSchema.parse({})

    const response = await this.httpService.post<IAResponse>('/chat/completions', {
      model: this.model,
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'system',
          content: `
          Tu es un assistant pour créer des données de jeu pour un jeu de déduction policière.

          L'affaire est la suivante : ${script.content}
          Génère des données numériques cohérentes avec cette histoire.

          Tu vas devoir créer des données en suivant cette structure :

          Créer des discussions qui sont probables: d'un ado (entre 10 et 16 ans).

          Rajoute dans les conversations des éléments qui pourraient être des preuves, comme des lieux, des objets, des personnes, des événements, etc.

          type: "Trop cool la soirée d'hier soir ! On a dansé toute la nuit et on a rencontré plein de gens sympas !" (c'est un exemple)

          Pour les mails: je veux des spam (faux mails), et des mails utiles, genre des tickets pour dire qu'il était à un endroit, ou des mails de ses amis, etc.

          Pour les notes: notes / 20, avec un coef.

          Pour le planning je veux un planning d'un collégien français (8h - 17h), avec des activités extrascolaires (sport, musique, etc.) et des événements sociaux (anniversaires, sorties entre amis, etc.)

          Pour les contacts: génère 4 à 5 personnes de l'entourage de l'adolescent (amis proches, famille, professeurs, voisins). Ces personnes doivent apparaître dans les conversations Instagram ou les mails. Exemple : {"id": 1, "name": "Lucas Martin", "role": "meilleur ami"}.

          ${
            JSON.stringify(emptyData)
          }


          Les données de l'utilisateur:

          ${
            JSON.stringify(new UserDto(user).toJSON())
          }

          Tu n'envoie que les données, sans explication ni rien d'autre, juste les données au format JSON.
          Langue: français
          `
        }
      ]
    })

    console.log(`
          Tu es un assistant pour créer des données de jeu pour un jeu de déduction policière.

          Tu vas devoir créer des données en suivant cette structure :

          ${JSON.stringify(emptyData)}


          Les données de l'utilisateur:

          ${JSON.stringify(new UserDto(user).toJSON())}

          Tu n'envoie que les données, sans explication ni rien d'autre, juste les données au format JSON.
          Langue: français
          `)
    console.log(response)

    return response.choices[0].message.content
  }
}
