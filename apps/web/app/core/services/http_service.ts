export default class HttpService {
  declare baseUlr: string
  declare headers: Record<string, string>

  constructor(baseUrl: string, headers: Record<string, string>) {
    this.baseUlr = baseUrl
    this.headers = headers
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUlr}${endpoint}`, {
      method: 'GET',
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json() as Promise<T>
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${this.baseUlr}${endpoint}`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json() as Promise<T>
  }
}
