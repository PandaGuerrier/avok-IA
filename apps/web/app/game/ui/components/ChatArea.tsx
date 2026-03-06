import { type RefObject } from 'react'
import { Loader2 } from 'lucide-react'
import type { ChatMessage } from '#game/ui/utils/types'

interface ChatAreaProps {
  messages: ChatMessage[]
  loading: boolean
  chatEndRef: RefObject<HTMLDivElement | null>
}

export default function ChatArea({ messages, loading, chatEndRef }: ChatAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.role === 'contact' ? (
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed backdrop-blur-sm bg-amber-500/10 border border-amber-500/20 text-amber-200">
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
                {msg.contactName}
              </p>
              {msg.content}
            </div>
          ) : (
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed backdrop-blur-sm ${
                msg.role === 'user'
                  ? 'bg-cyan-500/15 border border-cyan-500/20 text-cyan-100 rounded-br-sm'
                  : 'bg-white/5 border border-white/10 text-white/85 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  )
}
