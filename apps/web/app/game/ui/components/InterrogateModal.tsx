import { useState } from 'react'
import { Users, X, Loader2 } from 'lucide-react'
import type { ContactData } from '#game/types/data'
import { getXsrfToken } from '#game/ui/utils/utils'
import { useGameStore } from '#game/ui/store/gameStore'

interface InterrogateModalProps {
  gameUuid: string
  contacts: ContactData[]
  onAnswer: (answer: string, contactName: string) => void
  onJudgeChunk: (chunk: string) => void
  onClose: () => void
}

export default function InterrogateModal({
  gameUuid,
  contacts,
  onAnswer,
  onJudgeChunk,
  onClose,
}: InterrogateModalProps) {
  const { updateGuilt } = useGameStore()
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!selectedContact || !question.trim() || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/game/${gameUuid}/interrogate/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': getXsrfToken(),
        },
        body: JSON.stringify({ contactId: selectedContact.id, question }),
      })

      if (!res.ok || !res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let sseBuffer = ''
      let contactAnswered = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        sseBuffer += decoder.decode(value, { stream: true })
        const lines = sseBuffer.split('\n')
        sseBuffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'contact' && !contactAnswered) {
              contactAnswered = true
              updateGuilt(event.guiltyPourcentage)
              onAnswer(event.answer, event.contactName)
              // Modal will be closed by parent via onAnswer callback
              setLoading(false)
            } else if (event.type === 'judge_chunk') {
              onJudgeChunk(event.content)
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 dark:bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-[#0a0a1a] border border-gray-200 dark:border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[75vh]">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Interrogatoire</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/80 hover:bg-gray-100 dark:hover:bg-white/8 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs text-gray-500 dark:text-white/40 mb-3">Choisissez une personne à interroger :</p>
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                selectedContact?.id === contact.id
                  ? 'bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-200'
                  : 'bg-gray-50 dark:bg-white/3 border-gray-200 dark:border-white/8 text-gray-700 dark:text-white/70 hover:border-gray-300 dark:hover:border-white/20'
              }`}
            >
              <p className="text-sm font-semibold">{contact.name}</p>
              <p className="text-xs mt-0.5 text-gray-500 dark:text-white/40 capitalize">{contact.role}</p>
            </button>
          ))}
        </div>

        {/* Question input */}
        {selectedContact && (
          <div className="shrink-0 p-4 border-t border-gray-200 dark:border-white/10 space-y-3">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Question pour {selectedContact.name} :
            </p>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Posez votre question..."
              rows={3}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500/50 resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!question.trim() || loading}
              className="w-full py-2 rounded-lg bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 text-xs text-amber-700 dark:text-amber-400 font-semibold hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Poser la question
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
