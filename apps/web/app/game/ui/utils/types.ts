interface ChatMessage {
  role: 'ai' | 'user' | 'contact'
  content: string
  contactName?: string
  images?: string[]
  alibis?: string[]
}

export type { ChatMessage }
