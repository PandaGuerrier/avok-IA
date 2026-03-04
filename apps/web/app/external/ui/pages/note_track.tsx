import { useState } from 'react'
import { Navbar } from '../components/navbar'
import { Dashboard } from '../components/dashboard'
import { GradesPage } from '../components/grade_page'
import { AttendancePage } from '../components/attendancePage'
import { IncidentsPage } from '../components/incidents_page'

export default function Note_track() {
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
