interface ChatMessage {
  role: 'ai' | 'user' | 'contact'
  content: string
  contactName?: string
}

export type { ChatMessage }
