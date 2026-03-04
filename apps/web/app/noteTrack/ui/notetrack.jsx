import { useState } from 'react'
import { Navbar } from './navbar'
import { Dashboard } from './dashboard'
import { GradesPage } from './grades_page'
import { AttendancePage } from './attendance_page'
import { IncidentsPage } from './incidents_page'

export default function NoteTrack() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  return (
    <div className="flex h-screen bg-gray-100">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'grades' && <GradesPage />}
        {currentPage === 'attendance' && <AttendancePage />}
        {currentPage === 'incidents' && <IncidentsPage />}
      </div>
    </div>
  )
}
