import { useState } from 'react'
import usePageProps from '#common/ui/hooks/use_page_props'
import AppLayout from '#common/ui/components/app_layout'
import GamePauseBanner from '#game/ui/components/GamePauseBanner'
import { Navbar } from '../components/navbar'
import { Dashboard } from '../components/dashboard'
import { GradesPage } from '../components/grade_page'
import { AttendancePage } from '../components/attendancePage'
import { IncidentsPage } from '../components/incidents_page'
import AlibisModal from '../components/AlibisModal'
import GameStoreProvider, { type GameStoreInfo } from '#game/ui/components/GameStoreProvider'

interface CalendarEvent {
  id: number
  title: string
  description: string
}

interface CalendarDay {
  date: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  events: CalendarEvent[]
}

interface Note {
  coef: number
  note: number
  date: string
}

interface Props {
  game: GameStoreInfo
  notes: {
    calendar: CalendarDay[]
    notes: Note[]
  }
}

export default function Note_track() {
  const { game, notes } = usePageProps<Props>()
  const gameUuid = game.uuid

  const [currentPage, setCurrentPage] = useState('dashboard')
  const [alibisModal, setAlibisModal] = useState<{ content: string } | null>(null)

  return (
    <GameStoreProvider game={game}>
    <AppLayout layout="sidebar" removePadding hideBottomNav>
    <GamePauseBanner gameUuid={gameUuid} />
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-950">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && (
          <Dashboard
            calendar={notes.calendar}
            onAlibisClick={(content) => setAlibisModal({ content })}
          />
        )}
        {currentPage === 'grades' && (
          <GradesPage
            notes={notes.notes}
            onAlibisClick={(content) => setAlibisModal({ content })}
          />
        )}
        {currentPage === 'attendance' && (
          <AttendancePage onAlibisClick={(content) => setAlibisModal({ content })} />
        )}
        {currentPage === 'incidents' && <IncidentsPage />}
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
    </GameStoreProvider>
  )
}
