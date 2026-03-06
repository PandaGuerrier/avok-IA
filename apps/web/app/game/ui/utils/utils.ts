import GameDto from '#game/dtos/game'
import { DURATION_S } from '#game/ui/utils/constants'
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

function calcRemaining(game: GameDto): number {
  if (!game.startTime) return DURATION_S
  const startMs = new Date(game.startTime as unknown as string).getTime()
  const pausedMs = game.totalPausedMs ?? 0
  const refMs = game.isPaused ? new Date(game.pausedAt as unknown as string).getTime() : Date.now()
  const elapsed = Math.floor((refMs - startMs - pausedMs) / 1000)
  return Math.max(0, DURATION_S - elapsed)
}

function buildInitialMessages(choices: GameDto['choices'], initialMessage: string): ChatMessage[] {
  const messages: ChatMessage[] = []
  if (initialMessage) messages.push({ role: 'ai', content: initialMessage })
  for (const choice of choices) {
    messages.push({ role: 'user', content: choice.data.title })
    if (choice.response) messages.push({ role: 'ai', content: choice.response })
  }
  return messages
}


export { formatTime, getXsrfToken, calcRemaining, buildInitialMessages }
