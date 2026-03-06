import React, { useState, useRef, useEffect } from 'react'
import { BookmarkPlus, X } from 'lucide-react'

interface Message {
  id: number
  content: string
  isMine: boolean
}

interface Contact {
  id: number
  name: string
  role: string
}

interface ChatWindowProps {
  contact: Contact
  messages: Message[]
  onAlibisClick: (content: string) => void
}

const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

const ChatWindow: React.FC<ChatWindowProps> = ({ contact, messages, onAlibisClick }) => {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelected(new Set())
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [contact.id])

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const buildAlibisContent = () => {
    return messages
      .filter((m) => selected.has(m.id))
      .map((m) => `${m.isMine ? 'Moi' : contact.name}: ${m.content}`)
      .join('\n')
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
            {initials(contact.name)}
          </div>
          <div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">{contact.name}</span>
            <p className="text-xs text-gray-400 dark:text-gray-500">{contact.role}</p>
          </div>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">{selected.size} sélectionné(s)</span>
            <button
              onClick={() => onAlibisClick(buildAlibisContent())}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-full transition-colors"
            >
              <BookmarkPlus size={14} />
              Créer un alibi
            </button>
            <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
        {messages.length === 0 && (
          <p className="text-center text-gray-300 dark:text-gray-600 text-sm mt-8">Aucun message dans cette conversation.</p>
        )}
        {messages.map((msg) => {
          const isSelected = selected.has(msg.id)
          return (
            <div
              key={msg.id}
              onClick={() => toggleSelect(msg.id)}
              className={`flex flex-col cursor-pointer ${msg.isMine ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm transition-all ring-offset-1 ${
                  msg.isMine
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-bl-none'
                } ${isSelected ? 'ring-2 ring-yellow-400 opacity-90' : 'hover:opacity-80'}`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {selected.size === 0 && (
        <p className="text-center text-[10px] text-gray-300 dark:text-gray-600 pb-3">Clique sur un message pour le sélectionner</p>
      )}
    </div>
  )
}

export default ChatWindow
