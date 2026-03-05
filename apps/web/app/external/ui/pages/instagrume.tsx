import React, { useState } from 'react'
import usePageProps from '#common/ui/hooks/use_page_props'
import AppLayout from '#common/ui/components/app_layout'
import Sidebar from '../components/layout/Sidebar'
import PostCard from '../components/feed/PostCard'
import ChatList from '../components/messages/ChatList'
import ChatWindow from '../components/messages/ChatWindow'
import AlibisModal from '../components/AlibisModal'
import GameStoreProvider, { type GameStoreInfo } from '#game/ui/components/GameStoreProvider'

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

interface Post {
  postId: number
  content: string
  imageUrl: string
  comments: { id: number; content: string; author: string }[]
}

interface Props {
  game: GameStoreInfo
  insta: { conversations: Conversation[]; posts: Post[] }
  contacts: Contact[]
}

const Instagrume: React.FC = () => {
  const { game, insta, contacts } = usePageProps<Props>()
  const gameUuid = game.uuid

  const [activeTab, setActiveTab] = useState<'feed' | 'messages' | 'profile' | 'search'>('feed')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [alibisModal, setAlibisModal] = useState<{ content: string } | null>(null)

  const normaliseMessages = (raw: any[]): Message[] =>
    (raw ?? []).map((m, i) => ({
      id: m.id ?? i,
      content: m.content ?? m.text ?? m.message ?? '',
      isMine: m.isMine ?? m.is_mine ?? false,
    }))

  const messagesForContact = (contactId: number): Message[] => {
    const byId = insta.conversations.find((c) => c.conversationId === contactId)
    if (byId) return normaliseMessages(byId.messages)
    const idx = contacts.findIndex((c) => c.id === contactId)
    return normaliseMessages(insta.conversations[idx]?.messages)
  }

  return (
    <GameStoreProvider game={game}>
      <AppLayout layout="sidebar" removePadding hideBottomNav>
        <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 text-black dark:text-white font-sans overflow-hidden">
          <Sidebar activeTab={activeTab} onNavigate={(tab: any) => setActiveTab(tab)} />

          <main
            className={`flex-1 flex flex-col h-full transition-all ${
              activeTab === 'messages'
                ? 'items-stretch overflow-hidden'
                : 'items-center p-4 md:p-8 overflow-y-auto'
            }`}
          >
            {/* FEED */}
            {activeTab === 'feed' && (
              <div className="max-w-[850px] w-full mt-4 flex flex-col items-center">
                {insta.posts.length === 0 && (
                  <p className="text-gray-400 text-sm mt-8">Aucun post disponible.</p>
                )}
                {insta.posts.map((post, i) => (
                  <PostCard
                    key={post.postId ?? i}
                    post={post}
                    onAlibisClick={(content) => setAlibisModal({ content })}
                  />
                ))}
              </div>
            )}

            {/* SEARCH */}
            {activeTab === 'search' && (
              <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
                <p className="text-xl italic">Recherche en cours de préparation...</p>
              </div>
            )}

            {/* MESSAGES */}
            {activeTab === 'messages' && (
              <div className="w-full h-screen flex bg-white dark:bg-gray-900 overflow-hidden border-l border-gray-200 dark:border-gray-700">
                <div className="w-1/3 min-w-[280px] max-w-[380px] border-r border-gray-200 dark:border-gray-700">
                  <ChatList
                    contacts={contacts}
                    conversations={insta.conversations}
                    onSelectContact={(c) => setSelectedContact(c)}
                    selectedId={selectedContact?.id}
                  />
                </div>
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
                  {selectedContact ? (
                    <ChatWindow
                      contact={selectedContact}
                      messages={messagesForContact(selectedContact.id)}
                      onAlibisClick={(content) => setAlibisModal({ content })}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-gray-50/30 dark:bg-gray-800/30">
                      <div className="w-24 h-24 border border-black dark:border-gray-600 rounded-full flex items-center justify-center mb-4">
                        <span className="text-4xl">📩</span>
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                        Sélectionne une conversation
                      </h3>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                        Clique sur des messages pour les utiliser comme alibi
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PROFILE — placeholder */}
            {activeTab === 'profile' && (
              <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
                <p className="text-xl italic">Profil</p>
              </div>
            )}
          </main>

          {alibisModal && (
            <AlibisModal
              gameUuid={gameUuid}
              defaultContent={alibisModal.content}
              onClose={() => setAlibisModal(null)}
            />
          )}
        </div>
      </AppLayout>
    </GameStoreProvider>
  )
}

export default Instagrume
