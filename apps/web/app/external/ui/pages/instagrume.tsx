import React, { useState, useEffect } from 'react'
import { Grid3x3, Bookmark, Tag } from 'lucide-react'
import usePageProps from '#common/ui/hooks/use_page_props'
import AppLayout from '#common/ui/components/app_layout'
import { useGameStore } from '#game/ui/store/gameStore'
import useUser from '#auth/ui/hooks/use_user'
import Sidebar from '../components/layout/Sidebar'
import PostCard from '../components/feed/PostCard'
import ChatList from '../components/messages/ChatList'
import ChatWindow from '../components/messages/ChatWindow'
import AlibisModal from '../components/AlibisModal'
import GameTour from '#game/ui/components/GameTour'
import { useTutorialStore } from '#game/ui/store/tutorialStore'

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
  username?: string
  comments: { id: number; content: string; author: string }[]
}

interface Props {
  game: {
    uuid: string
    startAt: unknown
    resumeAt: unknown | null
    pausedAt: unknown | null
    isPaused: boolean | null
    guiltyPourcentage: number | null
  }
  insta: { conversations: Conversation[]; posts: Post[] }
  contacts: Contact[]
}

const Instagrume: React.FC = () => {
  const { game, insta, contacts } = usePageProps<Props>()
  const user = useUser()
  const gameUuid = game.uuid

  const init = useGameStore((s) => s.init)
  const markTutorialAction = useTutorialStore((s) => s.markAction)

  const [activeTab, setActiveTab] = useState<'feed' | 'messages' | 'profile' | 'search'>('feed')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [alibisModal, setAlibisModal] = useState<{ content: string; source?: 'post' | 'conv' } | null>(null)

  // Initialize the game store without pausing
  useEffect(() => {
    init({
      gameUuid: game.uuid,
      startAtMs: game.startAt ? new Date(game.startAt as string).getTime() : null,
      guiltyPercentage: game.guiltyPourcentage ?? 50,
    })
  }, [init, game])

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

  console.log(insta)

  return (
    <AppLayout layout="sidebar" removePadding hideBottomNav>
      <GameTour gameUuid={gameUuid} page="instagrume" />
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
                {(insta.posts ?? []).length === 0 && (
                  <p className="text-gray-400 text-sm mt-8">Aucun post disponible.</p>
                )}
                {(insta.posts ?? []).map((post, i) => (
                  <PostCard
                    key={post.postId ?? i}
                    post={post}
                    onAlibisClick={(content) => setAlibisModal({ content, source: 'post' })}
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
                      onAlibisClick={(content) => setAlibisModal({ content, source: 'conv' })}
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

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <div className="w-full max-w-[935px]">
                {/* Header */}
                <div className="flex items-start gap-12 px-4 py-8 border-b border-gray-200 dark:border-gray-700">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="avatar"
                        className="w-[150px] h-[150px] rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                      />
                    ) : (
                      <div className="w-[150px] h-[150px] rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold select-none">
                        {(user?.pseudo ?? user?.firstName ?? 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-4 flex-1 min-w-0">
                    {/* Username + actions */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xl font-light text-gray-900 dark:text-white truncate">
                        {user?.pseudo ?? [user?.firstName, user?.lastName].filter(Boolean).join(' ') ?? 'Utilisateur'}
                      </span>
                      <button className="px-4 py-1.5 text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        Modifier le profil
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <span className="font-semibold">{(insta.posts ?? []).length}</span>{' '}
                        <span className="text-gray-500 dark:text-gray-400">publication{(insta.posts ?? []).length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        <span className="font-semibold">248</span>{' '}
                        <span className="text-gray-500 dark:text-gray-400">abonnés</span>
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        <span className="font-semibold">183</span>{' '}
                        <span className="text-gray-500 dark:text-gray-400">abonnements</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="text-sm text-gray-900 dark:text-white leading-snug">
                      {user?.firstName && user?.lastName && (
                        <p className="font-semibold">{user.firstName} {user.lastName}</p>
                      )}
                      {user?.age && (
                        <p className="text-gray-500 dark:text-gray-400">{user.age} ans</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tab bar */}
                <div className="flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                  <button className="flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-gray-900 dark:text-white border-t border-gray-900 dark:border-white -mb-px">
                    <Grid3x3 size={12} />
                    Publications
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <Bookmark size={12} />
                    Enregistrés
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <Tag size={12} />
                    Identifiés
                  </button>
                </div>

                {/* Grid */}
                {(insta.posts ?? []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Grid3x3 size={48} strokeWidth={1} className="mb-4" />
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">Aucune publication</p>
                    <p className="text-sm mt-1 text-gray-500">Les photos apparaîtront ici.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1 mt-1">
                      <p className="text-sm text-gray-500 col-span-full text-center mt-4">
                        Aucuns posts pour le moment...
                      </p>
                  </div>
                )}
              </div>
            )}
          </main>

          {alibisModal && (
            <AlibisModal
              gameUuid={gameUuid}
              defaultContent={alibisModal.content}
              onClose={() => setAlibisModal(null)}
              onSaved={() => {
                if (alibisModal.source === 'post') markTutorialAction('instaPostAlibi', gameUuid)
                if (alibisModal.source === 'conv') markTutorialAction('instaConvAlibi', gameUuid)
              }}
            />
          )}
        </div>
        <style>{`
          /* Scrollbar styles for dark mode */
          .dark ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .dark ::-webkit-scrollbar-track {
            background-color: #0f172a;
          }
          .dark ::-webkit-scrollbar-thumb {
            background-color: #475569;
            border-radius: 4px;
          }
          .dark ::-webkit-scrollbar-thumb:hover {
            background-color: #64748b;
          }
          /* Firefox scrollbar */
          .dark {
            scrollbar-color: #475569 #0f172a;
            scrollbar-width: thin;
          }
        `}</style>
      </AppLayout>
    )
}

export default Instagrume
