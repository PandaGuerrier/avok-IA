import React from 'react'

interface Contact {
  id: number
  name: string
  role: string
}

interface Message {
  id: number
  content: string
  isMine: boolean
}

interface Conversation {
  conversationId: number
  messages: Message[]
}

interface ChatListProps {
  contacts: Contact[]
  conversations: Conversation[]
  onSelectContact: (contact: Contact) => void
  selectedId?: number
}

const ChatList: React.FC<ChatListProps> = ({ contacts, conversations, onSelectContact, selectedId }) => {
  const lastMsg = (contactId: number, contactIndex: number) => {
    const byId = conversations.find((c) => c.conversationId === contactId)
    const conv = byId ?? conversations[contactIndex]
    return conv?.messages?.at(-1)?.content ?? ''
  }

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900">
      <div className="p-5 font-bold border-b border-gray-200 dark:border-gray-700 text-xl flex justify-between items-center text-gray-900 dark:text-white">
        <span>Messages</span>
      </div>
      {contacts.map((c, idx) => (
        <div
          key={c.id}
          onClick={() => onSelectContact(c)}
          className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedId === c.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg mr-3 flex-shrink-0">
            {initials(c.name)}
          </div>
          <div className="hidden xl:block overflow-hidden">
            <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">{c.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{c.role}</p>
            {lastMsg(c.id, idx) && (
              <p className="text-xs text-gray-300 dark:text-gray-600 truncate mt-0.5">{lastMsg(c.id, idx)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ChatList
