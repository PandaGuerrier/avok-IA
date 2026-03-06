import GameDto from '#game/dtos/game'
import { ChatMessage } from '#game/ui/utils/types'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function getXsrfToken(): string {
  return decodeURIComponent(
    document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || ''
  )
}

function buildInitialMessages(game: GameDto, initialMessage: string): ChatMessage[] {
  const messages: ChatMessage[] = []
  if (initialMessage) messages.push({ role: 'ai', content: initialMessage, images: game.proofs.filter(p => p.imageUrl != null).map(p => p.imageUrl!) })
  for (const choice of game.choices) {
    messages.push({ role: 'user', content: choice.data.title })
    if (choice.response) messages.push({ role: 'ai', content: choice.response })
  }
  return messages
}


export { formatTime, getXsrfToken, buildInitialMessages }
