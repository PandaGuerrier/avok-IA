import { useState } from 'react'
import { Users, X, Loader2 } from 'lucide-react'
import type { ContactData } from '#game/types/data'
import { getXsrfToken } from '#game/ui/utils/utils'

interface InterrogateModalProps {
  gameUuid: string
  contacts: ContactData[]
  onAnswer: (answer: string, contactName: string) => void
  onClose: () => void
}

export default function InterrogateModal({
  gameUuid,
  contacts,
  onAnswer,
  onClose,
}: InterrogateModalProps) {
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!selectedContact || !question.trim() || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/game/${gameUuid}/interrogate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': getXsrfToken(),
        },
        body: JSON.stringify({ contactId: selectedContact.id, question }),
      })
      if (res.ok) {
        const json = await res.json()
        onAnswer(json.answer, json.contactName)
        onClose()
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0a0a1a] border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[75vh]">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Interrogatoire</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs text-white/40 mb-3">Choisissez une personne à interroger :</p>
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                selectedContact?.id === contact.id
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-white/3 border-white/8 text-white/70 hover:border-white/20'
              }`}
            >
              <p className="text-sm font-semibold">{contact.name}</p>
              <p className="text-xs mt-0.5 text-white/40 capitalize">{contact.role}</p>
            </button>
          ))}
        </div>

        {/* Question input */}
        {selectedContact && (
          <div className="shrink-0 p-4 border-t border-white/10 space-y-3">
            <p className="text-xs text-amber-400 font-medium">
              Question pour {selectedContact.name} :
            </p>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Posez votre question..."
              rows={3}
              className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!question.trim() || loading}
              className="w-full py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-xs text-amber-400 font-semibold hover:bg-amber-500/30 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
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
