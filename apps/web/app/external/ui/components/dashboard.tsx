import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'

const subjectColors = {
  Mathématiques: { backgroundColor: '#dcfce7', textColor: '#166534' },
  Anglais: { backgroundColor: '#dbeafe', textColor: '#1e40af' },
  Histoire: { backgroundColor: '#f3e8ff', textColor: '#6b21a8' },
  Sciences: { backgroundColor: '#fed7aa', textColor: '#92400e' },
  Français: { backgroundColor: '#fee2e2', textColor: '#991b1b' },
}

const calendarEvents = [
  { title: 'Mathématiques', start: '2026-03-03T09:00:00', end: '2026-03-03T10:30:00', ...subjectColors['Mathématiques'] },
  { title: 'Anglais', start: '2026-03-03T11:00:00', end: '2026-03-03T12:00:00', ...subjectColors['Anglais'] },
  { title: 'Sciences', start: '2026-03-04T10:00:00', end: '2026-03-04T11:30:00', ...subjectColors['Sciences'] },
  { title: 'Histoire', start: '2026-03-05T09:00:00', end: '2026-03-05T10:00:00', ...subjectColors['Histoire'] },
  { title: 'Français', start: '2026-03-06T14:00:00', end: '2026-03-06T15:00:00', ...subjectColors['Français'] },
  { title: 'Mathématiques', start: '2026-03-06T10:00:00', end: '2026-03-06T11:30:00', ...subjectColors['Mathématiques'] },
]

const assignments = [
  { subject: 'Mathématiques', title: 'Exercice 3-4 (Dérivées)', dueDate: '2026-03-05', priority: 'high' },
  { subject: 'Anglais', title: 'Reading comprehension Chapter 5', dueDate: '2026-03-06', priority: 'medium' },
  { subject: 'Histoire', title: 'Rédaction sur la Révolution Française', dueDate: '2026-03-07', priority: 'high' },
  { subject: 'Sciences', title: 'Laboratoire report', dueDate: '2026-03-04', priority: 'medium' },
  { subject: 'Français', title: 'Analyse texte "Le Père Goriot"', dueDate: '2026-03-08', priority: 'low' },
]

export function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-6 h-full p-6">
      <div className="col-span-1 bg-white rounded-lg shadow-lg p-6 overflow-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Emploi du temps</h2>
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next', center: 'title', right: '' }}
          events={calendarEvents}
          slotMinTime="07:00:00"
          slotMaxTime="17:00:00"
          allDaySlot={false}
          height="auto"
          contentHeight="auto"
          slotLabelInterval="01:00"
          slotLabelFormat={{ hour: 'numeric', meridiem: 'short' }}
        />
      </div>

      <div className="col-span-2 bg-white rounded-lg shadow-lg p-6 overflow-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Travaux à faire</h2>
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 rounded-lg bg-gray-50 transition hover:shadow-md ${
                assignment.priority === 'high'
                  ? 'border-red-500'
                  : assignment.priority === 'medium'
                    ? 'border-yellow-500'
                    : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-blue-600 text-sm">{assignment.subject}</p>
                  <p className="text-gray-800 font-medium">{assignment.title}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    assignment.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : assignment.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                  }`}
                >
                  {assignment.priority === 'high' ? 'Urgent' : assignment.priority === 'medium' ? 'Normal' : 'Optionnel'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                À rendre le:{' '}
                <span className="font-semibold text-gray-700">
                  {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
