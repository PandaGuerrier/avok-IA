import { BookmarkPlus } from 'lucide-react'

interface AttendanceItem {
  type: string
  count: number
  color: string
  last: string
  reason: string
}

interface AttendancePageProps {
  onAlibisClick: (content: string) => void
}

const attendance: AttendanceItem[] = [
  { type: 'Retards', count: 3, color: 'bg-cyan-500', last: '26 Février 2026', reason: 'Transport' },
  { type: 'Absences', count: 7, color: 'bg-yellow-500', last: '9 Février 2026', reason: 'Malade' },
  { type: 'Exclusion', count: 1, color: 'bg-red-500', last: '18 Décembre 2025', reason: "Voir Carnet d'incidents" },
]

export function AttendancePage({ onAlibisClick }: AttendancePageProps) {
  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Assiduité</h2>
          <div className="space-y-4">
            {attendance.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${item.color}`} />
                  <span className="text-lg font-medium text-gray-800 dark:text-white">{item.type}</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Dernier : {item.last}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Raison : {item.reason}</span>
                <span className="text-2xl font-bold text-gray-800 dark:text-white">{item.count}</span>
                <button
                  onClick={() =>
                    onAlibisClick(
                      `[Assiduité scolaire]\n${item.type}: ${item.count}\nDernier: ${item.last}\nRaison: ${item.reason}`
                    )
                  }
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-500 ml-2"
                  title="Utiliser comme alibi"
                >
                  <BookmarkPlus size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
