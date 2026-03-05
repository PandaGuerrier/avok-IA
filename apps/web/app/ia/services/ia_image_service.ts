import env from '#start/env'

interface DalleResponse {
  data: { url: string }[]
}

export default class IAImageService {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.openai.com/v1'

  constructor() {
    this.apiKey = env.get('OPENAI_API_KEY') ?? ''
  }

  async generateImage(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
        n: 1,
      }),
    })

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.status}`)
    }

    const json = (await response.json()) as DalleResponse
    return json.data[0].url
  }
}
