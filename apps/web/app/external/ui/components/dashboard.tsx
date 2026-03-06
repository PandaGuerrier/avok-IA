import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import { BookmarkPlus } from 'lucide-react'

interface CalendarEvent {
  id: number
  title: string
  description: string
}

interface CalendarDay {
  date: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  events: CalendarEvent[]
}

interface DashboardProps {
  calendar: CalendarDay[]
  onAlibisClick: (content: string) => void
}

const DAY_OFFSET: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

// Noms français possibles renvoyés par l'IA
const FR_TO_EN: Record<string, string> = {
  lundi: 'monday', mardi: 'tuesday', mercredi: 'wednesday',
  jeudi: 'thursday', vendredi: 'friday', samedi: 'saturday', dimanche: 'sunday',
}

function buildCalendarEvents(calendar: CalendarDay[]) {
  const today = new Date()
  const currentDayOfWeek = today.getDay()

  return calendar.flatMap(({ date, events }) => {
    const normalised = FR_TO_EN[date?.toLowerCase()] ?? date?.toLowerCase()
    const targetDay = DAY_OFFSET[normalised]
    if (targetDay === undefined) return []

    let diff = targetDay - currentDayOfWeek
    if (diff < -3) diff += 7
    const eventDate = new Date(today)
    eventDate.setDate(today.getDate() + diff)

    let dateStr: string
    try {
      dateStr = eventDate.toISOString().split('T')[0]
    } catch {
      return []
    }

    return (events ?? []).map((event, i) => ({
      id: String(event.id ?? i),
      title: event.title ?? '',
      start: `${dateStr}T${String(8 + i).padStart(2, '0')}:00:00`,
      end: `${dateStr}T${String(9 + i).padStart(2, '0')}:30:00`,
      extendedProps: { description: event.description ?? '', dayName: normalised },
    }))
  })
}

export function Dashboard({ calendar, onAlibisClick }: DashboardProps) {
  const fcEvents = buildCalendarEvents(calendar)

  const handleEventClick = (info: any) => {
    const { title, extendedProps } = info.event
    const content = [
      `[Emploi du temps — ${extendedProps.dayName}]`,
      `Cours: ${title}`,
      extendedProps.description ? `Description: ${extendedProps.description}` : '',
    ]
      .filter(Boolean)
      .join('\n')
    onAlibisClick(content)
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Emploi du temps</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">Clique sur un cours pour créer un alibi</p>
        </div>
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next', center: 'title', right: '' }}
          events={fcEvents}
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          allDaySlot={false}
          height="auto"
          contentHeight="auto"
          slotLabelInterval="01:00"
          slotLabelFormat={{ hour: 'numeric', meridiem: 'short' }}
          eventClick={handleEventClick}
          eventClassNames="cursor-pointer"
        />
      </div>
    </div>
  )
}
