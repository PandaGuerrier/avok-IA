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
    <div
      id="tour-chat"
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent dark:scrollbar-thumb-white/10 scrollbar-thumb-black/10"
    >
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
              className={`max-w-[60%] h-full rounded-2xl px-4 py-2.5 text-sm leading-relaxed backdrop-blur-sm ${
                msg.role === 'user'
                  ? 'bg-cyan-500/20 dark:bg-cyan-500/15 border border-cyan-500/30 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-100 rounded-br-sm'
                  : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white/85 rounded-bl-sm'
              }`}
            >
              {msg.content}

              {msg.images && msg.images.length > 0 && (
                <div className={`flex gap-3 mt-12 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.images.map((src, j) => (
                    <div
                      key={j}
                      className="relative group max-w-[260px]"
                      style={{ transform: `rotate(${j % 2 === 0 ? '-1.2deg' : '1.5deg'})` }}
                    >
                      {/* Badge */}
                      <div className="absolute -top-2.5 left-3 z-10 flex items-center gap-1 bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow">
                        <span>⚠</span>
                        <span>Pièce à conviction</span>
                      </div>

                      {/* Card */}
                      <div className="bg-neutral-900 border border-red-500/40 rounded-sm shadow-lg shadow-red-900/20 overflow-hidden pt-3">
                        <img
                          src={src}
                          alt={`preuve ${j + 1}`}
                          className="w-full h-auto object-contain max-h-52 opacity-90 group-hover:opacity-100 transition-opacity duration-200"
                        />
                        <div className="px-2 py-1.5 flex items-center justify-between">
                          <span className="text-[9px] text-red-400/70 font-mono uppercase tracking-widest">
                            PREUVE #{String(j + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] text-red-500/50 font-mono">CONFIDENTIEL</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  )
}
