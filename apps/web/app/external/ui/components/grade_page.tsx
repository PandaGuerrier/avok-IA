import { BookmarkPlus } from 'lucide-react'

interface Note {
  coef: number
  note: number
  date: string
}

interface GradesPageProps {
  notes: Note[]
  onAlibisClick: (content: string) => void
}

const getColor = (note: number) => {
  if (note >= 14) return 'bg-green-100'
  if (note >= 10) return 'bg-blue-100'
  if (note >= 7) return 'bg-orange-100'
  return 'bg-red-100'
}

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString('fr-FR')
  } catch {
    return date
  }
}

const overallAverage = (notes: Note[]) => {
  if (!notes.length) return '—'
  const totalCoef = notes.reduce((sum, n) => sum + n.coef, 0)
  const weighted = notes.reduce((sum, n) => sum + n.note * n.coef, 0)
  return totalCoef > 0 ? (weighted / totalCoef).toFixed(2) : '—'
}

export function GradesPage({ notes, onAlibisClick }: GradesPageProps) {
  const avg = overallAverage(notes)

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Mes Notes</h2>
          <div className="mb-8 text-lg font-semibold text-blue-600 dark:text-blue-400">
            Moyenne générale:{' '}
            <span className="text-2xl text-blue-700 dark:text-blue-300">{avg}/20</span>
          </div>

          {notes.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500 text-sm">Aucune note disponible.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((n, i) => (
              <div
                key={i}
                className={`${getColor(n.note)} rounded-xl p-5 shadow hover:shadow-lg transition relative group`}
              >
                <button
                  onClick={() =>
                    onAlibisClick(
                      `[Note scolaire]\nNote: ${n.note}/20\nCoefficient: ${n.coef}\nDate: ${formatDate(n.date)}`
                    )
                  }
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-500"
                  title="Utiliser comme alibi"
                >
                  <BookmarkPlus size={18} />
                </button>
                <p className="text-xs text-gray-500 mb-1">Devoir {i + 1} — {formatDate(n.date)}</p>
                <p className="text-3xl font-bold text-gray-800">{n.note}<span className="text-base font-normal text-gray-500">/20</span></p>
                <p className="text-xs text-gray-500 mt-1">Coefficient {n.coef}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
