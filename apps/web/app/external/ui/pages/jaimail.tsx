import { useState, useEffect } from 'react'
import usePageProps from '#common/ui/hooks/use_page_props'
import AppLayout from '#common/ui/components/app_layout'
import { useGameStore } from '#game/ui/store/gameStore'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import EmailList from '../components/EmailList'
import EmailDetail from '../components/EmailDetail'
import Toast from '../components/Toast'
import AlibisModal from '../components/AlibisModal'
import type { Email } from '../schema/mailSchema'

interface MailData {
  mailId?: number
  subject?: string
  content?: string
  body?: string
  sender?: string
  isRead?: boolean
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
  mails: MailData[]
}

function mapMailsToEmails(mails: MailData[]): Email[] {
  return (mails ?? []).map((m, i) => {
    const body = m.content ?? m.body ?? ''
    return {
      id: m.mailId ?? i + 1,
      folder: 'inbox' as const,
      sender: m.sender ?? 'Inconnu',
      subject: m.subject ?? '(Sans objet)',
      snippet: body.slice(0, 80) + (body.length > 80 ? '...' : ''),
      body,
      time: "Dans l'affaire",
      unread: !(m.isRead ?? false),
      isStarred: false,
    }
  })
}

export default function Jaimail() {
  const { game, mails } = usePageProps<Props>()
  const gameUuid = game.uuid

  const init = useGameStore((s) => s.init)

  const [emails, setEmails] = useState<Email[]>(() => mapMailsToEmails(mails))

  // Initialize the game store without pausing
  useEffect(() => {
    init({
      gameUuid: game.uuid,
      startAtMs: game.startAt ? new Date(game.startAt as string).getTime() : null,
      resumeAtMs: game.resumeAt ? new Date(game.resumeAt as string).getTime() : null,
      pausedAtMs: game.isPaused && game.pausedAt ? new Date(game.pausedAt as string).getTime() : null,
      isPaused: game.isPaused ?? false,
      guiltyPercentage: game.guiltyPourcentage ?? 50,
    })
  }, [init, game])
  const [activeTab, setActiveTab] = useState('inbox')
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [alibisModal, setAlibisModal] = useState<{ content: string } | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const displayedEmails = emails.filter((email) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        email.subject.toLowerCase().includes(q) ||
        email.sender.toLowerCase().includes(q) ||
        email.body.toLowerCase().includes(q)
      )
    }
    if (activeTab === 'starred') return email.isStarred || email.folder === 'starred'
    return email.folder === activeTab
  })

  const openEmail = (email: Email) => {
    setEmails(emails.map((e) => (e.id === email.id ? { ...e, unread: false } : e)))
    setSelectedEmail(email)
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setSelectedEmail(null)
    setSearchQuery('')
  }

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    const email = emails.find((em) => em.id === id)
    if (email?.folder === 'trash') {
      setEmails(emails.filter((em) => em.id !== id))
      showToast('Message supprimé définitivement.')
    } else {
      setEmails(emails.map((em) => (em.id === id ? { ...em, folder: 'trash' } : em)))
      showToast('Conversation mise à la corbeille.')
    }
  }

  const handleArchive = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setEmails(emails.map((email) => (email.id === id ? { ...email, folder: 'archive' } : email)))
    showToast('Conversation archivée.')
  }

  const handleSnooze = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setEmails(emails.map((email) => (email.id === id ? { ...email, folder: 'snoozed' } : email)))
    showToast('Conversation mise en attente.')
  }

  const toggleUnread = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    const email = emails.find((em) => em.id === id)
    setEmails(emails.map((em) => (em.id === id ? { ...em, unread: !em.unread } : em)))
    showToast(email?.unread ? 'Marqué comme lu.' : 'Marqué comme non lu.')
  }

  const toggleStarred = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    const email = emails.find((em) => em.id === id)
    const currentlyStarred = email?.isStarred || email?.folder === 'starred'
    setEmails(
      emails.map((em) => {
        if (em.id !== id) return em
        const newFolder = em.folder === 'starred' && currentlyStarred ? 'inbox' : em.folder
        return { ...em, isStarred: !currentlyStarred, folder: newFolder }
      })
    )
    showToast(currentlyStarred ? 'Retiré des favoris.' : 'Ajouté aux favoris.')
  }

  const toggleSelectAll = () => {}
  const toggleSelectEmail = () => {}

  return (
    <AppLayout layout="sidebar" removePadding hideBottomNav>
    <div
      className={`flex flex-col h-[calc(100vh-4rem)] w-full font-sans relative overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'dark bg-slate-950 text-slate-200' : 'bg-slate-50 text-brand-dark'
      }`}
    >
      <Header
        isSidebarOpen={true}
        setIsSidebarOpen={() => {}}
        handleTabChange={handleTabChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          setIsComposeOpen={() => {}}
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          isDarkMode={isDarkMode}
        />

        <main className="flex-1 bg-white dark:bg-slate-900 sm:m-4 sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors relative">
          {selectedEmail ? (
            <EmailDetail
              selectedEmail={selectedEmail}
              setSelectedEmail={setSelectedEmail}
              onAlibisClick={(content) => setAlibisModal({ content })}
            />
          ) : (
            <EmailList
              displayedEmails={displayedEmails}
              searchQuery={searchQuery}
              openEmail={openEmail}
              showToast={showToast}
              handleArchive={handleArchive}
              handleDelete={handleDelete}
              toggleUnread={toggleUnread}
              selectedEmails={[]}
              toggleSelectAll={toggleSelectAll}
              toggleSelectEmail={toggleSelectEmail}
              activeTab={activeTab}
              handleEmptyTrash={() => {
                setEmails(emails.filter((em) => em.folder !== 'trash'))
                showToast('La corbeille a été vidée.')
              }}
              toggleStarred={toggleStarred}
              handleSnooze={handleSnooze}
            />
          )}
          <Toast message={toast} />
        </main>
      </div>

      {alibisModal && (
        <AlibisModal
          gameUuid={gameUuid}
          defaultContent={alibisModal.content}
          onClose={() => setAlibisModal(null)}
        />
      )}
    </div>
    </AppLayout>
  )
}
