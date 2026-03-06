interface ChatMessage {
  role: 'ai' | 'user' | 'contact'
  content: string
  contactName?: string
  images?: string[]
}

export type { ChatMessage }
