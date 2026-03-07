import { type RefObject } from 'react'
import { Loader2 } from 'lucide-react'
import type { ChatMessage } from '#game/ui/utils/types'
import type AlibiDto from '#game/dtos/alibi'

interface ChatAreaProps {
  messages: ChatMessage[]
  loading: boolean
  chatEndRef: RefObject<HTMLDivElement | null>
  selectedAlibis: string[]
  alibis: AlibiDto[]
}

export default function ChatArea({ messages, loading, chatEndRef, selectedAlibis, alibis }: ChatAreaProps) {
  return (
    <div
      id="tour-chat"
      className="relative flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent dark:scrollbar-thumb-white/10 scrollbar-thumb-black/10"
    >
      {/* Background watermark */}
      <div className="pointer-events-none select-none fixed inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden z-0 opacity-[0.04] dark:opacity-[0.06]">
        <span
          className="text-[clamp(3rem,10vw,8rem)] font-black uppercase tracking-[0.25em] text-destructive leading-none text-center"
          style={{ WebkitTextStroke: '1px currentColor' }}
        >
          VOUS ÊTES
        </span>
        <span
          className="text-[clamp(3rem,10vw,8rem)] font-black uppercase tracking-[0.25em] text-destructive leading-none text-center"
          style={{ WebkitTextStroke: '1px currentColor' }}
        >
          ACCUSÉ
        </span>
        <div className="mt-4 flex gap-6 text-[clamp(0.5rem,1.5vw,1rem)] font-bold uppercase tracking-[0.5em] text-destructive opacity-60">
          <span>CONFIDENTIEL</span>
          <span>•</span>
          <span>DOSSIER CRIMINEL</span>
          <span>•</span>
          <span>CONFIDENTIEL</span>
        </div>
      </div>
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.role === 'contact' ? (
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed backdrop-blur-sm bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:bg-amber-500/15 dark:border-amber-500/20 dark:text-amber-100">
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

              {msg.alibis && msg.alibis.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                  {msg.alibis.map((alibiId, k) => {
                    const alibi = alibis.find(a => a.uuid === alibiId)
                    if (!alibi) return null

                    const isSelected = selectedAlibis.includes(alibiId)

                    return (
                      <div
                        key={k}
                        className={`px-3 py-1 rounded cursor-pointer text-xs font-medium ${
                          isSelected
                            ? 'bg-green-500/20 border border-green-500/40 text-green-700 dark:bg-green-500/15 dark:border-green-500/30 dark:text-green-100'
                            : 'bg-gray-200/50 border border-gray-300/40 text-gray-800 dark:bg-white/10 dark:border-white/20 dark:text-white/80'
                        }`}
                      >
                        {alibi.title}
                      </div>
                    )
                  })}
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
