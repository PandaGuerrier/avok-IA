import { useState, useEffect } from 'react'
import usePageProps from '#common/ui/hooks/use_page_props'
import AppLayout from '#common/ui/components/app_layout'
import { useGameStore } from '#game/ui/store/gameStore'
import { Navbar } from '../components/navbar'
import { Dashboard } from '../components/dashboard'
import { GradesPage } from '../components/grade_page'
import { AttendancePage } from '../components/attendancePage'
import { IncidentsPage } from '../components/incidents_page'
import AlibisModal from '../components/AlibisModal'
import GameTour from '#game/ui/components/GameTour'

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
  game: {
    uuid: string
    startAt: unknown
    resumeAt: unknown | null
    pausedAt: unknown | null
    isPaused: boolean | null
    guiltyPourcentage: number | null
  }
  notes: {
    calendar: CalendarDay[]
    notes: Note[]
  }
}

export default function Note_track() {
  const { game, notes } = usePageProps<Props>()
  const gameUuid = game.uuid

  const init = useGameStore((s) => s.init)

  const [currentPage, setCurrentPage] = useState('dashboard')
  const [alibisModal, setAlibisModal] = useState<{ content: string } | null>(null)

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

  return (
    <AppLayout layout="sidebar" removePadding hideBottomNav>
    <GameTour gameUuid={gameUuid} page="notetrack" />
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
  )
}
